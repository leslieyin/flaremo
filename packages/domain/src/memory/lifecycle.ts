import type { MemoryForgetReason } from "@flaremo/contracts";
import type { FlareMoDb, MemoryItemRow, UserRow } from "@flaremo/db";
import { memoryItems } from "@flaremo/db";
import { and, eq } from "drizzle-orm";
import { insertEmbeddingTask } from "../embedding-outbox";
import { ForbiddenError } from "../errors";
import { memoryToDto } from "./dto";
import {
  appendRevision,
  assertAgentCanMutate,
  type MemoryActor,
  requireMemory,
} from "./shared";

export type ForgetMemoryInput = {
  reason: MemoryForgetReason;
};

async function setVerification(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
  verification: MemoryItemRow["verification"],
  reason?: string,
) {
  if (actor.type !== "user") {
    throw new ForbiddenError(
      "Only the user may change a memory's verification.",
    );
  }
  const existing = await requireMemory(db, user, id);
  await appendRevision(db, user, existing, "user");
  await db
    .update(memoryItems)
    .set({
      verification,
      needsReview: false,
      reviewReason: reason ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(memoryItems.id, id), eq(memoryItems.userId, user.id)));
  return memoryToDto(await requireMemory(db, user, id));
}

export function confirmMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
) {
  return setVerification(db, user, actor, id, "confirmed");
}

export function lockMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
) {
  return setVerification(db, user, actor, id, "locked");
}

export function unlockMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
) {
  return setVerification(db, user, actor, id, "confirmed");
}

export async function archiveMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
) {
  if (actor.type !== "user") {
    throw new ForbiddenError("Only the user may archive a memory.");
  }
  const existing = await requireMemory(db, user, id);
  await appendRevision(db, user, existing, "user");
  await db
    .update(memoryItems)
    .set({
      status: "archived",
      needsReview: false,
      reviewReason: null,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(memoryItems.id, id), eq(memoryItems.userId, user.id)));
  return memoryToDto(await requireMemory(db, user, id));
}

export async function hardDeleteMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
) {
  if (actor.type !== "user") {
    throw new ForbiddenError("Only the user may hard-delete a memory.");
  }
  await requireMemory(db, user, id);
  await db
    .delete(memoryItems)
    .where(and(eq(memoryItems.id, id), eq(memoryItems.userId, user.id)));
  await insertEmbeddingTask(db, {
    userId: user.id,
    resourceType: "memory",
    resourceId: id,
    operation: "delete",
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}

/**
 * `forget` is the agent-facing retirement path. Agents never hard-delete; a
 * "superseded" reason marks the memory superseded, anything else archives it.
 */
export async function forgetMemory(
  db: FlareMoDb,
  user: UserRow,
  actor: MemoryActor,
  id: string,
  input: ForgetMemoryInput,
) {
  const existing = await requireMemory(db, user, id);
  assertAgentCanMutate(actor, existing);
  await appendRevision(
    db,
    user,
    existing,
    actor.type === "user" ? "user" : "agent",
    actor.type === "agent" ? actor.name : null,
  );
  const status: MemoryItemRow["status"] =
    input.reason === "superseded" ? "superseded" : "archived";
  await db
    .update(memoryItems)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(and(eq(memoryItems.id, id), eq(memoryItems.userId, user.id)));
  await insertEmbeddingTask(db, {
    userId: user.id,
    resourceType: "memory",
    resourceId: existing.id,
    operation: "delete",
    createdAt: new Date().toISOString(),
  });
  return memoryToDto(await requireMemory(db, user, id));
}
