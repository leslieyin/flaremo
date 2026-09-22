import type { DomainError } from "@flaremo/domain";
import type { Context } from "hono";
import type { HonoBindings } from "../../context";

export function currentJsonError(c: Context<HonoBindings>, error: unknown) {
  const status = currentErrorStatus(error);
  return c.json(
    {
      code: currentErrorCode(status),
      message: currentErrorMessage(error),
      details: [],
    },
    status as 400 | 401 | 403 | 404 | 409 | 413 | 422 | 500,
  );
}

function currentErrorStatus(error: unknown) {
  if (error instanceof CurrentHttpError) return error.status;
  if (isDomainError(error)) return error.status;
  if (isRecord(error) && typeof error.statusCode === "number") {
    return error.statusCode;
  }
  if (isRecord(error) && typeof error.status === "number") {
    return error.status;
  }
  console.error(
    JSON.stringify({
      level: "error",
      message: "Unhandled current Memos social compatibility request error",
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  return 500;
}

function currentErrorMessage(error: unknown) {
  if (error instanceof CurrentHttpError) return error.message;
  if (isDomainError(error)) return error.message;
  // Framework errors (transport codecs) carry controlled, caller-facing
  // messages alongside their status. Everything else without a domain type —
  // D1 failures, TypeErrors — stays generic so internal details never reach
  // the response body.
  if (isRecord(error) && controlledErrorStatus(error) !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "Internal server error";
}

function controlledErrorStatus(error: Record<string, unknown>): number | null {
  const status =
    typeof error.statusCode === "number"
      ? error.statusCode
      : typeof error.status === "number"
        ? error.status
        : null;
  return status !== null && status < 500 ? status : null;
}

function currentErrorCode(status: number) {
  if (status === 400 || status === 422) return 3;
  if (status === 401) return 16;
  if (status === 403) return 7;
  if (status === 404) return 5;
  if (status === 409) return 6;
  if (status === 413) return 8;
  return 13;
}

function isDomainError(error: unknown): error is DomainError {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

class CurrentHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export class ValidationCurrentError extends CurrentHttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ForbiddenCurrentError extends CurrentHttpError {
  constructor(message: string) {
    super(message, 403);
  }
}
