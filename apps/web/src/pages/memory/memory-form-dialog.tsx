import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { createMemory, type Memory, updateMemory } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { stripResourceName } from "@/lib/utils";

export function MemoryFormDialog({
  memory,
  open,
  onOpenChange,
  onSaved,
}: {
  memory?: Memory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [content, setContent] = useState(memory?.content ?? "");
  const [type, setType] = useState<Memory["type"]>(memory?.type ?? "semantic");
  const [kind, setKind] = useState<Memory["kind"]>(memory?.kind ?? "fact");
  const [scopeType, setScopeType] = useState<Memory["scope_type"]>(
    memory?.scope_type ?? "global",
  );
  const [scopeKey, setScopeKey] = useState(memory?.scope_key ?? "");
  const [importance, setImportance] = useState(memory?.importance ?? 50);
  const [lock, setLock] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () =>
      memory
        ? updateMemory(stripResourceName(memory.id, "memories"), {
            content,
            type,
            kind,
            scope_type: scopeType,
            scope_key: scopeKey.trim() || undefined,
            importance,
          })
        : createMemory({
            content,
            type,
            kind,
            scope_type: scopeType,
            scope_key: scopeKey.trim() || undefined,
            tier: "normal",
            importance,
            lock,
          }),
    onSuccess: () => {
      toast.success(t("common.save"));
      if (!memory) {
        setContent("");
        setScopeKey("");
      }
      onOpenChange(false);
      onSaved();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t(memory ? "memory.updateFailed" : "memory.createFailed"),
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {memory ? t("memory.editMemory") : t("memory.newMemory")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field label={t("memory.content")}>
            <Textarea
              rows={4}
              value={content}
              placeholder={t("memory.contentPlaceholder")}
              onChange={(event) => setContent(event.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("memory.type")}>
              <Select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as Memory["type"])
                }
              >
                <option value="semantic">{t("memory.type.semantic")}</option>
                <option value="episodic">{t("memory.type.episodic")}</option>
                <option value="procedural">
                  {t("memory.type.procedural")}
                </option>
              </Select>
            </Field>
            <Field label={t("memory.kind")}>
              <Select
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as Memory["kind"])
                }
              >
                {KINDS.map((value) => (
                  <option key={value} value={value}>
                    {t(`memory.kind.${value}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("memory.scope")}>
              <Select
                value={scopeType}
                onChange={(event) =>
                  setScopeType(event.target.value as Memory["scope_type"])
                }
              >
                <option value="global">{t("memory.scope.global")}</option>
                <option value="workspace">{t("memory.scope.workspace")}</option>
                <option value="project">{t("memory.scope.project")}</option>
                <option value="agent">{t("memory.scope.agent")}</option>
              </Select>
            </Field>
            <Field label={t("memory.importance")}>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                max={100}
                min={0}
                type="number"
                value={importance}
                onChange={(event) =>
                  setImportance(Number.parseInt(event.target.value, 10) || 0)
                }
              />
            </Field>
          </div>
          {scopeType !== "global" && (
            <Field label={t("memory.scopeKey")}>
              <Input
                value={scopeKey}
                placeholder="github:owner/repo"
                onChange={(event) => setScopeKey(event.target.value)}
              />
            </Field>
          )}
          {!memory && (
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={lock}
                type="checkbox"
                onChange={(event) => setLock(event.target.checked)}
              />
              {t("memory.lock")}
            </label>
          )}
        </div>
        <DialogFooter>
          <Button
            disabled={!content.trim() || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const KINDS: Memory["kind"][] = [
  "preference",
  "fact",
  "decision",
  "constraint",
  "entity",
  "event",
  "outcome",
  "lesson",
  "procedure",
];
