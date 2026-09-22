import type {
  MemoryDto,
  MemoryRelationDto,
  MemoryResourceLinkDto,
  MemoryRevisionDto,
} from "@flaremo/contracts";
import type {
  MemoryItemRow,
  memoryRelations,
  memoryResourceLinks,
  memoryRevisions,
} from "@flaremo/db";

export function memoryToDto(row: MemoryItemRow): MemoryDto {
  return {
    id: row.id,
    content: row.content,
    type: row.type,
    kind: row.kind,
    scope_type: row.scopeType,
    scope_key: row.scopeKey,
    tier: row.tier,
    verification: row.verification,
    status: row.status,
    importance: row.importance,
    confidence: row.confidence,
    needs_review: row.needsReview,
    review_reason: row.reviewReason,
    created_by_type: row.createdByType,
    source_agent: row.sourceAgent,
    source_session: row.sourceSession,
    source_ref: row.sourceRef,
    valid_from: row.validFrom,
    valid_to: row.validTo,
    access_count: row.accessCount,
    last_accessed_at: row.lastAccessedAt,
    embedding_status: row.embeddingStatus,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export function memoryRevisionToDto(
  row: typeof memoryRevisions.$inferSelect,
): MemoryRevisionDto {
  return {
    id: row.id,
    memory_id: row.memoryId,
    content: row.content,
    metadata_snapshot: row.metadataSnapshot,
    created_by_type: row.createdByType,
    created_by_agent: row.createdByAgent,
    created_at: row.createdAt,
  };
}

export function memoryRelationToDto(
  row: typeof memoryRelations.$inferSelect,
): MemoryRelationDto {
  return {
    memory_id: row.memoryId,
    related_memory_id: row.relatedMemoryId,
    type: row.type,
    created_at: row.createdAt,
  };
}

export function memoryResourceLinkToDto(
  row: typeof memoryResourceLinks.$inferSelect,
): MemoryResourceLinkDto {
  return {
    memory_id: row.memoryId,
    resource_type: row.resourceType,
    resource_ref: row.resourceRef,
    relation_type: row.relationType,
    metadata: row.metadata,
    created_at: row.createdAt,
  };
}
