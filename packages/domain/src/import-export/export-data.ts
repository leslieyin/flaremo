import type { ImportBundle } from "@flaremo/contracts";
import type { FlareMoDb, UserRow } from "@flaremo/db";
import {
  attachments,
  memoRelations,
  memoryItems,
  memoryRelations,
  memoryResourceLinks,
  memoryRevisions,
  memos,
  projects,
  shares,
  taskActivity,
  tasks,
} from "@flaremo/db";
import { asc, eq, inArray } from "drizzle-orm";

/**
 * The export half of import-export.ts, moved verbatim: dumps every
 * user-owned table (including recycle-bin rows) into a versioned
 * ImportBundle.
 */
export async function exportData(
  db: FlareMoDb,
  user: UserRow,
): Promise<ImportBundle> {
  const [
    memoRows,
    attachmentRows,
    shareRows,
    memoryRows,
    memoryRevisionRows,
    memoryRelationRows,
    memoryResourceLinkRows,
    projectRows,
    taskRows,
    taskActivityRows,
  ] = await Promise.all([
    db.select().from(memos).where(eq(memos.userId, user.id)),
    db.select().from(attachments).where(eq(attachments.userId, user.id)),
    db.select().from(shares).where(eq(shares.userId, user.id)),
    db.select().from(memoryItems).where(eq(memoryItems.userId, user.id)),
    db
      .select()
      .from(memoryRevisions)
      .where(eq(memoryRevisions.userId, user.id)),
    db
      .select()
      .from(memoryRelations)
      .where(eq(memoryRelations.userId, user.id)),
    db
      .select()
      .from(memoryResourceLinks)
      .where(eq(memoryResourceLinks.userId, user.id)),
    db.select().from(projects).where(eq(projects.userId, user.id)),
    db.select().from(tasks).where(eq(tasks.userId, user.id)),
    db
      .select()
      .from(taskActivity)
      .where(eq(taskActivity.userId, user.id))
      .orderBy(asc(taskActivity.id)),
  ]);

  const memoIds = new Set(memoRows.map((memo) => memo.id));
  const relationRows: Array<typeof memoRelations.$inferSelect> = [];
  const memoIdList = Array.from(memoIds);
  for (let offset = 0; offset < memoIdList.length; offset += 500) {
    const memoIdChunk = memoIdList.slice(offset, offset + 500);
    if (memoIdChunk.length === 0) continue;
    relationRows.push(
      ...(await db
        .select()
        .from(memoRelations)
        .where(inArray(memoRelations.memoId, memoIdChunk))
        .all()),
    );
  }
  return {
    version: 4,
    exported_at: new Date().toISOString(),
    memos: memoRows.map((memo) => ({
      name: memo.id,
      content: memo.content,
      visibility: memo.visibility,
      state: memo.status,
      pinned: memo.pinned,
      payload: memo.payload ?? {},
      source: memo.source,
      create_time: memo.createdAt,
      update_time: memo.updatedAt,
      display_time: memo.createdAt,
    })),
    attachments: attachmentRows
      .filter((attachment) => !attachment.deletedAt)
      .map((attachment) => ({
        name: attachment.id,
        id: attachment.id.replace(/^attachments\//, ""),
        memo: attachment.memoId,
        filename: attachment.filename,
        content_type: attachment.contentType,
        size: attachment.size,
        state: attachment.state,
        etag: attachment.etag,
        payload: attachment.payload ?? {},
        create_time: attachment.createdAt,
        update_time: attachment.updatedAt,
      })),
    relations: relationRows
      .filter(
        (relation) =>
          memoIds.has(relation.memoId) && memoIds.has(relation.relatedMemoId),
      )
      .map((relation) => ({
        memo: relation.memoId,
        related_memo: relation.relatedMemoId,
        type: relation.type,
        create_time: relation.createdAt,
      })),
    shares: shareRows.map((share) => ({
      name: share.id,
      id: share.id.replace(/^shares\//, ""),
      memo: share.memoId,
      token: share.token,
      expires_at: share.expiresAt,
      create_time: share.createdAt,
      update_time: share.updatedAt,
      revoked_at: share.revokedAt,
    })),
    memories: memoryRows.map((memory) => ({
      name: memory.id,
      content: memory.content,
      type: memory.type,
      kind: memory.kind,
      scope_type: memory.scopeType,
      scope_key: memory.scopeKey,
      tier: memory.tier,
      verification: memory.verification,
      status: memory.status,
      importance: memory.importance,
      confidence: memory.confidence,
      needs_review: memory.needsReview,
      review_reason: memory.reviewReason,
      created_by_type: memory.createdByType,
      source_agent: memory.sourceAgent,
      source_session: memory.sourceSession,
      source_ref: memory.sourceRef,
      valid_from: memory.validFrom,
      valid_to: memory.validTo,
      created_at: memory.createdAt,
      updated_at: memory.updatedAt,
    })),
    memory_revisions: memoryRevisionRows.map((revision) => ({
      name: revision.id,
      memory_id: revision.memoryId,
      content: revision.content,
      metadata_snapshot: revision.metadataSnapshot,
      created_by_type: revision.createdByType,
      created_by_agent: revision.createdByAgent,
      created_at: revision.createdAt,
    })),
    memory_relations: memoryRelationRows.map((relation) => ({
      memory_id: relation.memoryId,
      related_memory_id: relation.relatedMemoryId,
      type: relation.type,
      created_at: relation.createdAt,
    })),
    memory_resource_links: memoryResourceLinkRows.map((link) => ({
      memory_id: link.memoryId,
      resource_type: link.resourceType,
      resource_ref: link.resourceRef,
      relation_type: link.relationType,
      metadata: link.metadata,
      created_at: link.createdAt,
    })),
    // Recycle-bin rows travel too: a backup that quietly drops soft-deleted
    // data is a lossy backup. `deleted_at` rides along so an import into a
    // fresh account reproduces the bin state.
    projects: projectRows.map((project) => ({
      name: project.id,
      title: project.name,
      description: project.description,
      status: project.status,
      deleted_at: project.deletedAt,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    })),
    tasks: taskRows.map((task) => ({
      name: task.id,
      project_id: task.projectId,
      source_memo_id: task.sourceMemoId,
      title: task.title,
      notes: task.notes,
      status: task.status,
      priority: task.priority,
      due_at: task.dueAt,
      sort_order: task.sortOrder,
      completed_at: task.completedAt,
      deleted_at: task.deletedAt,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    })),
    task_activity: taskActivityRows.map((activity) => ({
      task_id: activity.taskId,
      actor_type: activity.actorType,
      actor_name: activity.actorName,
      action: activity.action,
      changes: activity.changes,
      created_at: activity.createdAt,
    })),
  };
}
