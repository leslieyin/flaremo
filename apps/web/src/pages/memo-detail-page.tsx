import { BrainIcon } from "lucide-react";
import type { Memo, MemoContext, RelatedMemo } from "@/api";
import { SubpageHeader } from "@/components/subpage-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import { formatMemoTime } from "@/lib/memo";
import type { MemoDetailTaskInteraction } from "./memo-detail/content-tab";
import { ContentTab } from "./memo-detail/content-tab";
import { HistoryTab } from "./memo-detail/history-tab";
import { RelationsTab } from "./memo-detail/relations-tab";
import { SharingTab } from "./memo-detail/sharing-tab";
import { useMemoDetail } from "./memo-detail/use-memo-detail";

export function MemoDetailPage({ memoId }: { memoId: string }) {
  const { locale, t } = useI18n();
  const {
    contextQuery,
    relationCandidatesQuery,
    relatedQuery,
    relatedMemo,
    setRelatedMemo,
    shareMutation,
    revokeMutation,
    restoreMutation,
    relationMutation,
    rememberMutation,
    taskInteraction,
  } = useMemoDetail(memoId);

  return (
    <div className="min-h-svh bg-background px-4 py-5 sm:py-8">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <SubpageHeader />

        {contextQuery.isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
        {contextQuery.isError && (
          <Empty className="min-h-72 border">
            <EmptyHeader>
              <EmptyTitle>{t("detail.unavailable")}</EmptyTitle>
              <EmptyDescription>{t("list.errorDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {contextQuery.data && (
          <MemoDetail
            candidates={(relationCandidatesQuery.data?.memos ?? []).filter(
              (memo) =>
                memo.name !== contextQuery.data.memo.name &&
                !contextQuery.data.relations.some(
                  ({ relation }) => relation.related_memo === memo.name,
                ),
            )}
            context={contextQuery.data}
            canManage={contextQuery.data.can_manage}
            canGovern={contextQuery.data.can_govern}
            isSearching={relationCandidatesQuery.isFetching}
            locale={locale}
            related={relatedQuery.data?.memos ?? []}
            relatedPending={relatedQuery.isPending}
            relatedMemo={relatedMemo}
            setRelatedMemo={setRelatedMemo}
            onAddRelation={(name) => {
              const relations = contextQuery.data.relations.map(
                ({ relation }) => ({
                  related_memo: relation.related_memo,
                  type: relation.type,
                }),
              );
              if (relations.some((item) => item.related_memo === name)) return;
              relationMutation.mutate({
                action: "add",
                relations: [
                  ...relations,
                  { related_memo: name, type: "reference" },
                ],
              });
            }}
            onCreateShare={() => shareMutation.mutate()}
            onRestore={(revision) => restoreMutation.mutate(revision)}
            onRemoveRelation={(name) =>
              relationMutation.mutate({
                action: "remove",
                relations: contextQuery.data.relations
                  .filter(({ relation }) => relation.related_memo !== name)
                  .map(({ relation }) => ({
                    related_memo: relation.related_memo,
                    type: relation.type,
                  })),
              })
            }
            onRevoke={(share) => revokeMutation.mutate(share)}
            onRemember={() => rememberMutation.mutate()}
            taskInteraction={taskInteraction}
            rememberPending={rememberMutation.isPending}
            relationPending={relationMutation.isPending}
            restorePending={restoreMutation.isPending}
            revokePending={revokeMutation.isPending}
            sharePending={shareMutation.isPending}
          />
        )}
      </main>
    </div>
  );
}

function MemoDetail({
  canManage,
  canGovern,
  taskInteraction,
  candidates,
  context,
  isSearching,
  locale,
  related,
  relatedPending,
  relatedMemo,
  setRelatedMemo,
  onAddRelation,
  onCreateShare,
  onRemember,
  onRestore,
  onRemoveRelation,
  onRevoke,
  rememberPending,
  relationPending,
  restorePending,
  revokePending,
  sharePending,
}: {
  canManage: boolean;
  canGovern: boolean;
  taskInteraction: MemoDetailTaskInteraction | undefined;
  candidates: Memo[];
  context: MemoContext;
  isSearching: boolean;
  locale: string;
  related: RelatedMemo[];
  relatedPending: boolean;
  relatedMemo: string;
  setRelatedMemo: (value: string) => void;
  onAddRelation: (name: string) => void;
  onCreateShare: () => void;
  onRemember: () => void;
  onRestore: (revision: string) => void;
  onRemoveRelation: (name: string) => void;
  onRevoke: (share: string) => void;
  rememberPending: boolean;
  relationPending: boolean;
  restorePending: boolean;
  revokePending: boolean;
  sharePending: boolean;
}) {
  const { t } = useI18n();
  return (
    // overflow-clip keeps the rounded clipping but, unlike the Card base's
    // overflow-hidden, does not turn the card into a scroll container — the
    // sticky reading transport needs the viewport as its scrollport.
    <Card className="overflow-clip">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {formatMemoTime(context.memo.display_time, locale)}
            {context.memo.creator_name ? ` · ${context.memo.creator_name}` : ""}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {context.memo.pinned && <Badge>{t("memo.pinnedBadge")}</Badge>}
            <Badge variant="outline">
              {t(`visibility.${context.memo.visibility}`)}
            </Badge>
            <Button
              disabled={rememberPending}
              size="sm"
              variant="ghost"
              onClick={onRemember}
            >
              <BrainIcon data-icon="inline-start" />
              {t("memory.newMemory")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="content">{t("detail.content")}</TabsTrigger>
            <TabsTrigger value="relations">
              {t("detail.relations")}
              {context.relations.length + context.backlinks.length > 0
                ? ` (${context.relations.length + context.backlinks.length})`
                : ""}
            </TabsTrigger>
            {(canManage || canGovern) && (
              <TabsTrigger value="history">{t("detail.history")}</TabsTrigger>
            )}
            {canManage && (
              <TabsTrigger value="sharing">{t("detail.sharing")}</TabsTrigger>
            )}
          </TabsList>
          <ContentTab
            context={context}
            related={related}
            relatedPending={relatedPending}
            taskInteraction={taskInteraction}
          />
          <RelationsTab
            canManage={canManage}
            candidates={candidates}
            context={context}
            isSearching={isSearching}
            relatedMemo={relatedMemo}
            relationPending={relationPending}
            setRelatedMemo={setRelatedMemo}
            onAddRelation={onAddRelation}
            onRemoveRelation={onRemoveRelation}
          />
          {(canManage || canGovern) && (
            <HistoryTab
              canManage={canManage}
              context={context}
              locale={locale}
              restorePending={restorePending}
              onRestore={onRestore}
            />
          )}
          {canManage && (
            <SharingTab
              context={context}
              revokePending={revokePending}
              sharePending={sharePending}
              onCreateShare={onCreateShare}
              onRevoke={onRevoke}
            />
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
