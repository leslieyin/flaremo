import type { FlareMoDb, MemoryItemRow, UserRow } from "@flaremo/db";
import { memoryItems, memoryRelations, memoryRevisions } from "@flaremo/db";
import { and, desc, eq, or } from "drizzle-orm";
import { memoryRelationToDto, memoryRevisionToDto, memoryToDto } from "./dto";
import { buildFtsCondition, requireMemory } from "./shared";

export async function getMemory(db: FlareMoDb, user: UserRow, id: string) {
  const row = await requireMemory(db, user, id);
  await db
    .update(memoryItems)
    .set({
      accessCount: row.accessCount + 1,
      lastAccessedAt: new Date().toISOString(),
    })
    .where(and(eq(memoryItems.id, id), eq(memoryItems.userId, user.id)));
  return memoryToDto(await requireMemory(db, user, id));
}

export async function listMemories(
  db: FlareMoDb,
  user: UserRow,
  input: {
    q?: string;
    type?: MemoryItemRow["type"];
    kind?: MemoryItemRow["kind"];
    scopeType?: MemoryItemRow["scopeType"];
    scopeKey?: string;
    tier?: MemoryItemRow["tier"];
    verification?: MemoryItemRow["verification"];
    status?: MemoryItemRow["status"];
    sourceAgent?: string;
    needsReview?: boolean;
  } = {},
) {
  const filters = [eq(memoryItems.userId, user.id)];
  if (input.q?.trim()) {
    const fts = buildFtsCondition(input.q);
    if (fts) filters.push(fts);
  }
  if (input.type) filters.push(eq(memoryItems.type, input.type));
  if (input.kind) filters.push(eq(memoryItems.kind, input.kind));
  if (input.scopeType) filters.push(eq(memoryItems.scopeType, input.scopeType));
  if (input.scopeKey) filters.push(eq(memoryItems.scopeKey, input.scopeKey));
  if (input.tier) filters.push(eq(memoryItems.tier, input.tier));
  if (input.verification)
    filters.push(eq(memoryItems.verification, input.verification));
  if (input.status) filters.push(eq(memoryItems.status, input.status));
  if (input.sourceAgent)
    filters.push(eq(memoryItems.sourceAgent, input.sourceAgent));
  if (input.needsReview !== undefined)
    filters.push(eq(memoryItems.needsReview, input.needsReview));

  const rows = await db
    .select()
    .from(memoryItems)
    .where(and(...filters))
    .orderBy(desc(memoryItems.updatedAt), desc(memoryItems.id));
  return rows.map(memoryToDto);
}

export async function listMemoryReview(db: FlareMoDb, user: UserRow) {
  const rows = await db
    .select()
    .from(memoryItems)
    .where(
      and(
        eq(memoryItems.userId, user.id),
        or(
          eq(memoryItems.needsReview, true),
          eq(memoryItems.status, "disputed"),
        ),
      ),
    )
    .orderBy(desc(memoryItems.updatedAt), desc(memoryItems.id));
  return rows.map(memoryToDto);
}

export async function listMemoryRevisions(
  db: FlareMoDb,
  user: UserRow,
  memoryId: string,
) {
  await requireMemory(db, user, memoryId);
  const rows = await db
    .select()
    .from(memoryRevisions)
    .where(
      and(
        eq(memoryRevisions.memoryId, memoryId),
        eq(memoryRevisions.userId, user.id),
      ),
    )
    .orderBy(desc(memoryRevisions.createdAt));
  return rows.map(memoryRevisionToDto);
}

export async function listMemoryRelations(
  db: FlareMoDb,
  user: UserRow,
  memoryId: string,
) {
  await requireMemory(db, user, memoryId);
  const rows = await db
    .select()
    .from(memoryRelations)
    .where(
      and(
        eq(memoryRelations.userId, user.id),
        or(
          eq(memoryRelations.memoryId, memoryId),
          eq(memoryRelations.relatedMemoryId, memoryId),
        ),
      ),
    )
    .orderBy(desc(memoryRelations.createdAt));
  return rows.map(memoryRelationToDto);
}
