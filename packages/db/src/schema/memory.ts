import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./auth";

// Agent Memory keeps AI-contributed long-term knowledge separate from the
// user's memo timeline. Each memory is an atomic conclusion (see
// docs/product-requirements.md and the Agent Memory design); long-form content
// belongs in a memo, and a memory's `content` only stores the conclusion.
// D1 remains the single source of truth: FTS and any future embedding index
// are derived and rebuildable from these rows.
export const memoryItems = sqliteTable(
  "memory_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: text("type", {
      enum: ["semantic", "episodic", "procedural"],
    })
      .notNull()
      .default("semantic"),
    kind: text("kind", {
      enum: [
        "preference",
        "fact",
        "decision",
        "constraint",
        "entity",
        "event",
        "outcome",
        "lesson",
        "procedure",
      ],
    })
      .notNull()
      .default("fact"),
    scopeType: text("scope_type", {
      enum: ["global", "workspace", "project", "agent"],
    })
      .notNull()
      .default("global"),
    scopeKey: text("scope_key"),
    tier: text("tier", { enum: ["core", "normal"] })
      .notNull()
      .default("normal"),
    verification: text("verification", {
      enum: ["inferred", "observed", "confirmed", "locked"],
    })
      .notNull()
      .default("observed"),
    status: text("status", {
      enum: ["active", "superseded", "disputed", "archived", "deleted"],
    })
      .notNull()
      .default("active"),
    importance: integer("importance").notNull().default(50),
    confidence: integer("confidence").notNull().default(50),
    needsReview: integer("needs_review", { mode: "boolean" })
      .notNull()
      .default(false),
    reviewReason: text("review_reason"),
    createdByType: text("created_by_type", { enum: ["user", "agent"] })
      .notNull()
      .default("agent"),
    sourceAgent: text("source_agent"),
    sourceSession: text("source_session"),
    sourceRef: text("source_ref"),
    validFrom: text("valid_from"),
    validTo: text("valid_to"),
    // Normalized content + type + kind + scope hash, used to reject exact
    // duplicates without an embedding index.
    fingerprint: text("fingerprint").notNull(),
    accessCount: integer("access_count").notNull().default(0),
    lastAccessedAt: text("last_accessed_at"),
    // Memory embeddings index into the memories vector index under the
    // owner's namespace; `not_indexed` is the pre-embedding state.
    embeddingStatus: text("embedding_status", {
      enum: ["not_indexed", "pending", "indexed", "error"],
    })
      .notNull()
      .default("not_indexed"),
    embeddingVersion: text("embedding_version"),
    embeddedAt: text("embedded_at"),
    embeddingError: text("embedding_error"),
    // Chunk count at last successful index (memories are single atomic
    // vectors, so this is 1 when indexed).
    embeddingChunks: integer("embedding_chunks"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    index("memory_items_user_scope_status_idx").on(
      table.userId,
      table.scopeType,
      table.scopeKey,
      table.status,
    ),
    index("memory_items_user_type_kind_idx").on(
      table.userId,
      table.type,
      table.kind,
    ),
    index("memory_items_user_tier_idx").on(table.userId, table.tier),
    uniqueIndex("memory_items_user_fingerprint_idx").on(
      table.userId,
      table.fingerprint,
    ),
  ],
);

export const memoryRevisions = sqliteTable(
  "memory_revisions",
  {
    id: text("id").primaryKey(),
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryItems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    metadataSnapshot: text("metadata_snapshot", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdByType: text("created_by_type", {
      enum: ["user", "agent"],
    }).notNull(),
    createdByAgent: text("created_by_agent"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("memory_revisions_memory_created_idx").on(
      table.memoryId,
      table.createdAt,
    ),
    index("memory_revisions_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export const memoryRelations = sqliteTable(
  "memory_relations",
  {
    id: text("id").primaryKey(),
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryItems.id, { onDelete: "cascade" }),
    relatedMemoryId: text("related_memory_id")
      .notNull()
      .references(() => memoryItems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "related_to",
        "supports",
        "contradicts",
        "supersedes",
        "depends_on",
        "part_of",
      ],
    })
      .notNull()
      .default("related_to"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("memory_relations_memory_related_type_idx").on(
      table.memoryId,
      table.relatedMemoryId,
      table.type,
    ),
    index("memory_relations_related_idx").on(table.relatedMemoryId, table.type),
  ],
);

export const memoryResourceLinks = sqliteTable(
  "memory_resource_links",
  {
    id: text("id").primaryKey(),
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryItems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceType: text("resource_type", {
      enum: ["memo", "session", "github", "url", "document", "other"],
    }).notNull(),
    resourceRef: text("resource_ref").notNull(),
    relationType: text("relation_type", {
      enum: ["derived_from", "evidence", "references", "promoted_to"],
    })
      .notNull()
      .default("derived_from"),
    metadata: text("metadata", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("memory_resource_links_memory_idx").on(table.memoryId),
    index("memory_resource_links_resource_idx").on(
      table.resourceType,
      table.resourceRef,
    ),
  ],
);
