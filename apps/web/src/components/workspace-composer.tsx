import type { MemoVisibility } from "@flaremo/contracts";
import { useNavigate } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { MemoSpace } from "@/api";
import { MemoComposer } from "@/components/memo-composer";
import { useMemoMutations } from "@/hooks/use-memo-mutations";
import { useNewMemoCapture } from "@/hooks/use-new-memo-capture";
import { useI18n } from "@/i18n";
import {
  enqueueMemoSubmission,
  flushQueuedMemoSubmissions,
  getNewMemoDraftId,
  isBrowserOnline,
  isMemoCaptureEmpty,
  type MemoCaptureInput,
} from "@/lib/local-memo-capture";
import {
  shouldContinueQueuedSubmissionAfterFailure,
  shouldQueueAfterFailure,
  validateMemoCaptureSubmission,
} from "@/lib/memo-submission";

// The composer's send target defaults to the active space ("归属在创建时决定").
// An explicit pick is remembered per space so a member who publishes to the
// team keeps that habit without re-selecting on every visit.
const VISIBILITY_PREF_KEY = "flaremo.composer.visibility";

type VisibilityPref = Partial<Record<MemoSpace, MemoVisibility>>;

function readVisibilityPref(): VisibilityPref {
  try {
    const raw = localStorage.getItem(VISIBILITY_PREF_KEY);
    const parsed = raw ? (JSON.parse(raw) as VisibilityPref) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeVisibilityPref(pref: VisibilityPref) {
  try {
    localStorage.setItem(VISIBILITY_PREF_KEY, JSON.stringify(pref));
  } catch {
    // Persistence is best-effort; the in-memory choice still applies.
  }
}

// Keep draft updates and upload progress inside the capture boundary. This
// component stays mounted across workspace filters so drafts and offline
// synchronization survive a visit to the archive or trash.
export const WorkspaceComposer = memo(function WorkspaceComposer({
  visible,
  composeRequested,
  space,
  hasTeam,
}: {
  visible: boolean;
  composeRequested: boolean;
  space: MemoSpace;
  hasTeam: boolean;
}) {
  const { t } = useI18n();
  const navigate = useNavigate({ from: "/" });
  const [newMemoDraftId] = useState(getNewMemoDraftId);
  const [visibilityPref, setVisibilityPref] =
    useState<VisibilityPref>(readVisibilityPref);
  const spaceDefault: MemoVisibility =
    hasTeam && space === "team" ? "protected" : "private";
  const preferredVisibility = visibilityPref[space] ?? spaceDefault;
  const capture = useNewMemoCapture({
    draftId: newMemoDraftId,
    initialVisibility: preferredVisibility,
  });
  const { createMemoAsync, isCreatingMemo, handleMutationError } =
    useMemoMutations();
  const isQueueFlushing = useRef(false);
  const isQueueFlushPending = useRef(false);
  const isCaptureSubmitting = useRef(false);
  const restoredDraftNotified = useRef(false);
  const [isCaptureSubmissionPending, setIsCaptureSubmissionPending] =
    useState(false);

  // Following the space into a different corpus retargets an untouched draft.
  // A draft with content keeps the visibility its author already chose.
  const lastVisibilitySource = useRef(preferredVisibility);
  // biome-ignore lint/correctness/useExhaustiveDependencies: retarget on preference change, not on every draft keystroke; the capture object is stable across renders
  useEffect(() => {
    if (lastVisibilitySource.current === preferredVisibility) return;
    lastVisibilitySource.current = preferredVisibility;
    if (!isMemoCaptureEmpty(capture.draft)) return;
    capture.updateDraft((current) => ({
      ...current,
      visibility: preferredVisibility,
    }));
  }, [preferredVisibility]);

  const flushQueuedCaptures = useCallback(async () => {
    if (!isBrowserOnline()) return;
    // An "online" event that lands while a flush is running (e.g. the mount
    // flush) must schedule another pass instead of being swallowed.
    if (isQueueFlushing.current) {
      isQueueFlushPending.current = true;
      return;
    }

    isQueueFlushing.current = true;
    try {
      let submitted = 0;
      let failed = 0;
      do {
        isQueueFlushPending.current = false;
        const result = await flushQueuedMemoSubmissions(
          (submission) => createMemoAsync(submission),
          {
            shouldContinueAfterFailure:
              shouldContinueQueuedSubmissionAfterFailure,
          },
        );
        submitted += result.submittedIds.length;
        failed += result.failedIds.length;
      } while (isQueueFlushPending.current && isBrowserOnline());
      if (submitted > 0) {
        toast.success(t("toast.queueSynced"));
      }
      if (failed > 0) {
        toast.error(t("toast.queueNeedsAttention", { count: failed }));
      }
    } finally {
      isQueueFlushing.current = false;
    }
  }, [createMemoAsync, t]);

  useEffect(() => {
    void flushQueuedCaptures();
    const handleOnline = () => void flushQueuedCaptures();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushQueuedCaptures]);

  useEffect(() => {
    if (!capture.didRestoreStoredDraft || restoredDraftNotified.current) return;
    restoredDraftNotified.current = true;
    toast.success(t("toast.draftRestored"));
  }, [capture.didRestoreStoredDraft, t]);

  // The PWA "new note" shortcut lands on `/?compose=1`. Focus the composer and
  // strip the flag so a later reload does not steal focus again.
  useEffect(() => {
    if (!composeRequested || !visible) return;
    const composer = document.getElementById("flaremo-composer-input");
    if (composer instanceof HTMLTextAreaElement) {
      composer.focus();
      composer.setSelectionRange(composer.value.length, composer.value.length);
    }
    void navigate({
      replace: true,
      search: (current) => ({ ...current, compose: undefined }),
    });
  }, [composeRequested, navigate, visible]);

  const handleCaptureSubmit = async (input: MemoCaptureInput) => {
    if (isCaptureSubmitting.current) return;

    isCaptureSubmitting.current = true;
    setIsCaptureSubmissionPending(true);
    const submission = {
      ...input,
      content: input.content || t("toast.untitledAttachment"),
    };
    try {
      const validationError = validateMemoCaptureSubmission(submission, t);
      if (validationError) {
        handleMutationError(validationError);
        throw validationError;
      }

      if (!isBrowserOnline()) {
        const queued = await enqueueMemoSubmission(submission);
        if (!queued) {
          const error = new Error(t("toast.offlineStorageUnavailable"));
          handleMutationError(error);
          throw error;
        }
        await capture.discardDraft();
        toast.success(t("toast.queuedForSync"));
        return;
      }

      try {
        await createMemoAsync(submission);
        await capture.discardDraft();
        toast.success(t("toast.saved"));
      } catch (error) {
        if (!shouldQueueAfterFailure(error)) {
          handleMutationError(error);
          throw error;
        }

        const queued = await enqueueMemoSubmission(submission);
        if (!queued) {
          handleMutationError(error);
          throw error;
        }
        await capture.discardDraft();
        toast.success(t("toast.queuedForSync"));
      }
    } finally {
      isCaptureSubmitting.current = false;
      setIsCaptureSubmissionPending(false);
    }
  };

  if (!visible) return null;
  return (
    <MemoComposer
      draft={capture.draft}
      isPending={isCreatingMemo || isCaptureSubmissionPending}
      showVisibility={hasTeam}
      onDraftChange={capture.updateDraft}
      onVisibilityChange={(visibility) => {
        setVisibilityPref((current) => {
          const next = { ...current, [space]: visibility };
          writeVisibilityPref(next);
          return next;
        });
      }}
      onSubmit={handleCaptureSubmit}
    />
  );
});
