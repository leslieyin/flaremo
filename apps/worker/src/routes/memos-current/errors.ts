import type { getRequestContext } from "../../context";
import { isBetterAuthCredentialError } from "../../memos-compat/credential";
import { isDomainError } from "../../memos-compat/errors";
import { isRecord } from "./helpers";
export function currentJsonError(
  c: Parameters<typeof getRequestContext>[0],
  error: unknown,
) {
  const status = currentErrorStatus(error);
  const message = currentErrorMessage(error);
  return c.json(
    {
      code: currentErrorCode(status),
      message,
      details: [],
    },
    status as 400 | 401 | 403 | 404 | 409 | 413 | 422 | 500,
  );
}

function currentErrorStatus(error: unknown) {
  if (isDomainError(error)) return error.status;
  if (isBetterAuthCredentialError(error)) return 400;
  if (isRecord(error) && typeof error.statusCode === "number")
    return error.statusCode;
  if (isRecord(error) && typeof error.status === "number") return error.status;
  if (isRecord(error) && Array.isArray(error.issues)) return 400;
  console.error(
    JSON.stringify({
      level: "error",
      message: "Unhandled current Memos compatibility request error",
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  return 500;
}

function currentErrorMessage(error: unknown) {
  if (isDomainError(error)) return error.message;
  if (isBetterAuthCredentialError(error))
    return "unmatched username and password";
  // Framework errors (Better Auth, transport codecs) carry controlled,
  // caller-facing messages alongside their status. Everything else without a
  // domain type — D1 failures, TypeErrors — stays generic so internal
  // details never reach the response body.
  if (isRecord(error) && controlledErrorStatus(error) !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  if (isRecord(error) && Array.isArray(error.issues)) {
    return error.issues
      .map((issue) =>
        isRecord(issue) && typeof issue.message === "string"
          ? issue.message
          : "Invalid request",
      )
      .join("; ");
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
  if (status === 429) return 8;
  return 13;
}
