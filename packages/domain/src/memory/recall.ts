import type { FlareMoDb, MemoryItemRow, UserRow } from "@flaremo/db";
import { memoryItems } from "@flaremo/db";
import { and, desc, eq, inArray, or, type SQL } from "drizzle-orm";
import { buildFtsCondition } from "./shared";

export const MEMORY_DEFAULT_RECALL_LIMIT = 8;
export const MEMORY_MAX_RECALL_LIMIT = 20;
export const MEMORY_DEFAULT_BOOTSTRAP_MAX_ITEMS = 20;
export const MEMORY_BOOTSTRAP_CHAR_BUDGET = 6_000;
const MEMORY_RECALL_CANDIDATE_LIMIT = 50;

type MemoryScopeFilter = {
  projectKey?: string;
  workspaceKey?: string;
  agentName?: string;
};

export type RecallMemoriesInput = {
  query: string;
  agent: string;
  projectKey?: string;
  workspaceKey?: string;
  types?: MemoryItemRow["type"][];
  kinds?: MemoryItemRow["kind"][];
  limit?: number;
};

export type RecallMemoriesDeps = {
  provider: import("../embedding").EmbeddingProvider;
  index: import("../embedding").VectorIndex;
  /** Scopes the vector query to one tenant inside a shared index. */
  namespace?: string;
};

// Verification is a hard authority tier, not a soft relevance hint, so locked
// and confirmed memories outrank anything an agent inferred.
const VERIFICATION_WEIGHT: Record<MemoryItemRow["verification"], number> = {
  locked: 100,
  confirmed: 80,
  observed: 50,
  inferred: 20,
};

function buildScopeFilter(user: UserRow, filter: MemoryScopeFilter) {
  const scopes: Array<SQL | undefined> = [eq(memoryItems.scopeType, "global")];
  if (filter.projectKey) {
    scopes.push(
      and(
        eq(memoryItems.scopeType, "project"),
        eq(memoryItems.scopeKey, filter.projectKey),
      ),
    );
  }
  if (filter.workspaceKey) {
    scopes.push(
      and(
        eq(memoryItems.scopeType, "workspace"),
        eq(memoryItems.scopeKey, filter.workspaceKey),
      ),
    );
  }
  if (filter.agentName) {
    scopes.push(
      and(
        eq(memoryItems.scopeType, "agent"),
        eq(memoryItems.scopeKey, `agent:${filter.agentName}`),
      ),
    );
  }
  return and(eq(memoryItems.userId, user.id), or(...scopes.filter(Boolean)));
}

function rankMemory(row: MemoryItemRow): number {
  let score =
    VERIFICATION_WEIGHT[row.verification] + row.importance + row.confidence;
  // Episodic memories fade with age; semantic facts, procedures, and decisions
  // must not silently decay out of recall.
  if (row.type === "episodic") {
    const ageDays =
      (Date.now() - new Date(row.updatedAt).getTime()) / 86_400_000;
    score -= Math.min(Math.floor(ageDays / 30), 20);
  }
  return score;
}

export async function recallMemories(
  db: FlareMoDb,
  user: UserRow,
  input: RecallMemoriesInput,
  deps?: RecallMemoriesDeps,
) {
  const scopeFilter = buildScopeFilter(user, {
    projectKey: input.projectKey,
    workspaceKey: input.workspaceKey,
    agentName: input.agent,
  });

  const filters = [
    scopeFilter,
    eq(memoryItems.status, "active"),
    eq(memoryItems.needsReview, false),
  ];
  if (input.types?.length) {
    filters.push(inArray(memoryItems.type, input.types));
  }
  if (input.kinds?.length) {
    filters.push(inArray(memoryItems.kind, input.kinds));
  }

  const rows = await db
    .select()
    .from(memoryItems)
    .where(and(...filters))
    .limit(MEMORY_RECALL_CANDIDATE_LIMIT);

  // Semantic recall takes priority when a provider and index are available
  // and the query has meaning; otherwise fall back to FTS5. A semantic miss
  // must not silently recall unrelated memories by authority alone.
  let candidates = rows;
  let matchedBy: "fts" | "semantic" = "fts";
  if (deps) {
    try {
      const [queryVector] = await deps.provider.embed([input.query]);
      if (queryVector && queryVector.length > 0) {
        const matches = await deps.index.query(
          queryVector,
          MEMORY_RECALL_CANDIDATE_LIMIT,
          deps.namespace,
        );
        const matchedIds = new Set(matches.map((match) => match.id));
        candidates = rows.filter((row) => matchedIds.has(row.id));
        matchedBy = "semantic";
      }
    } catch (error) {
      // Semantic recall is degradable: fall back to the FTS path on any
      // provider or index failure. The failure is still logged — a silent
      // degradation here once hid a wiring regression.
      console.error(
        JSON.stringify({
          message: "Semantic memory recall failed; falling back to FTS",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      matchedBy = "fts";
    }
  } else {
    const withText = buildFtsCondition(input.query);
    if (withText) {
      const matchedIds = new Set(
        (
          await db
            .select({ id: memoryItems.id })
            .from(memoryItems)
            .where(and(...filters, withText))
            .limit(MEMORY_RECALL_CANDIDATE_LIMIT)
        ).map((row) => row.id),
      );
      // A query that matches nothing via FTS should not silently recall by
      // authority alone; return the empty set rather than unrelated memories.
      candidates = rows.filter((row) => matchedIds.has(row.id));
    }
  }

  candidates.sort((a, b) => rankMemory(b) - rankMemory(a));
  const limit = Math.min(
    input.limit ?? MEMORY_DEFAULT_RECALL_LIMIT,
    MEMORY_MAX_RECALL_LIMIT,
  );
  return candidates.slice(0, limit).map((row) => ({
    id: row.id,
    content: row.content,
    type: row.type,
    kind: row.kind,
    scope: row.scopeType,
    scope_key: row.scopeKey,
    tier: row.tier,
    verification: row.verification,
    importance: row.importance,
    source: row.sourceRef,
    source_agent: row.sourceAgent,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    score: rankMemory(row),
    matched_by: matchedBy,
  }));
}

export async function bootstrapMemory(
  db: FlareMoDb,
  user: UserRow,
  input: {
    agent: string;
    projectKey?: string;
    workspaceKey?: string;
    maxItems?: number;
  },
) {
  const scopeFilter = buildScopeFilter(user, {
    projectKey: input.projectKey,
    workspaceKey: input.workspaceKey,
    agentName: input.agent,
  });

  const rows = await db
    .select()
    .from(memoryItems)
    .where(
      and(
        scopeFilter,
        eq(memoryItems.status, "active"),
        eq(memoryItems.needsReview, false),
      ),
    )
    .orderBy(desc(memoryItems.updatedAt), desc(memoryItems.id));

  // Core memories and locked/confirmed constraints are the highest-value
  // bootstrap context; fill the remaining budget with recent lessons.
  const core = rows.filter((row) => row.tier === "core");
  const constraints = rows.filter(
    (row) =>
      row.kind === "constraint" &&
      (row.verification === "locked" || row.verification === "confirmed"),
  );
  const decisions = rows.filter(
    (row) =>
      row.kind === "decision" &&
      (row.verification === "locked" || row.verification === "confirmed"),
  );
  const rest = rows.filter(
    (row) =>
      row.tier !== "core" &&
      row.kind !== "constraint" &&
      row.kind !== "decision",
  );

  const maxItems = Math.min(
    input.maxItems ?? MEMORY_DEFAULT_BOOTSTRAP_MAX_ITEMS,
    MEMORY_DEFAULT_BOOTSTRAP_MAX_ITEMS,
  );
  const selected: MemoryItemRow[] = [];
  const seen = new Set<string>();
  const push = (row: MemoryItemRow) => {
    if (!seen.has(row.id) && selected.length < maxItems) {
      seen.add(row.id);
      selected.push(row);
    }
  };
  for (const group of [core, constraints, decisions, rest]) {
    group.sort((a, b) => rankMemory(b) - rankMemory(a));
    for (const row of group) push(row);
  }

  const items = selected
    .sort((a, b) => rankMemory(b) - rankMemory(a))
    .map((row) => ({
      id: row.id,
      content: row.content,
      type: row.type,
      kind: row.kind,
      scope: row.scopeType,
      scope_key: row.scopeKey,
      tier: row.tier,
      verification: row.verification,
      importance: row.importance,
      source: row.sourceRef,
      source_agent: row.sourceAgent,
    }));

  let total = 0;
  const trimmed: typeof items = [];
  for (const item of items) {
    if (total + item.content.length > MEMORY_BOOTSTRAP_CHAR_BUDGET) break;
    total += item.content.length;
    trimmed.push(item);
  }

  return { items: trimmed };
}
