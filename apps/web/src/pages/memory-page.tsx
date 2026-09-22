import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { listMemories, listMemoryReview } from "@/api";
import { SubpageHeader } from "@/components/subpage-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import { groupMemories } from "./memory/memory-filters";
import { MemoryFormDialog } from "./memory/memory-form-dialog";
import { MemoryList } from "./memory/memory-list";
import { ProjectGroups } from "./memory/project-groups";

type MemoryTab = "core" | "projects" | "recent" | "review" | "archive";

export function MemoryPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<MemoryTab>("core");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const listQuery = useQuery({
    queryKey: ["memories", "list"],
    queryFn: () => listMemories(),
  });

  const reviewQuery = useQuery({
    queryKey: ["memories", "review"],
    queryFn: () => listMemoryReview(),
  });

  const memories = useMemo(
    () => listQuery.data?.memories ?? [],
    [listQuery.data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return memories;
    return memories.filter((memory) =>
      memory.content.toLowerCase().includes(q),
    );
  }, [memories, query]);

  const groups = useMemo(() => groupMemories(filtered), [filtered]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["memories"] });
  };

  return (
    <div className="min-h-svh bg-background px-4 py-5 sm:py-8">
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        <SubpageHeader
          actions={
            <Button size="sm" onClick={() => setCreating(true)}>
              <PlusIcon data-icon="inline-start" />
              {t("memory.newMemory")}
            </Button>
          }
          title={t("memory.title")}
        />

        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            data-icon="inline-start"
          />
          <Input
            className="pl-9"
            placeholder={t("memory.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as MemoryTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="core">{t("memory.tab.core")}</TabsTrigger>
            <TabsTrigger value="projects">
              {t("memory.tab.projects")}
            </TabsTrigger>
            <TabsTrigger value="recent">{t("memory.tab.recent")}</TabsTrigger>
            <TabsTrigger value="review">
              {t("memory.tab.review")}
              {reviewQuery.data && reviewQuery.data.memories.length > 0 && (
                <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                  {reviewQuery.data.memories.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archive">{t("memory.tab.archive")}</TabsTrigger>
          </TabsList>

          <TabsContent value="core" className="mt-3">
            <MemoryList
              hasError={listQuery.isError && !listQuery.data}
              isRetrying={listQuery.isRefetching}
              loading={listQuery.isLoading}
              memories={groups.core}
              onMutated={invalidate}
              onRetry={() => void listQuery.refetch()}
            />
          </TabsContent>
          <TabsContent value="projects" className="mt-3">
            <ProjectGroups memories={groups.projects} onMutated={invalidate} />
          </TabsContent>
          <TabsContent value="recent" className="mt-3">
            <MemoryList
              hasError={listQuery.isError && !listQuery.data}
              isRetrying={listQuery.isRefetching}
              loading={listQuery.isLoading}
              memories={groups.recent}
              onMutated={invalidate}
              onRetry={() => void listQuery.refetch()}
              showSource
            />
          </TabsContent>
          <TabsContent value="review" className="mt-3">
            {reviewQuery.isError ? (
              <Empty className="min-h-56 border">
                <EmptyHeader>
                  <EmptyTitle>{t("list.errorTitle")}</EmptyTitle>
                  <EmptyDescription>
                    {t("list.errorDescription")}
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="outline"
                  onClick={() => void reviewQuery.refetch()}
                >
                  {t("common.retry")}
                </Button>
              </Empty>
            ) : (
              <MemoryList
                memories={reviewQuery.data?.memories ?? []}
                loading={reviewQuery.isLoading}
                onMutated={invalidate}
                review
              />
            )}
          </TabsContent>
          <TabsContent value="archive" className="mt-3">
            <MemoryList
              emptyTitle={t("memory.archiveEmpty")}
              hasError={listQuery.isError && !listQuery.data}
              isRetrying={listQuery.isRefetching}
              loading={listQuery.isLoading}
              memories={groups.archive}
              onMutated={invalidate}
              onRetry={() => void listQuery.refetch()}
            />
          </TabsContent>
        </Tabs>

        <MemoryFormDialog
          open={creating}
          onOpenChange={setCreating}
          onSaved={invalidate}
        />
      </main>
    </div>
  );
}
