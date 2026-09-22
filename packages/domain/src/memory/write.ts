import type { UpdateMemoryInput } from "@flaremo/contracts";
import type { FlareMoDb, UserRow } from "@flaremo/db";
import { memoryItems } from "@flaremo/db";
import { and, eq, sql } from "drizzle-orm";
import { insertEmbeddingTask } from "../embedding-outbox";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { createResourceId } from "../ids";
import { assertMemoryCountQuota, type QuotaScope } from "../quotas";
import { memoryToDto } from "./dto";
import {
  appendRevision,
  assertAgentCanMutate,
  assertMemoryContentLength,
  assertNoSecrets,
  computeFingerprint,
  type MemoryActor,
  type MemoryWriteInput,
  normalizeMemoryContent,
  requireMemory,
  resolveConfidenceForActor,
  resolveVerificationForActor,
} from "./shared";

export async function createMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  input: MemoryWriteInput,
  scope?: QuotaScope,
) {
  await assertMemoryCountQuota(db, scope?.userLimits, user.id);
  const content = normalizeMemoryContent(input.content);
  if (!content) throw new ValidationError("Memory content cannot be empty.");
  assertMemoryContentLength(content);
  assertNoSecrets(content);

  const fingerprint = await computeFingerprint(
    user,
    content,
    input.type,
    input.kind,
    input.scopeType,
    input.scopeKey,
  );

  const existing = await db
    .select()
    .from(memoryItems)
    .where(
      and(
        eq(memoryItems.userId, user.id),
        eq(memoryItems.fingerprint, fingerprint),
        sql`${memoryItems.status} != 'deleted'`,
      ),
    )
    .get();
  if (existing) {
    return { duplicate: true as const, memory: memoryToDto(existing) };
  }

  const now = new Date().toISOString();
  const verification = resolveVerificationForActor(actor, input);
  const row = await db
    .insert(memoryItems)
    .values({
      id: createResourceId("memories"),
      userId: user.id,
      content,
      type: input.type,
      kind: input.kind,
      scopeType: input.scopeType,
      scopeKey: input.scopeKey,
      tier: input.tier,
      verification,
      status: "active",
      importance: input.importance,
      confidence: resolveConfidenceForActor(actor, input),
      needsReview: verification === "inferred",
      reviewReason: verification === "inferred" ? "inferred" : null,
      createdByType: actor.type === "user" ? "user" : "agent",
      sourceAgent: actor.type === "agent" ? actor.name : input.sourceAgent,
      sourceSession: input.sourceSession,
      sourceRef: input.sourceRef,
      fingerprint,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  await insertEmbeddingTask(db, {
    userId: user.id,
    resourceType: "memory",
    resourceId: row.id,
    operation: "index",
    createdAt: now,
  });

  return { duplicate: false as const, memory: memoryToDto(row) };
}

export async function updateMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
  input: UpdateMemoryInput,
) {
  const existing = await requireMemory(db, user, id);
  assertAgentCanMutate(actor, existing);
  if (existing.status === "deleted") {
    throw new NotFoundError(`Memory not found: ${id}`);
  }

  const next = { ...existing };
  if (input.content !== undefined) {
    next.content = normalizeMemoryContent(input.content);
    if (!next.content)
      throw new ValidationError("Memory content cannot be empty.");
    assertMemoryContentLength(next.content);
    assertNoSecrets(next.content);
  }
  if (input.type !== undefined) next.type = input.type;
  if (input.kind !== undefined) next.kind = input.kind;
  if (input.scope_type !== undefined) next.scopeType = input.scope_type;
  if (input.scope_key !== undefined) next.scopeKey = input.scope_key ?? null;
  if (input.tier !== undefined) next.tier = input.tier;
  if (input.importance !== undefined) next.importance = input.importance;

  next.fingerprint = await computeFingerprint(
    user,
    next.content,
    next.type,
    next.kind,
    next.scopeType,
    next.scopeKey,
  );

  const duplicate = await db
    .select()
    .from(memoryItems)
    .where(
      and(
        eq(memoryItems.userId, user.id),
        eq(memoryItems.fingerprint, next.fingerprint),
        sql`${memoryItems.id} != ${id}`,
        sql`${memoryItems.status} != 'deleted'`,
      ),
    )
    .get();
  if (duplicate) {
    throw new ConflictError("This memory already exists.");
  }

  const now = new Date().toISOString();
  // A user edit is an affirmation: it upgrades observed/inferred to confirmed,
  // while a locked memory stays locked.
  if (actor.type === "user" && existing.verification !== "locked") {
    next.verification = "confirmed";
    next.needsReview = false;
    next.reviewReason = null;
  }

  await appendRevision(
    db,
    user,
    existing,
    actor.type === "user" ? "user" : "agent",
    actor.type === "agent" ? actor.name : null,
  );
  await db
    .update(memoryItems)
    .set({
      content: next.content,
      type: next.type,
      kind: next.kind,
      scopeType: next.scopeType,
      scopeKey: next.scopeKey,
      tier: next.tier,
      verification: next.verification,
      importance: next.importance,
      needsReview: next.needsReview,
      reviewReason: next.reviewReason,
      fingerprint: next.fingerprint,
      updatedAt: now,
    })
    .where(and(eq(memoryItems.id, id), eq(memoryItems.userId, user.id)));

  if (input.content !== undefined) {
    await insertEmbeddingTask(db, {
      userId: user.id,
      resourceType: "memory",
      resourceId: existing.id,
      operation: "reindex",
      createdAt: now,
    });
  }

  const updated = await requireMemory(db, user, id);
  return memoryToDto(updated);
}
