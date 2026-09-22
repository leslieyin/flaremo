import { apiRequest } from "./client";
import type {
  CreateMemoryRequest,
  Memory,
  MemoryRevision,
  UpdateMemoryRequest,
} from "./types";

export type ListMemoriesParams = {
  q?: string;
  type?: Memory["type"];
  kind?: Memory["kind"];
  scope_type?: Memory["scope_type"];
  scope_key?: string;
  tier?: Memory["tier"];
  verification?: Memory["verification"];
  status?: Memory["status"];
  source_agent?: string;
  needs_review?: boolean;
};

export async function listMemories(params: ListMemoriesParams = {}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.type) query.set("type", params.type);
  if (params.kind) query.set("kind", params.kind);
  if (params.scope_type) query.set("scope_type", params.scope_type);
  if (params.scope_key) query.set("scope_key", params.scope_key);
  if (params.tier) query.set("tier", params.tier);
  if (params.verification) query.set("verification", params.verification);
  if (params.status) query.set("status", params.status);
  if (params.source_agent) query.set("source_agent", params.source_agent);
  if (params.needs_review !== undefined)
    query.set("needs_review", String(params.needs_review));

  return apiRequest<{ memories: Memory[] }>(
    `/api/app/memory?${query.toString()}`,
  );
}

export async function listMemoryReview() {
  return apiRequest<{ memories: Memory[] }>("/api/app/memory/review");
}

export async function createMemory(input: CreateMemoryRequest) {
  return apiRequest<{ duplicate: boolean; memory: Memory }>("/api/app/memory", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMemory(id: string, input: UpdateMemoryRequest) {
  return apiRequest<{ memory: Memory }>(
    `/api/app/memory/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function deleteMemory(id: string) {
  return apiRequest<{ ok: true }>(`/api/app/memory/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function confirmMemory(id: string) {
  return apiRequest<{ memory: Memory }>(
    `/api/app/memory/${encodeURIComponent(id)}/confirm`,
    { method: "POST" },
  );
}

export async function lockMemory(id: string) {
  return apiRequest<{ memory: Memory }>(
    `/api/app/memory/${encodeURIComponent(id)}/lock`,
    { method: "POST" },
  );
}

export async function unlockMemory(id: string) {
  return apiRequest<{ memory: Memory }>(
    `/api/app/memory/${encodeURIComponent(id)}/unlock`,
    { method: "POST" },
  );
}

export async function archiveMemory(id: string) {
  return apiRequest<{ memory: Memory }>(
    `/api/app/memory/${encodeURIComponent(id)}/archive`,
    { method: "POST" },
  );
}

export async function listMemoryRevisions(id: string) {
  return apiRequest<{ revisions: MemoryRevision[] }>(
    `/api/app/memory/${encodeURIComponent(id)}/revisions`,
  );
}

export async function createMemoryFromMemo(
  memoId: string,
  input: {
    content?: string;
    type?: Memory["type"];
    kind?: Memory["kind"];
    scope_type?: Memory["scope_type"];
    scope_key?: string;
    tier?: Memory["tier"];
    importance?: number;
    lock?: boolean;
  },
) {
  return apiRequest<{ duplicate: boolean; memory: Memory }>(
    `/api/app/memos/${encodeURIComponent(memoId)}/memory`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function promoteMemoryToMemo(id: string) {
  return apiRequest<{ memory: Memory; memo: string }>(
    `/api/app/memory/${encodeURIComponent(id)}/promote`,
    { method: "POST" },
  );
}
