import type { MemoRow, UserRow } from "@flaremo/db";
import { describe, expect, it } from "vitest";
import {
  canEditMemo,
  canGovernMemo,
  canReadMemo,
  type TeamViewer,
} from "./team-permissions";

function user(id: string, role: "owner" | "admin" | "member"): TeamViewer {
  return {
    id,
    email: `${id}@example.com`,
    name: id,
    avatarUrl: null,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    teamRole: role,
    teamOrganizationId: "orgs/team",
  };
}

function userOutsideTeam(id: string): TeamViewer {
  return { ...user(id, "member"), teamRole: null, teamOrganizationId: null };
}

function memo(
  visibility: MemoRow["visibility"],
  overrides: Partial<Pick<MemoRow, "teamId" | "status">> = {},
): MemoRow {
  return {
    id: "memos/a",
    userId: "users/a",
    teamId: visibility === "private" ? null : "orgs/team",
    content: "content",
    visibility,
    status: "normal",
    pinned: false,
    source: "web",
    clientId: null,
    payload: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    deletedAt: null,
    embeddingStatus: "not_indexed",
    embeddingVersion: null,
    embeddedAt: null,
    embeddingError: null,
    embeddingChunks: null,
    ...overrides,
  };
}

describe("team memo permissions", () => {
  const author = user("users/a", "member");
  const member = user("users/b", "member");
  const admin = user("users/admin", "admin");
  const owner = user("users/owner2", "owner");

  it("keeps personal memos private from everyone but the author", () => {
    expect(canReadMemo(author, memo("private"))).toBe(true);
    expect(canReadMemo(member, memo("private"))).toBe(false);
    expect(canReadMemo(admin, memo("private"))).toBe(false);
    expect(canReadMemo(owner, memo("private"))).toBe(false);
    expect(canEditMemo(admin, memo("private"))).toBe(false);
    expect(canEditMemo(owner, memo("private"))).toBe(false);
    expect(canGovernMemo(admin, memo("private"))).toBe(false);
  });

  it("keeps memberless viewers out of team content", () => {
    const outsider = userOutsideTeam("users/out");
    expect(canReadMemo(outsider, memo("protected"))).toBe(false);
    expect(canReadMemo(outsider, memo("public"))).toBe(true);
  });

  it("makes team memos read-only for members and governable by admins", () => {
    expect(canReadMemo(member, memo("protected"))).toBe(true);
    expect(canEditMemo(member, memo("protected"))).toBe(false);
    expect(canGovernMemo(member, memo("protected"))).toBe(false);
    expect(canReadMemo(admin, memo("protected"))).toBe(true);
    expect(canEditMemo(admin, memo("protected"))).toBe(false);
    expect(canGovernMemo(admin, memo("protected"))).toBe(true);
  });

  it("lets the team owner edit another member's team memo but not a personal one", () => {
    expect(canEditMemo(owner, memo("protected"))).toBe(true);
    expect(canGovernMemo(owner, memo("protected"))).toBe(true);
    expect(canEditMemo(owner, memo("private"))).toBe(false);
  });

  it("gives the author every power over their own memo", () => {
    expect(canEditMemo(author, memo("private"))).toBe(true);
    expect(canEditMemo(author, memo("protected"))).toBe(true);
    expect(canGovernMemo(author, memo("protected"))).toBe(true);
  });

  it("rejects removed members", () => {
    const removed = { ...member, status: "removed" as const };
    expect(canReadMemo(removed, memo("protected"))).toBe(false);
    expect(canEditMemo(removed, memo("protected"))).toBe(false);
    expect(canGovernMemo(removed, memo("protected"))).toBe(false);
  });

  it("hides archived and trashed team memos from members, shows them to admins", () => {
    const archived = memo("protected", { status: "archived" });
    expect(canReadMemo(member, archived)).toBe(false);
    expect(canReadMemo(admin, archived)).toBe(true);
    const trashed = memo("protected", { status: "trashed" });
    expect(canReadMemo(member, trashed)).toBe(false);
    expect(canReadMemo(admin, trashed)).toBe(true);
  });

  it("never lets another organization's owner/admin edit, govern, or delete its public memos", () => {
    const foreignMemo = memo("protected", { teamId: "orgs/other" });
    const foreignPublic = memo("public", { teamId: "orgs/other" });
    for (const actor of [owner, admin, member]) {
      // Read stays world-readable for public rows, but every write power is
      // confined to the memo's own organization.
      expect(canEditMemo(actor, foreignMemo)).toBe(false);
      expect(canGovernMemo(actor, foreignMemo)).toBe(false);
      expect(canEditMemo(actor, foreignPublic)).toBe(false);
      expect(canGovernMemo(actor, foreignPublic)).toBe(false);
    }
  });
});
