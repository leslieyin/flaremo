import { useMemo } from "react";
import type { Memory } from "@/api";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useI18n } from "@/i18n";
import { MemoryList } from "./memory-list";

export function ProjectGroups({
  memories,
  onMutated,
}: {
  memories: Memory[];
  onMutated: () => void;
}) {
  const { t } = useI18n();
  const byProject = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const memory of memories) {
      const key = memory.scope_key ?? memory.scope_type;
      const list = map.get(key) ?? [];
      list.push(memory);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [memories]);

  if (byProject.length === 0) {
    return (
      <Empty className="min-h-56 border">
        <EmptyHeader>
          <EmptyTitle>{t("memory.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("memory.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {byProject.map(([project, items]) => (
        <section className="flex flex-col gap-2" key={project}>
          <h2 className="flex items-baseline gap-1.5 px-1 text-sm font-medium text-muted-foreground">
            <span className="truncate">{project}</span>
            <span className="text-xs tabular-nums opacity-60">
              {items.length}
            </span>
          </h2>
          <MemoryList
            memories={items}
            loading={false}
            onMutated={onMutated}
            showSource
          />
        </section>
      ))}
    </div>
  );
}
