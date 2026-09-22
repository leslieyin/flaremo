import type { FlareMoDb, MemoryItemRow, UserRow } from "@flaremo/db";
import { memoryItems, memoryRevisions } from "@flaremo/db";
import { and, eq, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { createResourceId } from "../ids";

export const MEMORY_MAX_CONTENT_LENGTH = 4_000;

/**
 * The actor behind a memory mutation. Browser sessions are the owner; PATs
 * (MCP clients and scripts) are agents. Agents operate one tier below the
 * user in the verification hierarchy and may never overwrite confirmed or
 * locked memories.
 */
export type MemoryActor = { type: "user" } | { type: "agent"; name: string };

export type MemoryWriteInput = {
  content: string;
  type: MemoryItemRow["type"];
  kind: MemoryItemRow["kind"];
  scopeType: MemoryItemRow["scopeType"];
  scopeKey: string | null;
  tier: MemoryItemRow["tier"];
  importance: number;
  confidence: number;
  verification?: MemoryItemRow["verification"];
  sourceAgent?: string | null;
  sourceSession?: string | null;
  sourceRef?: string | null;
};

function normalizeMemoryContent(content: string) {
  return content.trim().replace(/\s+/g, " ");
}

function assertMemoryContentLength(content: string) {
  if (content.length > MEMORY_MAX_CONTENT_LENGTH) {
    throw new ValidationError(
      "Memory content must be 4000 characters or fewer; store long-form content as a memo instead.",
    );
  }
}

/**
 * Reject obvious credential material at write time. This is a high-confidence
 * rule list, not a parser: P0 blocks the clearly dangerous shapes and lets the
 * user's review flow catch subtler secrets.
 */
function assertNoSecrets(content: string) {
  const lowered = content.toLowerCase();
  const markers = [
    "authorization:",
    "authorization bearer",
    "memos_pat_",
    "-----begin rsa private key-----",
    "-----begin private key-----",
    "-----begin pgp private key-----",
    "cookie:",
    "set-cookie:",
    "api_key=",
    "apikey=",
    "client_secret=",
    "password=",
    "passwd=",
  ];
  if (markers.some((marker) => lowered.includes(marker))) {
    throw new ValidationError("MEMORY_SECRET_REJECTED");
  }
}

export async function computeFingerprint(
  user: UserRow,
  content: string,
  type: string,
  kind: string,
  scopeType: string,
  scopeKey: string | null,
) {
  const canonical = [
    user.id,
    type,
    kind,
    scopeType,
    scopeKey ?? "",
    content,
  ].join("\u001f");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function resolveVerificationForActor(
  actor: MemoryActor,
  input: MemoryWriteInput,
): MemoryItemRow["verification"] {
  if (actor.type === "user") {
    // The web UI only exposes "create" and "lock at create"; both are user
    // affirmations and therefore confirmed or locked.
    return input.verification === "locked" ? "locked" : "confirmed";
  }
  if (input.verification === "locked" || input.verification === "confirmed") {
    throw new ForbiddenError("Agents cannot lock or confirm memories.");
  }
  return input.verification ?? "observed";
}

export function resolveConfidenceForActor(
  actor: MemoryActor,
  input: MemoryWriteInput,
) {
  if (actor.type === "user") return 100;
  return input.confidence;
}

export async function requireMemory(
  db: FlareMoDb,
  user: UserRow,
  id: string,
): Promise<MemoryItemRow> {
  const row = await db
    .select()
    .from(memoryItems)
    .where(and(eq(memoryItems.id, id), eq(memoryItems.userId, user.id)))
    .get();
  if (!row) throw new NotFoundError(`Memory not found: ${id}`);
  return row;
}

export function assertAgentCanMutate(actor: MemoryActor, row: MemoryItemRow) {
  if (actor.type !== "agent") return;
  if (row.verification === "locked") {
    throw new ForbiddenError(
      "Agents cannot modify a locked memory; propose a conflict instead.",
    );
  }
  if (row.verification === "confirmed") {
    throw new ForbiddenError(
      "Agents cannot modify a confirmed memory; propose a conflict instead.",
    );
  }
}

export async function appendRevision(
  db: FlareMoDb,
  user: UserRow,
  row: MemoryItemRow,
  createdByType: "user" | "agent",
  createdByAgent?: string | null,
) {
  const snapshot: Record<string, unknown> = {
    type: row.type,
    kind: row.kind,
    scope_type: row.scopeType,
    scope_key: row.scopeKey,
    tier: row.tier,
    verification: row.verification,
    status: row.status,
    importance: row.importance,
    confidence: row.confidence,
  };
  await db.insert(memoryRevisions).values({
    id: createResourceId("memories"),
    memoryId: row.id,
    userId: user.id,
    content: row.content,
    metadataSnapshot: snapshot,
    createdByType,
    createdByAgent: createdByAgent ?? null,
    createdAt: new Date().toISOString(),
  });
}

export { assertMemoryContentLength, assertNoSecrets, normalizeMemoryContent };

export function buildFtsCondition(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return undefined;
  const tokens = trimmed.match(/[\p{L}\p{N}_-]+/gu) ?? [];
  // Trigram FTS5 cannot match queries shorter than three characters, so a
  // short or token-less query falls back to a plain LIKE substring match.
  const trigrams = tokens.filter((token) => [...token].length >= 3);
  if (trigrams.length === 0) {
    return sql`${memoryItems.content} LIKE ${`%${escapeLike(trimmed)}%`} ESCAPE '\\'`;
  }
  const match = trigrams
    .map((token) => `"${token.replaceAll('"', '""')}"`)
    .join(" OR ");
  return sql`${memoryItems.id} IN (
    SELECT memory_id FROM memory_fts WHERE memory_fts MATCH ${match}
  )`;
}

function escapeLike(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}
