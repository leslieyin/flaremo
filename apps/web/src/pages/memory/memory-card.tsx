import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArchiveIcon,
  CheckIcon,
  LockIcon,
  LockOpenIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  archiveMemory,
  confirmMemory,
  deleteMemory,
  lockMemory,
  type Memory,
  promoteMemoryToMemo,
  unlockMemory,
} from "@/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n";
import { errorMessage } from "@/lib/error";
import { stripResourceName } from "@/lib/utils";
import { MemoryFormDialog } from "./memory-form-dialog";
import { MemoryRevisions } from "./memory-revisions";

export function MemoryCard({
  memory,
  showSource,
  review,
  onMutated,
}: {
  memory: Memory;
  showSource: boolean;
  review: boolean;
  onMutated: () => void;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);

  const confirmMutation = useMutation({
    mutationFn: () => confirmMemory(stripResourceName(memory.id, "memories")),
    onSuccess: () => {
      toast.success(t("toast.memoryConfirmed"));
      onMutated();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("toast.memoryConfirmFailed"))),
  });

  const lockMutation = useMutation({
    mutationFn: () => lockMemory(stripResourceName(memory.id, "memories")),
    onSuccess: () => {
      toast.success(t("toast.memoryLocked"));
      onMutated();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("toast.memoryLockFailed"))),
  });

  const unlockMutation = useMutation({
    mutationFn: () => unlockMemory(stripResourceName(memory.id, "memories")),
    onSuccess: () => {
      toast.success(t("toast.memoryUnlocked"));
      onMutated();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("toast.memoryUnlockFailed"))),
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveMemory(stripResourceName(memory.id, "memories")),
    onSuccess: () => {
      toast.success(t("toast.memoryArchived"));
      onMutated();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("toast.memoryArchiveFailed"))),
  });

  const promoteMutation = useMutation({
    mutationFn: () =>
      promoteMemoryToMemo(stripResourceName(memory.id, "memories")),
    // A promoted memory produces a memo: the timeline and stats must refresh,
    // otherwise the promoted note only appears after some unrelated action.
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onMutated();
      void queryClient.invalidateQueries({ queryKey: ["memos"] });
      void queryClient.invalidateQueries({ queryKey: ["memo-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["tag-hierarchy"] });
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("toast.memoryPromoteFailed"))),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMemory(stripResourceName(memory.id, "memories")),
    onSuccess: () => {
      toast.success(t("toast.memoryDeleted"));
      onMutated();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("toast.memoryDeleteFailed"))),
  });

  const id = stripResourceName(memory.id, "memories");

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm whitespace-pre-wrap">{memory.content}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{t(`memory.type.${memory.type}`)}</Badge>
          <Badge variant="outline">{t(`memory.kind.${memory.kind}`)}</Badge>
          <Badge variant="secondary">
            {t(`memory.scope.${memory.scope_type}`)}
          </Badge>
          <Badge variant="brand">
            {t(`memory.verification.${memory.verification}`)}
          </Badge>
          {memory.tier === "core" && <Badge>{t("memory.tier.core")}</Badge>}
          {showSource && memory.source_agent && (
            <span className="text-xs text-muted-foreground">
              {t("memory.sourceAgent")}: {memory.source_agent}
            </span>
          )}
          {review && memory.review_reason && (
            <span className="text-xs text-muted-foreground">
              {memory.review_reason}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {memory.verification !== "locked" &&
            memory.verification !== "confirmed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirmMutation.mutate()}
              >
                <CheckIcon data-icon="inline-start" />
                {t("memory.confirm")}
              </Button>
            )}
          {memory.verification === "locked" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unlockMutation.mutate()}
            >
              <LockOpenIcon data-icon="inline-start" />
              {t("memory.unlock")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => lockMutation.mutate()}
            >
              <LockIcon data-icon="inline-start" />
              {t("memory.lock")}
            </Button>
          )}
          {memory.status === "active" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => archiveMutation.mutate()}
            >
              <ArchiveIcon data-icon="inline-start" />
              {t("memory.archive")}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label={t("common.actions")}
                  className="ml-auto"
                  size="icon-sm"
                  variant="ghost"
                >
                  <MoreHorizontalIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <PencilIcon />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowRevisions((value) => !value)}
              >
                {t("memory.revisions")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => promoteMutation.mutate()}>
                <NotebookPenIcon />
                {t("memory.toMemo")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2Icon />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showRevisions && <MemoryRevisions memoryId={id} />}

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("memory.deleteConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>
                {memory.content.slice(0, 80)}
                {memory.content.length > 80 ? "…" : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="ghost">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <MemoryFormDialog
          key={[
            memory.id,
            memory.content,
            memory.type,
            memory.kind,
            memory.scope_type,
            memory.scope_key ?? "",
            memory.importance,
          ].join("|")}
          memory={memory}
          open={editing}
          onOpenChange={setEditing}
          onSaved={onMutated}
        />
      </CardContent>
    </Card>
  );
}
