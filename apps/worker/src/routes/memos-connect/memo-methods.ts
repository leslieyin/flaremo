import type { MemoRow, UserRow } from "@flaremo/db";
import { createDb } from "@flaremo/db";
import {
  bindMemoAttachments,
  createMemo,
  createMemoComment,
  createMemoShare,
  deleteMemoReaction,
  getMemoById,
  getMemoByIdForViewer,
  getMemoParent,
  getPublicShareByToken,
  hardDeleteMemo,
  listAttachmentsForMemosForViewer,
  listMemoAttachments,
  listMemoAttachmentsForViewer,
  listMemoComments,
  listMemoReactions,
  listMemoRelationsForViewer,
  listMemoShares,
  listMemos,
  listMemosForViewer,
  listReactionsForMemosForViewer,
  markMemoAttachmentsDeleting,
  replaceMemoRelations,
  revokeMemoShare,
  updateMemo,
  upsertMemoReaction,
} from "@flaremo/domain";
import {
  currentAttachmentToDto,
  currentMemoToDto,
  currentReactionToDto,
  currentShareToDto,
} from "@flaremo/memos";
import type { getRequestContext } from "../../context";
import type { FlareMoEnv } from "../../env";
import { CompatValidationError } from "../../memos-compat/errors";
import { resolveMemoCreator } from "../../memos-compat/memo-creator";
import { memoRelationsToDtos } from "../../memos-compat/memo-relations";
import {
  compatMemoRelationType,
  compatMemoVisibility,
  parseMemosOrderBy,
  parseMemosState,
  splitUpdateMaskFields,
} from "../../memos-compat/parsing";
import { compatMemoPayload } from "../../memos-compat/payload";
import { normalizeMemoName } from "../../memos-compat/resource-names";
import { fetchLinkMetadata } from "../../memos-link-metadata";
import type { BinaryTransport } from "../../memos-protobuf";
import {
  type ConnectContext,
  type ConnectReadContext,
  list,
  optionalString,
  optionalTimestamp,
  pageSize,
  record,
  requiredString,
} from "./shared";
import { connectErrorForTransport, connectValue } from "./transport";

export async function createConnectMemoComment(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const comment = record(body.comment);
  const created = await createMemoComment(
    context.db,
    context.user,
    normalizeMemoName(requiredString(body.name, "name")),
    {
      content: requiredString(comment.content, "comment.content"),
      payload: compatMemoPayload(comment),
      source: "memos-connect",
      ...(optionalString(body.commentId)
        ? { commentId: optionalString(body.commentId) }
        : {}),
    },
  );
  return connectMemoWithDetails(context, created.id);
}

export async function listConnectMemoComments(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const result = await listMemoComments(context.db, context.user, {
    memoName: normalizeMemoName(requiredString(body.name, "name")),
    pageSize: pageSize(body.pageSize),
    ...(optionalString(body.pageToken)
      ? { pageToken: optionalString(body.pageToken) }
      : {}),
    orderBy: optionalString(body.orderBy) ?? "create_time desc",
  });
  const comments = await hydrateConnectMemos(context, result.memos);
  return {
    memos: comments,
    totalSize: result.totalSize,
    ...(result.nextPageToken ? { nextPageToken: result.nextPageToken } : {}),
  };
}

export async function listConnectMemoReactions(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const result = await listMemoReactions(context.db, context.user, {
    memoName: normalizeMemoName(requiredString(body.name, "name")),
    pageSize: pageSize(body.pageSize),
    ...(optionalString(body.pageToken)
      ? { pageToken: optionalString(body.pageToken) }
      : {}),
  });
  return {
    reactions: result.reactions.map(currentReactionToDto),
    totalSize: result.totalSize,
    ...(result.nextPageToken ? { nextPageToken: result.nextPageToken } : {}),
  };
}

export async function upsertConnectMemoReaction(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const reaction = record(body.reaction);
  const memoName = normalizeMemoName(requiredString(body.name, "name"));
  const contentId = normalizeMemoName(
    optionalString(reaction.contentId) ?? memoName,
  );
  const created = await upsertMemoReaction(context.db, context.user, {
    memoName,
    contentId,
    reactionType: requiredString(
      reaction.reactionType,
      "reaction.reactionType",
    ),
  });
  return currentReactionToDto(created);
}

export async function deleteConnectMemoReaction(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const name = requiredString(body.name, "name");
  await deleteMemoReaction(context.db, context.user, {
    name,
    memoName: normalizeMemoName(reactionMemoName(name)),
  });
}

export async function createConnectMemoShare(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const memoShare = record(body.memoShare);
  const expireTime = optionalTimestamp(
    memoShare.expireTime ?? memoShare.expire_time,
    "memoShare.expireTime",
  );
  const share = await createMemoShare(
    context.db,
    context.user,
    normalizeMemoName(requiredString(body.parent, "parent")),
    { expires_at: expireTime },
  );
  return currentShareToDto(share);
}

export async function listConnectMemoShares(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const shares = await listMemoShares(
    context.db,
    context.user,
    normalizeMemoName(requiredString(body.parent, "parent")),
  );
  return { memoShares: shares.map(currentShareToDto) };
}

export async function deleteConnectMemoShare(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  await revokeMemoShare(
    context.db,
    context.user,
    shareTokenFromName(requiredString(body.name, "name")),
  );
}

export async function connectPublicMemoRead(
  c: ConnectContext,
  context: ConnectReadContext,
  method: string,
  value: unknown,
  transport?: BinaryTransport,
) {
  const body = record(value);
  switch (method) {
    case "ListMemos": {
      const result = await listMemosForViewer(
        context.db,
        context.user,
        connectMemoListQuery(body),
        { celScanLimit: context.memoFilterScanLimit },
      );
      const memos = await hydrateConnectPublicMemos(context, result.memos);
      return connectValue(
        c,
        {
          memos,
          ...(result.nextPageToken
            ? { nextPageToken: result.nextPageToken }
            : {}),
        },
        transport,
      );
    }
    case "GetMemo":
      return connectValue(
        c,
        await connectPublicMemoWithDetails(
          context,
          requiredString(body.name, "name"),
        ),
        transport,
      );
    case "ListMemoComments": {
      const parentName = normalizeMemoName(requiredString(body.name, "name"));
      const result = await listMemoComments(context.db, context.user, {
        memoName: parentName,
        pageSize: pageSize(body.pageSize),
        ...(optionalString(body.pageToken)
          ? { pageToken: optionalString(body.pageToken) }
          : {}),
        orderBy: optionalString(body.orderBy) ?? "create_time desc",
      });
      const memos = await hydrateConnectPublicMemos(
        context,
        result.memos,
        parentName,
      );
      return connectValue(
        c,
        {
          memos,
          totalSize: result.totalSize,
          ...(result.nextPageToken
            ? { nextPageToken: result.nextPageToken }
            : {}),
        },
        transport,
      );
    }
    case "ListMemoReactions": {
      const result = await listMemoReactions(context.db, context.user, {
        memoName: normalizeMemoName(requiredString(body.name, "name")),
        pageSize: pageSize(body.pageSize),
        ...(optionalString(body.pageToken)
          ? { pageToken: optionalString(body.pageToken) }
          : {}),
      });
      return connectValue(
        c,
        {
          reactions: result.reactions.map(currentReactionToDto),
          totalSize: result.totalSize,
          ...(result.nextPageToken
            ? { nextPageToken: result.nextPageToken }
            : {}),
        },
        transport,
      );
    }
    case "ListMemoAttachments": {
      const attachments = await listMemoAttachmentsForViewer(
        context.db,
        context.user,
        normalizeMemoName(requiredString(body.name, "name")),
      );
      return connectValue(
        c,
        { attachments: attachments.map(currentAttachmentToDto) },
        transport,
      );
    }
    case "ListMemoRelations": {
      const memoId = normalizeMemoName(requiredString(body.name, "name"));
      await getMemoByIdForViewer(context.db, context.user, memoId);
      const rows = await listMemoRelationsForViewer(
        context.db,
        context.user,
        memoId,
      );
      const relations = await memoRelationsToDtos(
        rows,
        (id) => getMemoByIdForViewer(context.db, context.user, id),
        { skipUnavailable: true },
      );
      return connectValue(c, { relations }, transport);
    }
    default:
      return connectErrorForTransport(
        c,
        transport,
        "unimplemented",
        `Public Memos read method is not implemented: ${method}`,
        501,
      );
  }
}

export async function connectPublicMemoWithDetails(
  context: ConnectReadContext,
  memoId: string,
  parent?: string,
) {
  const memo = await getMemoByIdForViewer(context.db, context.user, memoId);
  const [attachments, reactions, relationRows] = await Promise.all([
    listMemoAttachmentsForViewer(context.db, context.user, memo.id),
    listMemoReactions(context.db, context.user, memo.id, { pageSize: 1_000 }),
    listMemoRelationsForViewer(context.db, context.user, memo.id),
  ]);
  const relations = await memoRelationsToDtos(
    relationRows,
    (id) => getMemoByIdForViewer(context.db, context.user, id),
    { skipUnavailable: true },
  );
  const creator = await resolveMemoCreator(context, memo);
  return currentMemoToDto(memo, creator, {
    attachments,
    reactions: reactions.reactions,
    relations,
    ...(parent ? { parent } : {}),
  });
}

export function isPublicMemoReadMethod(method: string) {
  return [
    "GetMemo",
    "ListMemos",
    "ListMemoComments",
    "ListMemoReactions",
    "ListMemoAttachments",
    "ListMemoRelations",
  ].includes(method);
}

export async function connectGetLinkMetadata(
  c: ConnectContext,
  value: unknown,
  transport?: BinaryTransport,
) {
  const body = record(value);
  return connectValue(
    c,
    await fetchLinkMetadata(requiredString(body.url, "url")),
    transport,
  );
}

export async function connectBatchGetLinkMetadata(
  c: ConnectContext,
  value: unknown,
  transport?: BinaryTransport,
) {
  const body = record(value);
  const urls = list(body.urls).map((url) => requiredString(url, "urls[]"));
  if (urls.length === 0) throw new CompatValidationError("urls are required");
  if (urls.length > 10)
    throw new CompatValidationError("too many urls (max 10)");
  const linkMetadata = await Promise.all(
    urls.map((url) => fetchLinkMetadata(url)),
  );
  return connectValue(c, { linkMetadata }, transport);
}

export async function createConnectMemo(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const memo = record(body.memo);
  const created = await createMemo(
    context.db,
    context.user,
    {
      content: requiredString(memo.content, "memo.content"),
      visibility: compatMemoVisibility(memo.visibility),
      payload: compatMemoPayload(memo),
      source: "memos-connect",
    },
    { userLimits: context.userLimits, userId: context.user.id },
  );
  return connectMemoWithDetails(context, created.id);
}

/**
 * Shared body-to-legacy-list-query mapping for the authenticated
 * ListMemos and the anonymous public ListMemos read; both surfaces parsed
 * identical copies of this shape.
 */
function connectMemoListQuery(body: Record<string, unknown>) {
  const orderBy = parseMemosOrderBy(
    optionalString(body.orderBy) ?? "create_time desc",
  );
  if (!orderBy) {
    throw new CompatValidationError(
      "orderBy must be one supported single-field order such as create_time desc",
    );
  }
  return {
    page_size: pageSize(body.pageSize),
    page_token: optionalString(body.pageToken),
    order_by: orderBy,
    state: stateToLegacy(optionalString(body.state)),
    filter: optionalString(body.filter),
    include_deleted: body.showDeleted === true,
  };
}

export async function listConnectMemos(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const query = connectMemoListQuery(body);
  const result = await listMemos(context.db, context.user, query, {
    celScanLimit: context.memoFilterScanLimit,
  });
  const attachments = await listMemoAttachmentsForPage(
    context,
    result.memos.map((memo) => memo.id),
  );
  const reactions = await listMemoReactionsForPage(
    context,
    result.memos.map((memo) => memo.id),
  );
  return {
    memos: result.memos.map((memo) =>
      currentMemoToDto(memo, context.user, {
        attachments: attachments.get(memo.id) ?? [],
        reactions: reactions.get(memo.id) ?? [],
      }),
    ),
    ...(result.nextPageToken ? { nextPageToken: result.nextPageToken } : {}),
  };
}

export async function getConnectMemo(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  return connectMemoWithDetails(context, requiredString(body.name, "name"));
}

export async function updateConnectMemo(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const memo = record(body.memo);
  const name = requiredString(memo.name, "memo.name");
  const fields = splitUpdateMaskFields(body.updateMask);
  if (fields.length === 0)
    throw new CompatValidationError("updateMask is required");

  const input: Parameters<typeof updateMemo>[3] = {};
  for (const field of fields) {
    switch (field) {
      case "content":
        input.content = requiredString(memo.content, "memo.content");
        break;
      case "visibility":
        input.visibility = compatMemoVisibility(memo.visibility);
        break;
      case "pinned":
        if (typeof memo.pinned !== "boolean")
          throw new CompatValidationError("memo.pinned must be a boolean");
        input.pinned = memo.pinned;
        break;
      case "state":
        input.status = stateToLegacy(optionalString(memo.state));
        break;
      case "property":
      case "location":
      case "tags":
        input.payload = compatMemoPayload(memo);
        break;
      default:
        throw new CompatValidationError(
          `Unsupported updateMask field: ${field}`,
        );
    }
  }
  const updated = await updateMemo(
    context.db,
    context.user,
    normalizeMemoName(name),
    input,
  );
  return connectMemoWithDetails(context, updated.id);
}

export async function deleteConnectMemo(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  env: FlareMoEnv,
  value: unknown,
) {
  const body = record(value);
  const memo = await getMemoById(
    context.db,
    context.user,
    normalizeMemoName(requiredString(body.name, "name")),
    { includeDeleted: true },
  );
  if (body.force === true) {
    const attachments = await markMemoAttachmentsDeleting(
      context.db,
      context.user,
      memo.id,
    );
    const objectKeys = attachments
      .filter((attachment) => attachment.state !== "missing")
      .map((attachment) => attachment.r2Key);
    if (objectKeys.length > 0) await env.ATTACHMENTS.delete(objectKeys);
    await hardDeleteMemo(context.db, context.user, memo.id);
  } else {
    await updateMemo(context.db, context.user, memo.id, { status: "trashed" });
  }
}

export async function setConnectAttachments(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const names = list(body.attachments).map((attachment) =>
    typeof attachment === "string"
      ? attachment
      : requiredString(record(attachment).name, "attachments[].name"),
  );
  await bindMemoAttachments(
    context.db,
    context.user,
    normalizeMemoName(requiredString(body.name, "name")),
    names,
  );
}

export async function listConnectAttachments(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const attachments = await listMemoAttachments(
    context.db,
    context.user,
    normalizeMemoName(requiredString(body.name, "name")),
  );
  return { attachments: attachments.map(currentAttachmentToDto) };
}

export async function setConnectRelations(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const body = record(value);
  const relations = list(body.relations).map((value) => {
    const relation = record(value);
    const relatedMemo = record(relation.relatedMemo);
    return {
      related_memo:
        optionalString(relatedMemo.name) ??
        requiredString(relation.relatedMemo, "relations[].relatedMemo"),
      type: compatMemoRelationType(optionalString(relation.type)),
    };
  });
  await replaceMemoRelations(
    context.db,
    context.user,
    normalizeMemoName(requiredString(body.name, "name")),
    { relations },
  );
}

export async function listConnectRelations(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  value: unknown,
) {
  const memoId = normalizeMemoName(requiredString(record(value).name, "name"));
  const memo = await getMemoById(context.db, context.user, memoId, {
    includeDeleted: true,
  });
  const rows = await listMemoRelationsForViewer(
    context.db,
    context.user,
    memo.id,
  );
  const relations = await memoRelationsToDtos(rows, (id) =>
    getMemoById(context.db, context.user, id, { includeDeleted: true }),
  );
  return { relations };
}

async function connectMemoWithDetails(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  id: string,
) {
  const memo = await getMemoById(
    context.db,
    context.user,
    normalizeMemoName(id),
  );
  const [attachments, rows, reactionPage, parent] = await Promise.all([
    listMemoAttachments(context.db, context.user, memo.id),
    listMemoRelationsForViewer(context.db, context.user, memo.id),
    listMemoReactions(context.db, context.user, {
      memoName: memo.id,
      pageSize: 1_000,
    }),
    getMemoParent(context.db, context.user, memo.id),
  ]);
  const relations = await memoRelationsToDtos(rows, (id) =>
    getMemoById(context.db, context.user, id, { includeDeleted: true }),
  );
  return currentMemoToDto(memo, context.user, {
    attachments,
    relations,
    reactions: reactionPage.reactions,
    parent,
  });
}

function groupByContentMemo<T>(
  rows: T[],
  memoKey: (row: T) => string | null | undefined,
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const memoId = memoKey(row);
    if (!memoId) continue;
    const bucket = grouped.get(memoId) ?? [];
    bucket.push(row);
    grouped.set(memoId, bucket);
  }
  return grouped;
}

async function listMemoAttachmentsForPage(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  memoIds: string[],
) {
  const attachments = await listAttachmentsForMemosForViewer(
    context.db,
    context.user,
    memoIds,
  );
  return groupByContentMemo(attachments, (attachment) => attachment.memoId);
}

async function listMemoReactionsForPage(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  memoIds: string[],
) {
  const reactions = await listReactionsForMemosForViewer(
    context.db,
    context.user,
    memoIds,
  );
  return groupByContentMemo(reactions, (reaction) => reaction.contentId);
}

/**
 * Hydrate a page of already-scoped memo rows without re-fetching each memo:
 * attachments and reactions are resolved with one batched query per page,
 * while relations and the comment parent stay per-memo because most memos
 * carry none. Keeps the exact DTO shape of the former per-memo detail fetch.
 */
async function hydrateConnectMemos(
  context: Awaited<ReturnType<typeof getRequestContext>>,
  memoRows: MemoRow[],
) {
  const ids = memoRows.map((memo) => memo.id);
  const [attachments, reactions] = await Promise.all([
    listMemoAttachmentsForPage(context, ids),
    listMemoReactionsForPage(context, ids),
  ]);
  return Promise.all(
    memoRows.map(async (memo) => {
      const relationRows = await listMemoRelationsForViewer(
        context.db,
        context.user,
        memo.id,
      );
      const relations = await memoRelationsToDtos(relationRows, (id) =>
        getMemoById(context.db, context.user, id, { includeDeleted: true }),
      );
      const parent = await getMemoParent(context.db, context.user, memo.id);
      return currentMemoToDto(memo, context.user, {
        attachments: attachments.get(memo.id) ?? [],
        reactions: reactions.get(memo.id) ?? [],
        relations,
        parent,
      });
    }),
  );
}

/**
 * Anonymous-capable variant for the public Memos read surface, mirroring
 * connectPublicMemoWithDetails but resolving a page in two batched queries
 * plus per-memo relation lookups, with creators cached across the page.
 */
async function hydrateConnectPublicMemos(
  context: ConnectReadContext,
  memoRows: MemoRow[],
  parent?: string,
) {
  const ids = memoRows.map((memo) => memo.id);
  const [attachmentsByMemo, reactionsByMemo] = await Promise.all([
    listAttachmentsForMemosForViewer(context.db, context.user, ids),
    listReactionsForMemosForViewer(context.db, context.user, ids),
  ]);
  const attachments = groupByContentMemo(
    attachmentsByMemo,
    (attachment) => attachment.memoId,
  );
  const reactions = groupByContentMemo(
    reactionsByMemo,
    (reaction) => reaction.contentId,
  );
  const creators = new Map<string, UserRow>();
  return Promise.all(
    memoRows.map(async (memo) => {
      const relationRows = await listMemoRelationsForViewer(
        context.db,
        context.user,
        memo.id,
      );
      const relations = await memoRelationsToDtos(
        relationRows,
        (id) => getMemoByIdForViewer(context.db, context.user, id),
        { skipUnavailable: true },
      );
      let creator = creators.get(memo.userId);
      if (!creator) {
        creator = await resolveMemoCreator(context, memo);
        creators.set(memo.userId, creator);
      }
      return currentMemoToDto(memo, creator, {
        attachments: attachments.get(memo.id) ?? [],
        reactions: reactions.get(memo.id) ?? [],
        relations,
        ...(parent ? { parent } : {}),
      });
    }),
  );
}

/**
 * State to the domain status. The upstream ListMemosRequest.state only
 * exposes NORMAL and ARCHIVED (STATE_UNSPECIFIED means "no filter"), so
 * trashed/deleted rows are reached through DeleteMemo and showDeleted, never
 * through the state field — matching the current REST surface.
 */
function stateToLegacy(value: string | undefined) {
  const normalized = parseMemosState(value ?? "NORMAL");
  if (
    !normalized &&
    (value ?? "NORMAL").trim().toUpperCase() !== "STATE_UNSPECIFIED"
  ) {
    throw new CompatValidationError(`Unsupported memo state: ${value}`);
  }
  if (normalized && normalized !== "normal" && normalized !== "archived") {
    throw new CompatValidationError(`Unsupported memo state: ${value}`);
  }
  return normalized;
}

function reactionMemoName(value: string) {
  const parts = value.split("/").filter(Boolean);
  const marker = parts.lastIndexOf("reactions");
  if (marker <= 0 || marker + 2 !== parts.length) {
    throw new CompatValidationError("Invalid reaction name");
  }
  return parts.slice(0, marker).join("/");
}

function shareTokenFromName(value: string) {
  const parts = value.split("/").filter(Boolean);
  const marker = parts.lastIndexOf("shares");
  if (marker < 0 || marker + 2 !== parts.length) {
    throw new CompatValidationError("Invalid share name");
  }
  const token = parts[marker + 1];
  if (!token) throw new CompatValidationError("Invalid share name");
  return token;
}
export async function connectGetSharedMemo(
  c: ConnectContext,
  value: unknown,
  transport?: BinaryTransport,
) {
  const body = record(value);
  const db = createDb(c.env.DB);
  const shared = await getPublicShareByToken(
    db,
    requiredString(body.shareId ?? body.shareToken, "shareId"),
  );
  const reactions = await listMemoReactions(db, shared.user, shared.memo.id, {
    pageSize: 1_000,
  });
  return connectValue(
    c,
    currentMemoToDto(shared.memo, shared.user, {
      attachments: shared.attachments,
      reactions: reactions.reactions,
    }),
    transport,
  );
}
