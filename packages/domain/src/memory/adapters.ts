import type {
  CreateMemoryFromMemoInput,
  CreateMemoryInput,
  RememberInput,
} from "@flaremo/contracts";
import type { MemoryWriteInput } from "./shared";

export function createMemoryInputToWrite(
  input: CreateMemoryInput,
): MemoryWriteInput {
  return {
    content: input.content,
    type: input.type,
    kind: input.kind,
    scopeType: input.scope_type,
    scopeKey: input.scope_key ?? null,
    tier: input.tier,
    importance: input.importance,
    confidence: 100,
    verification: input.lock ? "locked" : "confirmed",
  };
}

export function createMemoryFromMemoInputToWrite(
  input: CreateMemoryFromMemoInput,
  fallbackContent: string,
): MemoryWriteInput {
  return {
    content: input.content ?? fallbackContent,
    type: input.type,
    kind: input.kind,
    scopeType: input.scope_type,
    scopeKey: input.scope_key ?? null,
    tier: input.tier,
    importance: input.importance,
    confidence: 100,
    verification: input.lock ? "locked" : "confirmed",
  };
}

export function rememberInputToWrite(input: RememberInput): MemoryWriteInput {
  return {
    content: input.content,
    type: input.type,
    kind: input.kind,
    scopeType: input.scope_type,
    scopeKey: input.scope_key ?? null,
    tier: input.tier,
    importance: input.importance,
    confidence: input.confidence,
    verification: input.verification,
    sourceAgent: input.source_agent,
    sourceSession: input.source_session,
    sourceRef: input.source_ref,
  };
}
