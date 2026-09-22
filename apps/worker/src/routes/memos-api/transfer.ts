import {
  createImportTaskRequestSchema,
  importBundleSchema,
  importOptionsSchema,
} from "@flaremo/contracts";
import { attachments } from "@flaremo/db";
import {
  assertAttachmentStorageQuota,
  assertMemoCountQuota,
  createDataTask,
  dataTaskToDto,
  exportData,
  failDataTask,
  getAttachmentById,
  getDataTask,
  importData,
  listDataTasks,
  runImportTask,
  streamExportData,
  updateDataTask,
} from "@flaremo/domain";
import { parseAttachmentsResourceName } from "@flaremo/memos";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray, isNull } from "drizzle-orm";
import type { Hono } from "hono";
import { MAX_INLINE_EXPORT_BYTES } from "../../attachment-http";
import { getRequestContext, type HonoBindings } from "../../context";
import { jsonError } from "../../http";
import {
  arrayBufferToBase64,
  bundleAttachmentBytes,
  errorMessage,
  estimateBundleJsonBytes,
  importBundleUpload,
  sanitizeFilename,
} from "./bundle";

export function registerTransferRoutes(app: Hono<HonoBindings>) {
  app.get("/export", async (c) => {
    try {
      const { db, user } = await getRequestContext(c);
      const includeBinary = c.req.query("include_binary") !== "false";
      // Build the metadata bundle and estimate the final JSON size before
      // deciding whether it fits the inline response limit. The 32 MiB budget
      // counts the complete serialized bundle (memos + relations + shares +
      // attachment metadata), not just attachment bytes.
      const bundle = await exportData(db, user);
      const estimatedBytes = estimateBundleJsonBytes(bundle);
      if (includeBinary) {
        const attachmentBytes = bundle.attachments.reduce(
          (total, attachment) =>
            attachment.state === "ready" ? total + attachment.size : total,
          0,
        );
        // Base64 inflates binary by ~33%; the full JSON string adds the
        // attachment bytes on top of the metadata estimate.
        const totalEstimate =
          estimatedBytes + Math.ceil((attachmentBytes * 4) / 3);
        if (totalEstimate > MAX_INLINE_EXPORT_BYTES) {
          return c.json(
            {
              error: {
                message:
                  "Export exceeds 32 MiB. Create an export task instead: POST /api/v1/export/tasks",
              },
            },
            413,
          );
        }
      } else if (estimatedBytes > MAX_INLINE_EXPORT_BYTES) {
        return c.json(
          {
            error: {
              message:
                "Metadata-only export exceeds 32 MiB. Create an export task instead: POST /api/v1/export/tasks",
            },
          },
          413,
        );
      }
      // Bundle rows already carry every exported attachment field except the
      // R2 object key, so one batched key lookup replaces the previous
      // per-attachment getAttachmentById re-query (which additionally re-ran
      // the memo access checks the export scope had already established).
      const readyNames = bundle.attachments
        .filter((attachment) => attachment.state === "ready")
        .map((attachment) => attachment.name);
      const r2Keys = new Map<string, string>();
      if (readyNames.length > 0) {
        const rows = await db
          .select({ id: attachments.id, r2Key: attachments.r2Key })
          .from(attachments)
          .where(
            and(
              inArray(attachments.id, readyNames),
              eq(attachments.userId, user.id),
              isNull(attachments.deletedAt),
              eq(attachments.state, "ready"),
            ),
          );
        for (const row of rows) r2Keys.set(row.id, row.r2Key);
      }
      const exportedAttachments = [];
      for (const attachment of bundle.attachments) {
        if (!includeBinary || attachment.state !== "ready") {
          exportedAttachments.push(attachment);
          continue;
        }
        const r2Key = r2Keys.get(attachment.name);
        const object = r2Key ? await c.env.ATTACHMENTS.get(r2Key) : undefined;
        if (!object) {
          exportedAttachments.push({
            ...attachment,
            state: "missing" as const,
          });
          continue;
        }
        const body = await object.arrayBuffer();
        exportedAttachments.push({
          ...attachment,
          data_base64: arrayBufferToBase64(body),
        });
      }
      return c.json({ ...bundle, attachments: exportedAttachments });
    } catch (error) {
      return jsonError(c, error);
    }
  });

  app.post(
    "/import",
    zValidator("query", importOptionsSchema),
    zValidator("json", importBundleSchema),
    async (c) => {
      const writtenKeys: string[] = [];
      try {
        const { db, user, limits, userLimits } = await getRequestContext(c);
        const bundle = c.req.valid("json");
        await assertAttachmentStorageQuota(
          db,
          limits,
          bundleAttachmentBytes(bundle.attachments),
          { userLimits, userId: user.id },
        );
        await assertMemoCountQuota(
          db,
          userLimits,
          user.id,
          bundle.memos.length,
        );
        const uploaded = await importBundleUpload(
          c.env,
          user.id,
          bundle.attachments,
          writtenKeys,
        );
        if (!uploaded) {
          return c.json(
            { error: { message: "Imported attachment exceeds 25 MiB" } },
            413,
          );
        }
        const result = await importData(db, user, bundle, {
          attachmentR2Keys: uploaded.r2Keys,
          attachmentEtags: uploaded.r2Etags,
          conflict: c.req.valid("query").conflict,
        });
        if (result.cleanupR2Keys.length > 0) {
          try {
            await c.env.ATTACHMENTS.delete(result.cleanupR2Keys);
          } catch (error) {
            console.error(
              JSON.stringify({
                message: "import R2 cleanup failed",
                error: error instanceof Error ? error.message : String(error),
                count: result.cleanupR2Keys.length,
              }),
            );
          }
        }
        const { cleanupR2Keys: _cleanupR2Keys, ...publicResult } = result;
        return c.json(publicResult);
      } catch (error) {
        if (writtenKeys.length > 0) {
          await c.env.ATTACHMENTS.delete(writtenKeys);
        }
        return jsonError(c, error);
      }
    },
  );
  // ---------------------------------------------------------------------------
  // Data-transfer task endpoints (large export/import)
  // ---------------------------------------------------------------------------

  app.get("/export/tasks", async (c) => {
    try {
      const { db, user } = await getRequestContext(c);
      const tasks = await listDataTasks(db, user);
      return c.json({ tasks: tasks.map(dataTaskToDto) });
    } catch (error) {
      return jsonError(c, error);
    }
  });

  app.post("/export/tasks", async (c) => {
    let taskId: string | undefined;
    try {
      const { db, user } = await getRequestContext(c);
      const task = await createDataTask(db, user, { kind: "export" });
      taskId = task.id;
      await updateDataTask(db, task.id, {
        status: "running",
        phase: "scanning",
      });

      const prefix = `exports/${task.id}`;
      const chunkKeys: Array<{
        kind: string;
        key: string;
        recordCount: number;
      }> = [];
      const attachmentRefs: Array<{
        id: string;
        filename: string;
        content_type: string | null;
        size: number;
      }> = [];

      await streamExportData(db, user, async (chunk) => {
        const sequence = chunkKeys.length + 1;
        const key = `${prefix}/data/${chunk.kind}-${String(sequence).padStart(4, "0")}.ndjson`;
        const recordCount =
          chunk.records.length > 0 ? chunk.records.split("\n").length : 0;
        await c.env.ATTACHMENTS.put(key, chunk.records, {
          httpMetadata: { contentType: "application/x-ndjson" },
        });
        chunkKeys.push({ kind: chunk.kind, key, recordCount });
        if (chunk.kind === "attachments") {
          for (const line of chunk.records.split("\n").filter(Boolean)) {
            const record = JSON.parse(line) as {
              id: string;
              filename: string;
              content_type: string | null;
              size: number;
            };
            attachmentRefs.push({
              id: record.id,
              filename: record.filename,
              content_type: record.content_type,
              size: record.size,
            });
          }
        }
        await updateDataTask(db, task.id, {
          phase: "writing",
          progressDone: chunkKeys.length,
          progressTotal: 5,
        });
      });

      const manifest = {
        format_version: 1,
        exported_at: new Date().toISOString(),
        counts: {
          memos: 0,
          attachments: attachmentRefs.length,
          relations: 0,
          shares: 0,
        },
        data_chunks: chunkKeys,
        attachments: attachmentRefs,
      };
      // Re-derive counts from chunk record counts for accuracy.
      for (const chunk of chunkKeys) {
        if (chunk.kind === "memos") manifest.counts.memos += chunk.recordCount;
        if (chunk.kind === "relations")
          manifest.counts.relations += chunk.recordCount;
        if (chunk.kind === "shares")
          manifest.counts.shares += chunk.recordCount;
      }
      const manifestKey = `${prefix}/manifest.json`;
      await c.env.ATTACHMENTS.put(manifestKey, JSON.stringify(manifest), {
        httpMetadata: { contentType: "application/json" },
      });

      const done = await updateDataTask(db, task.id, {
        status: "succeeded",
        phase: "completed",
        manifestKey,
        progressDone: chunkKeys.length,
        progressTotal: chunkKeys.length,
        completedAt: new Date().toISOString(),
      });
      if (!done) {
        return c.json(
          { error: "export task was not found after finalization" },
          500,
        );
      }
      return c.json({ task: dataTaskToDto(done!) }, 202);
    } catch (error) {
      if (taskId) {
        const context = await getRequestContext(c).catch(() => undefined);
        if (context) {
          await failDataTask(
            context.db,
            taskId,
            "export_failed",
            errorMessage(error),
          ).catch(() => undefined);
        }
      }
      return jsonError(c, error);
    }
  });

  app.get("/export/tasks/:id", async (c) => {
    try {
      const { db, user } = await getRequestContext(c);
      const task = await getDataTask(db, user, c.req.param("id"));
      return c.json({ task: dataTaskToDto(task) });
    } catch (error) {
      return jsonError(c, error);
    }
  });

  app.get("/export/tasks/:id/manifest", async (c) => {
    try {
      const { db, user } = await getRequestContext(c);
      const task = await getDataTask(db, user, c.req.param("id"));
      if (task.status !== "succeeded" || !task.manifestKey) {
        return c.json(
          { error: { message: "Export task has not completed yet" } },
          409,
        );
      }
      const object = await c.env.ATTACHMENTS.get(task.manifestKey);
      if (!object) {
        return c.json(
          { error: { message: "Export artifact is missing" } },
          404,
        );
      }
      return new Response(object.body, {
        headers: {
          "content-type": "application/json",
          "content-disposition": `attachment; filename="flaremo-export-${task.id}.json"`,
        },
      });
    } catch (error) {
      return jsonError(c, error);
    }
  });

  app.get("/export/tasks/:id/data/:chunk", async (c) => {
    try {
      const { db, user } = await getRequestContext(c);
      const task = await getDataTask(db, user, c.req.param("id"));
      if (task.status !== "succeeded") {
        return c.json(
          { error: { message: "Export task has not completed yet" } },
          409,
        );
      }
      const chunk = c.req.param("chunk");
      const key = `exports/${task.id}/data/${chunk}`;
      const object = await c.env.ATTACHMENTS.get(key);
      if (!object) {
        return c.json({ error: { message: "Chunk is missing" } }, 404);
      }
      return new Response(object.body, {
        headers: {
          "content-type": "application/x-ndjson",
          "cache-control": "private, max-age=0",
        },
      });
    } catch (error) {
      return jsonError(c, error);
    }
  });

  app.get("/export/tasks/:id/attachments/:attachmentId", async (c) => {
    try {
      const { db, user } = await getRequestContext(c);
      const task = await getDataTask(db, user, c.req.param("id"));
      if (task.status !== "succeeded") {
        return c.json(
          { error: { message: "Export task has not completed yet" } },
          409,
        );
      }
      const attachment = await getAttachmentById(
        db,
        user,
        parseAttachmentsResourceName(c.req.param("attachmentId")),
      );
      const object = await c.env.ATTACHMENTS.get(attachment.r2Key);
      if (!object) {
        return c.json(
          { error: { message: "Attachment object is missing" } },
          404,
        );
      }
      const headers = new Headers();
      headers.set(
        "content-type",
        attachment.contentType ?? "application/octet-stream",
      );
      headers.set("content-length", String(object.size));
      headers.set(
        "content-disposition",
        `attachment; filename="${sanitizeFilename(attachment.filename)}"`,
      );
      if (object.httpEtag) headers.set("etag", object.httpEtag);
      return new Response(object.body, { headers });
    } catch (error) {
      return jsonError(c, error);
    }
  });

  app.post(
    "/import/tasks",
    zValidator("json", createImportTaskRequestSchema),
    async (c) => {
      let taskId: string | undefined;
      const writtenKeys: string[] = [];
      try {
        const { db, user, limits, userLimits } = await getRequestContext(c);
        const body = c.req.valid("json");
        const task = await createDataTask(db, user, { kind: "import" });
        taskId = task.id;

        await assertAttachmentStorageQuota(
          db,
          limits,
          bundleAttachmentBytes(body.bundle.attachments),
          { userLimits, userId: user.id },
        );
        await assertMemoCountQuota(
          db,
          userLimits,
          user.id,
          body.bundle.memos.length,
        );
        const uploaded = await importBundleUpload(
          c.env,
          user.id,
          body.bundle.attachments,
          writtenKeys,
        );
        if (!uploaded) {
          return c.json(
            { error: { message: "Imported attachment exceeds 25 MiB" } },
            413,
          );
        }

        const result = await runImportTask(db, user, task.id, body.bundle, {
          attachmentR2Keys: uploaded.r2Keys,
          attachmentEtags: uploaded.r2Etags,
          conflict: body.conflict,
        });

        if (result.cleanupR2Keys.length > 0) {
          try {
            await c.env.ATTACHMENTS.delete(result.cleanupR2Keys);
          } catch (error) {
            console.error(
              JSON.stringify({
                message: "import task R2 cleanup failed",
                error: error instanceof Error ? error.message : String(error),
                count: result.cleanupR2Keys.length,
              }),
            );
          }
        }

        const { cleanupR2Keys: _cleanupR2Keys, ...publicResult } = result;
        const taskDto = dataTaskToDto(await getDataTask(db, user, task.id));
        return c.json({ task: taskDto, result: publicResult }, 202);
      } catch (error) {
        if (taskId) {
          const context = await getRequestContext(c).catch(() => undefined);
          if (context) {
            await failDataTask(
              context.db,
              taskId,
              "import_failed",
              errorMessage(error),
            ).catch(() => undefined);
          }
        }
        if (writtenKeys.length > 0) {
          await c.env.ATTACHMENTS.delete(writtenKeys);
        }
        return jsonError(c, error);
      }
    },
  );
}
