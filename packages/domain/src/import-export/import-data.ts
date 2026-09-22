import type { ImportBundle, ImportOptions } from "@flaremo/contracts";
import type { FlareMoDb, UserRow } from "@flaremo/db";
import {
  attachments,
  memoRelations,
  memoryItems,
  memoryRelations,
  memoryResourceLinks,
  memoryRevisions,
  memos,
  memoTags,
  projects,
  shares,
  taskActivity,
  tasks,
} from "@flaremo/db";
import { and, eq } from "drizzle-orm";
import { createResourceId, createToken, parseResourceName } from "../ids";
import {
  normalizeMemoClientId,
  normalizeMemoPayload,
  updateMemo,
} from "../memos";
import { extractTags, normalizeMemoTags } from "../tags";

/**
 * The import half of import-export.ts, moved verbatim: replays an
 * ImportBundle into the target account with conflict handling and
 * id remapping (memos/attachments/relations/shares/memories/projects/
 * tasks/activity/memory revisions/relations/links).
 */
export async function importData(
  db: FlareMoDb,
  user: UserRow,
  bundle: ImportBundle,
  options: {
    attachmentR2Keys?: Map<string, string>;
    attachmentEtags?: Map<string, string | null>;
    conflict?: ImportOptions["conflict"];
  } = {},
) {
  const now = new Date().toISOString();
  const conflict = options.conflict ?? "duplicate";
  const memoIdMap = new Map<string, string>();
  let importedMemos = 0;
  let skippedMemos = 0;
  let overwrittenMemos = 0;
  let importedAttachments = 0;
  let importedRelations = 0;
  let importedShares = 0;
  const cleanupR2Keys: string[] = [];

  for (const memo of bundle.memos) {
    const sourceId = parseResourceName(memo.name, "memos");
    const payload = normalizeMemoPayload(memo.payload);
    const requestedClientId = normalizeMemoClientId(payload.client_id);
    if (requestedClientId) payload.client_id = requestedClientId;

    const existingById = await db
      .select({ id: memos.id })
      .from(memos)
      .where(and(eq(memos.id, sourceId), eq(memos.userId, user.id)))
      .get();
    const existingByClientId = requestedClientId
      ? await db
          .select({ id: memos.id })
          .from(memos)
          .where(
            and(
              eq(memos.userId, user.id),
              eq(memos.clientId, requestedClientId),
            ),
          )
          .get()
      : undefined;
    const existing = existingById ?? existingByClientId;

    if (existing && conflict === "skip") {
      memoIdMap.set(memo.name, existing.id);
      skippedMemos += 1;
      continue;
    }

    if (existing && conflict === "overwrite") {
      // `client_id` is a stable creation id, not imported memo content. The
      // target row keeps its canonical value (or gains it only on insert).
      delete payload.client_id;
      await updateMemo(db, user, existing.id, {
        content: memo.content,
        visibility: memo.visibility,
        status: memo.state,
        pinned: memo.pinned,
        payload,
      });
      await db
        .update(memos)
        .set({
          source: memo.source ?? "import",
          createdAt: memo.create_time ?? now,
          updatedAt: memo.update_time ?? memo.create_time ?? now,
        })
        .where(and(eq(memos.id, existing.id), eq(memos.userId, user.id)));
      memoIdMap.set(memo.name, existing.id);
      overwrittenMemos += 1;
      continue;
    }

    const importedId = existingById ? createResourceId("memos") : sourceId;
    memoIdMap.set(memo.name, importedId);
    // A duplicate import is intentionally a new memo. It cannot reuse the
    // original request's idempotency key when that key already identifies a
    // memo in this account.
    const clientId = existingByClientId ? undefined : requestedClientId;
    if (clientId) {
      payload.client_id = clientId;
    } else if (existingByClientId) {
      delete payload.client_id;
    }
    const tags = normalizeMemoTags(payload.tags ?? extractTags(memo.content));
    payload.tags = tags;
    const createdAt = memo.create_time ?? now;
    const updatedAt = memo.update_time ?? createdAt;
    const insertMemo = db.insert(memos).values({
      id: importedId,
      userId: user.id,
      content: memo.content,
      visibility: memo.visibility,
      status: memo.state,
      pinned: memo.pinned,
      source: memo.source ?? "import",
      clientId,
      payload,
      createdAt,
      updatedAt,
      deletedAt:
        memo.state === "deleted" || memo.state === "trashed" ? updatedAt : null,
    });
    if (tags.length > 0) {
      await db.batch([
        insertMemo,
        db.insert(memoTags).values(
          tags.map((tag) => ({
            memoId: importedId,
            userId: user.id,
            tag,
            createdAt,
          })),
        ),
      ]);
    } else {
      await insertMemo;
    }
    importedMemos += 1;
  }

  for (const attachment of bundle.attachments) {
    const mappedMemoId = attachment.memo
      ? (memoIdMap.get(attachment.memo) ?? null)
      : null;
    const objectKey = options.attachmentR2Keys?.get(attachment.name);
    const payload = {
      ...(attachment.payload ?? {}),
      ...(objectKey ? {} : { imported_without_binary: true }),
    };
    const sourceId = parseResourceName(attachment.name, "attachments");
    const existing = await db
      .select({
        id: attachments.id,
        r2Key: attachments.r2Key,
        state: attachments.state,
      })
      .from(attachments)
      .where(and(eq(attachments.id, sourceId), eq(attachments.userId, user.id)))
      .get();
    if (existing && conflict === "skip") {
      if (objectKey) cleanupR2Keys.push(objectKey);
      continue;
    }
    const importedId = existing ? createResourceId("attachments") : sourceId;
    const createdAt = attachment.create_time || now;
    const updatedAt = attachment.update_time || createdAt;
    const attachmentValues = {
      id: importedId,
      userId: user.id,
      memoId: mappedMemoId,
      r2Key:
        objectKey ??
        existing?.r2Key ??
        `imports/${user.id}/missing/${crypto.randomUUID()}`,
      filename: attachment.filename,
      contentType: attachment.content_type,
      size: attachment.size,
      state: objectKey ? ("ready" as const) : (existing?.state ?? "missing"),
      etag:
        options.attachmentEtags?.get(attachment.name) ??
        attachment.etag ??
        null,
      payload,
      createdAt,
      updatedAt,
      deletedAt: null,
    };
    if (existing && conflict === "overwrite") {
      await db
        .update(attachments)
        .set({ ...attachmentValues, id: existing.id })
        .where(
          and(eq(attachments.id, existing.id), eq(attachments.userId, user.id)),
        );
      if (objectKey && objectKey !== existing.r2Key) {
        cleanupR2Keys.push(existing.r2Key);
      }
    } else {
      await db.insert(attachments).values(attachmentValues);
    }
    importedAttachments += 1;
  }

  for (const relation of bundle.relations) {
    const memoId = memoIdMap.get(relation.memo);
    const relatedMemoId = memoIdMap.get(relation.related_memo);
    if (!memoId || !relatedMemoId) continue;
    const result = await db
      .insert(memoRelations)
      .values({
        memoId,
        relatedMemoId,
        type: relation.type,
        createdAt: relation.create_time || now,
      })
      .onConflictDoNothing();
    if (result.meta.changes > 0) importedRelations += 1;
  }

  for (const share of bundle.shares) {
    const memoId = memoIdMap.get(share.memo);
    if (!memoId) continue;
    const createdAt = share.create_time || now;
    await db.insert(shares).values({
      id: createResourceId("shares"),
      memoId,
      userId: user.id,
      token: createToken(),
      expiresAt: share.expires_at,
      createdAt,
      updatedAt: share.update_time ?? createdAt,
      revokedAt: share.revoked_at ?? null,
    });
    importedShares += 1;
  }

  // Memories are user-owned, atomic records. Import preserves the namespaced
  // id so memory↔memo resource links stay intact, resets derived fields
  // (fingerprint, access counters, embedding state), and skips rows that
  // already exist under `skip` or `overwrite` conflict handling.
  let importedMemories = 0;
  const memoryIdMap = new Map<string, string>();
  for (const memory of bundle.memories) {
    const sourceId = parseResourceName(memory.name, "memories");
    const existing = await db
      .select({ id: memoryItems.id })
      .from(memoryItems)
      .where(and(eq(memoryItems.id, sourceId), eq(memoryItems.userId, user.id)))
      .get();
    if (existing && conflict === "skip") {
      memoryIdMap.set(memory.name, existing.id);
      continue;
    }
    const importedId = existing ? createResourceId("memories") : sourceId;
    memoryIdMap.set(memory.name, importedId);
    const createdAt = memory.created_at ?? now;
    const updatedAt = memory.updated_at ?? createdAt;
    await db
      .insert(memoryItems)
      .values({
        id: importedId,
        userId: user.id,
        content: memory.content,
        type: memory.type,
        kind: memory.kind,
        scopeType: memory.scope_type,
        scopeKey: memory.scope_key,
        tier: memory.tier,
        verification: memory.verification,
        status: memory.status,
        importance: memory.importance,
        confidence: memory.confidence,
        needsReview: memory.needs_review,
        reviewReason: memory.review_reason,
        createdByType: memory.created_by_type,
        sourceAgent: memory.source_agent,
        sourceSession: memory.source_session,
        sourceRef: memory.source_ref,
        validFrom: memory.valid_from,
        validTo: memory.valid_to,
        // The canonical fingerprint is rebuilt from content on the next write;
        // an import-scoped placeholder keeps the per-user unique index intact
        // without trusting the exported (derived) value.
        fingerprint: `import:${importedId}`,
        accessCount: 0,
        lastAccessedAt: null,
        embeddingStatus: "not_indexed",
        createdAt,
        updatedAt,
        deletedAt: memory.status === "deleted" ? updatedAt : null,
      })
      .onConflictDoUpdate({
        target: memoryItems.id,
        set: {
          content: memory.content,
          type: memory.type,
          kind: memory.kind,
          scopeType: memory.scope_type,
          scopeKey: memory.scope_key,
          tier: memory.tier,
          verification: memory.verification,
          status: memory.status,
          importance: memory.importance,
          confidence: memory.confidence,
          needsReview: memory.needs_review,
          reviewReason: memory.review_reason,
          sourceAgent: memory.source_agent,
          sourceSession: memory.source_session,
          sourceRef: memory.source_ref,
          validFrom: memory.valid_from,
          validTo: memory.valid_to,
          updatedAt,
        },
      });
    importedMemories += 1;
  }

  // Projects, tasks and the activity trail follow the same remap pipeline as
  // memories: the source id is preserved when free, collision imports get a
  // fresh id, and task → project / task → memo / activity → task references
  // follow the maps. A task whose project is not in the bundle lands as
  // unassigned (project_id is nullable by design).
  let importedProjects = 0;
  const projectIdMap = new Map<string, string>();
  for (const project of bundle.projects) {
    const sourceId = parseResourceName(project.name, "projects");
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, sourceId), eq(projects.userId, user.id)))
      .get();
    if (existing && conflict === "skip") {
      projectIdMap.set(project.name, existing.id);
      continue;
    }
    const importedId = existing ? createResourceId("projects") : sourceId;
    projectIdMap.set(project.name, importedId);
    await db
      .insert(projects)
      .values({
        id: importedId,
        userId: user.id,
        name: project.title,
        description: project.description,
        status: project.status,
        deletedAt: project.deleted_at,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          name: project.title,
          description: project.description,
          status: project.status,
          deletedAt: project.deleted_at,
          updatedAt: project.updated_at,
        },
      });
    importedProjects += 1;
  }

  let importedTasks = 0;
  const taskIdMap = new Map<string, string>();
  for (const task of bundle.tasks) {
    const sourceId = parseResourceName(task.name, "tasks");
    const existing = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, sourceId), eq(tasks.userId, user.id)))
      .get();
    if (existing && conflict === "skip") {
      taskIdMap.set(task.name, existing.id);
      continue;
    }
    const importedId = existing ? createResourceId("tasks") : sourceId;
    taskIdMap.set(task.name, importedId);
    await db
      .insert(tasks)
      .values({
        id: importedId,
        userId: user.id,
        projectId: task.project_id
          ? (projectIdMap.get(task.project_id) ?? null)
          : null,
        // A memo id remaps through the memo map; an unmapped memo (e.g. the
        // memo was skipped) loses the bridge rather than dangling.
        sourceMemoId: task.source_memo_id
          ? (memoIdMap.get(task.source_memo_id) ?? null)
          : null,
        title: task.title,
        notes: task.notes,
        status: task.status,
        priority: task.priority,
        dueAt: task.due_at,
        sortOrder: task.sort_order,
        completedAt: task.completed_at,
        deletedAt: task.deleted_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          projectId: task.project_id
            ? (projectIdMap.get(task.project_id) ?? null)
            : null,
          sourceMemoId: task.source_memo_id
            ? (memoIdMap.get(task.source_memo_id) ?? null)
            : null,
          title: task.title,
          notes: task.notes,
          status: task.status,
          priority: task.priority,
          dueAt: task.due_at,
          sortOrder: task.sort_order,
          completedAt: task.completed_at,
          deletedAt: task.deleted_at,
          updatedAt: task.updated_at,
        },
      });
    importedTasks += 1;
  }

  let importedTaskActivity = 0;
  for (const activity of bundle.task_activity) {
    const taskId = activity.task_id
      ? (taskIdMap.get(activity.task_id) ?? null)
      : null;
    // A null task_id is a project-scoped event (reorder) and imports as is;
    // rows pointing at a task that was not imported are dropped instead of
    // writing activity for a task that does not exist here.
    if (activity.task_id && !taskId) continue;
    await db.insert(taskActivity).values({
      taskId,
      userId: user.id,
      actorType: activity.actor_type,
      actorName: activity.actor_name,
      action: activity.action,
      changes: activity.changes,
      createdAt: activity.created_at,
    });
    importedTaskActivity += 1;
  }

  for (const revision of bundle.memory_revisions) {
    const memoryId = memoryIdMap.get(revision.memory_id);
    if (!memoryId) continue;
    await db
      .insert(memoryRevisions)
      .values({
        id: parseResourceName(revision.name, "memories"),
        memoryId,
        userId: user.id,
        content: revision.content,
        metadataSnapshot: revision.metadata_snapshot,
        createdByType: revision.created_by_type,
        createdByAgent: revision.created_by_agent,
        createdAt: revision.created_at ?? now,
      })
      .onConflictDoNothing();
  }

  for (const relation of bundle.memory_relations) {
    const memoryId = memoryIdMap.get(relation.memory_id);
    const relatedMemoryId = memoryIdMap.get(relation.related_memory_id);
    if (!memoryId || !relatedMemoryId) continue;
    await db
      .insert(memoryRelations)
      .values({
        id: createResourceId("memories"),
        memoryId,
        relatedMemoryId,
        userId: user.id,
        type: relation.type,
        createdAt: relation.created_at ?? now,
      })
      .onConflictDoNothing();
  }

  for (const link of bundle.memory_resource_links) {
    const memoryId = memoryIdMap.get(link.memory_id);
    if (!memoryId) continue;
    await db
      .insert(memoryResourceLinks)
      .values({
        id: createResourceId("memories"),
        memoryId,
        userId: user.id,
        resourceType: link.resource_type,
        resourceRef: link.resource_ref,
        relationType: link.relation_type,
        metadata: link.metadata,
        createdAt: link.created_at ?? now,
      })
      .onConflictDoNothing();
  }

  return {
    imported_memos: importedMemos,
    skipped_memos: skippedMemos,
    overwritten_memos: overwrittenMemos,
    imported_attachments: importedAttachments,
    imported_relations: importedRelations,
    imported_shares: importedShares,
    imported_memories: importedMemories,
    imported_projects: importedProjects,
    imported_tasks: importedTasks,
    imported_task_activity: importedTaskActivity,
    cleanupR2Keys,
  };
}
