import {
  Archive,
  Bell,
  Brain,
  CalendarDays,
  FolderKanban,
  Footprints,
  Hash,
  Image as ImageIcon,
  Inbox,
  List,
  Lock,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Settings,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SHOWCASE_I18N, type ShowcaseContent } from "@/content/showcase-i18n";
import type { SupportedLocale } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Memo = {
  id: string;
  orderNumber: number;
  timeLabel: string;
  title: string;
  content: string;
  quote?: string;
  tags: string[];
  isNew?: boolean;
};

const HEATMAP_TILES = Array.from({ length: 72 }, (_, i) => ({
  id: `tile-k-${i}`,
  isHigh: i >= 68,
  isMedium: i >= 64 && i < 68,
}));

export function InteractiveShowcase({
  locale = "zh",
}: {
  locale?: SupportedLocale;
}) {
  const showcase: ShowcaseContent = SHOWCASE_I18N[locale] || SHOWCASE_I18N.zh;

  const [memos, setMemos] = useState<Memo[]>([
    {
      id: "memo-65",
      orderNumber: 65,
      timeLabel: showcase.memo1.time,
      title: showcase.memo1.title,
      content: showcase.memo1.content,
      quote: showcase.memo1.quote,
      tags: showcase.memo1.tags,
    },
    {
      id: "memo-64",
      orderNumber: 64,
      timeLabel: showcase.memo2.time,
      title: showcase.memo2.title,
      content: showcase.memo2.content,
      tags: showcase.memo2.tags,
    },
  ]);

  // 当外部语言切换时，重置并切换默认展示内容
  useEffect(() => {
    setMemos([
      {
        id: "memo-65",
        orderNumber: 65,
        timeLabel: showcase.memo1.time,
        title: showcase.memo1.title,
        content: showcase.memo1.content,
        quote: showcase.memo1.quote,
        tags: showcase.memo1.tags,
      },
      {
        id: "memo-64",
        orderNumber: 64,
        timeLabel: showcase.memo2.time,
        title: showcase.memo2.title,
        content: showcase.memo2.content,
        tags: showcase.memo2.tags,
      },
    ]);
    setActiveTag(null);
  }, [showcase]);

  const [activeMenu, setActiveMenu] = useState<
    "timeline" | "archive" | "trash"
  >("timeline");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [timeViewTab, setTimeViewTab] = useState<"trend" | "calendar">("trend");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);

  // 输入框草稿与同步状态
  const [desktopInput, setDesktopInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedId, setLastSyncedId] = useState<string | null>(null);

  const totalCount = memos.length + 63;
  const tagList = showcase.ui.tags;

  // 发布新笔记
  const publishMemo = (rawText: string, fromMobile = false) => {
    let text = rawText.trim();
    if (!text) {
      const presets = showcase.presets;
      text = presets[presetIndex % presets.length].text;
      setPresetIndex((prev) => prev + 1);
    }

    setIsSyncing(true);

    const extractedTags = Array.from(
      new Set(
        (text.match(/#([\w\u4e00-\u9fa5]+)/g) || []).map((t) =>
          t.replace("#", ""),
        ),
      ),
    );
    const tags =
      extractedTags.length > 0
        ? extractedTags
        : [showcase.ui.tags[2]?.name || "ideas"];

    const matchedPreset = showcase.presets.find((p) => p.text === text);
    const title =
      matchedPreset?.title ??
      (text.length > 18 ? `${text.slice(0, 16)}...` : text);
    const quote = matchedPreset?.quote;
    const cleanContent = text.replace(/#([\w\u4e00-\u9fa5]+)/g, "").trim();

    const newId = `memo-${Date.now()}`;
    const nextOrder = memos.length > 0 ? memos[0].orderNumber + 1 : 66;

    setTimeout(() => {
      const newMemo: Memo = {
        id: newId,
        orderNumber: nextOrder,
        timeLabel: showcase.ui.justNow,
        title,
        content: cleanContent || text,
        quote,
        tags,
        isNew: true,
      };

      setMemos((prev) => [newMemo, ...prev]);
      setLastSyncedId(newId);
      if (fromMobile) setMobileInput("");
      else setDesktopInput("");
      setIsSyncing(false);
    }, 350);
  };

  const filteredMemos = memos.filter((m) => {
    if (activeTag && !m.tags.includes(activeTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <section className="container-x">
      {/* 真实高对比双端硬件模型 */}
      <div className="grid gap-8 lg:grid-cols-[1fr_310px] xl:grid-cols-[1fr_330px] items-start">
        {/* ============================================================
            电脑端设备：高对比 MacBook 视窗底座
            ============================================================ */}
        <div className="relative rounded-2xl border-2 border-zinc-300/90 dark:border-zinc-700/80 bg-paper shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
          {/* 桌面端浏览器顶栏 */}
          <div className="flex h-9.5 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 px-4">
            {/* macOS 三色交通灯按键 */}
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs" />
              <span className="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs" />
              <span className="size-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs" />
            </div>

            {/* 居中真实网址栏 */}
            <div className="flex h-6 w-64 sm:w-80 items-center justify-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-700/70 bg-white/90 dark:bg-zinc-800/90 px-3 text-[11px] text-zinc-600 dark:text-zinc-300 shadow-2xs">
              <Lock className="size-3 text-signal" />
              <span className="font-mono tracking-tight">
                https://app.flaremo.app
              </span>
            </div>

            <div className="text-[11px] font-mono text-fog flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              <span>Cloudflare Workers</span>
            </div>
          </div>

          {/* 电脑端内部结构：左侧资源管理器 + 右侧时间线 */}
          <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] lg:grid-cols-[220px_1fr] min-h-[580px] bg-paper">
            {/* 左侧边栏 (FlareMo Explorer) */}
            <aside className="border-r border-line/60 bg-surface/40 p-4 space-y-4 hidden md:block select-none overflow-y-auto max-h-[620px] no-scrollbar">
              {/* 边栏顶部 Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-lg bg-brand-gradient text-white text-xs font-bold shadow-2xs">
                    <span className="text-white font-extrabold text-[13px]">
                      F
                    </span>
                  </div>
                  <span className="font-bold text-sm text-ink tracking-tight">
                    FlareMo
                  </span>
                </div>

                <div className="flex items-center gap-1 text-mist">
                  <Bell className="size-3.5 hover:text-ink cursor-pointer" />
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-soft-surface px-1.5 py-0.5 text-[9px] font-mono border border-line/60">
                    <RefreshCw className="size-2 text-signal" />
                    v0.20
                  </span>
                  <Settings className="size-3.5 hover:text-ink cursor-pointer" />
                </div>
              </div>

              {/* 数据总览行：记录 | 标签 | 天数 */}
              <div className="grid grid-cols-3 text-center py-1.5 border-y border-line/60">
                <div>
                  <div className="text-base font-extrabold text-ink tabular-nums">
                    {totalCount}
                  </div>
                  <div className="text-[10px] text-mist">
                    {showcase.ui.statsRecords}
                  </div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-ink tabular-nums">
                    {tagList.length}
                  </div>
                  <div className="text-[10px] text-mist">
                    {showcase.ui.statsTags}
                  </div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-ink tabular-nums">
                    1
                  </div>
                  <div className="text-[10px] text-mist">
                    {showcase.ui.statsDays}
                  </div>
                </div>
              </div>

              {/* 贡献热力图卡片 */}
              <div className="space-y-2">
                <div className="flex rounded-lg bg-soft-surface p-0.5 border border-line/60 text-[10px] font-semibold text-mist">
                  <button
                    type="button"
                    onClick={() => setTimeViewTab("trend")}
                    className={cn(
                      "flex-1 py-1 rounded-md text-center transition-colors cursor-pointer",
                      timeViewTab === "trend"
                        ? "bg-surface text-signal-ink shadow-2xs font-bold"
                        : "hover:text-ink",
                    )}
                  >
                    {showcase.ui.trend}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeViewTab("calendar")}
                    className={cn(
                      "flex-1 py-1 rounded-md text-center transition-colors cursor-pointer",
                      timeViewTab === "calendar"
                        ? "bg-surface text-signal-ink shadow-2xs font-bold"
                        : "hover:text-ink",
                    )}
                  >
                    {showcase.ui.calendar}
                  </button>
                </div>

                {/* 贡献小方格矩阵 */}
                <div className="rounded-xl border border-line/60 bg-surface/70 p-2.5 space-y-1.5">
                  <div className="grid grid-flow-col grid-rows-6 gap-1 justify-between">
                    {HEATMAP_TILES.map((tile) => (
                      <span
                        key={tile.id}
                        className={cn(
                          "size-2 rounded-[2px]",
                          tile.isHigh
                            ? "bg-signal shadow-2xs"
                            : tile.isMedium
                              ? "bg-signal/40"
                              : "bg-line/70 dark:bg-line/40",
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-fog font-mono px-0.5">
                    {showcase.ui.months.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 系统主菜单 */}
              <nav className="space-y-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu("timeline");
                    setActiveTag(null);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                    activeMenu === "timeline" && !activeTag
                      ? "bg-signal/15 text-signal-ink font-bold border border-signal/30"
                      : "text-mist hover:text-ink hover:bg-wash",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Inbox className="size-4 text-signal" />
                    <span>{showcase.ui.timeline}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-line/60 rounded-full text-mist">
                    {totalCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMenu("archive")}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                    activeMenu === "archive"
                      ? "bg-signal/15 text-signal-ink font-bold border border-signal/30"
                      : "text-mist hover:text-ink hover:bg-wash",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="size-4" />
                    <span>{showcase.ui.archive}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-line/60 rounded-full text-mist">
                    0
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMenu("trash")}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                    activeMenu === "trash"
                      ? "bg-signal/15 text-signal-ink font-bold border border-signal/30"
                      : "text-mist hover:text-ink hover:bg-wash",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="size-4" />
                    <span>{showcase.ui.trash}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-line/60 rounded-full text-mist">
                    0
                  </span>
                </button>
              </nav>

              {/* 5项快捷视图 */}
              <div className="pt-2 border-t border-line/40 space-y-0.5 text-xs text-mist">
                {[
                  { icon: Zap, label: showcase.ui.dailyReview },
                  { icon: Footprints, label: showcase.ui.randomWalk },
                  { icon: Brain, label: showcase.ui.memory },
                  { icon: CalendarDays, label: showcase.ui.calendarView },
                  { icon: FolderKanban, label: showcase.ui.projects },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:text-ink hover:bg-wash transition-colors cursor-pointer"
                  >
                    <item.icon className="size-3.5 text-fog" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* 标签列表 */}
              <div className="pt-2 border-t border-line/40 space-y-1">
                <div className="text-[10px] font-bold text-fog px-2">
                  {showcase.ui.tagIndex}
                </div>
                <div className="space-y-0.5">
                  {tagList.map((tag) => (
                    <button
                      type="button"
                      key={tag.name}
                      onClick={() =>
                        setActiveTag(activeTag === tag.name ? null : tag.name)
                      }
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer",
                        activeTag === tag.name
                          ? "bg-signal/15 text-signal-ink font-bold"
                          : "text-mist hover:text-ink hover:bg-wash",
                      )}
                    >
                      <span>#{tag.name}</span>
                      <span className="text-[10px] text-fog font-mono">
                        {tag.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* 右侧主工作区 (时间线 + 发送器) */}
            <main className="p-4 sm:p-5 space-y-4 max-h-[620px] overflow-y-auto thin-scrollbar">
              {/* 顶部标题栏与搜索条 */}
              <div className="flex items-center justify-between gap-3 pb-1 border-b border-line/60">
                <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <span className="text-fog">/</span>
                  <span>
                    {activeTag ? `#${activeTag}` : showcase.ui.timeline}
                  </span>
                </div>

                <div className="relative w-44 sm:w-56">
                  <Search className="size-3.5 text-fog absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={showcase.ui.searchPlaceholder}
                    className="w-full h-8 pl-8 pr-3 rounded-full border border-line/70 bg-surface text-xs text-ink placeholder:text-fog focus:outline-none focus:border-signal/70 transition-colors"
                  />
                </div>
              </div>

              {/* 真实桌面端 Composer 发送器 */}
              <div className="rounded-2xl border border-line/70 bg-surface p-4 shadow-2xs space-y-3">
                <textarea
                  value={desktopInput}
                  onChange={(e) => setDesktopInput(e.target.value)}
                  placeholder={showcase.ui.composerPlaceholder}
                  rows={3}
                  className="w-full bg-transparent text-xs sm:text-sm text-ink placeholder:text-fog resize-none focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1 border-t border-line/40">
                  <div className="flex items-center gap-3 text-mist">
                    <button
                      type="button"
                      onClick={() => setDesktopInput((prev) => `${prev} #`)}
                      className="cursor-pointer hover:text-ink transition-colors"
                      title="插入标签"
                    >
                      <Hash className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer hover:text-ink transition-colors"
                      title="上传附件"
                    >
                      <ImageIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesktopInput((prev) => `${prev}\n• `)}
                      className="cursor-pointer hover:text-ink transition-colors"
                      title="列表项目"
                    >
                      <List className="size-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => publishMemo(desktopInput, false)}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-105 active:translate-y-px transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Send className="size-3" />
                    <span>{showcase.ui.send}</span>
                  </button>
                </div>
              </div>

              {/* 真实笔记卡片流 (MemoCard List) */}
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredMemos.map((m) => {
                    const isHighlighted = m.id === lastSyncedId;
                    return (
                      <motion.article
                        key={m.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.96 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                          },
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                          "rounded-2xl border bg-surface p-4 sm:p-5 space-y-2.5 transition-all duration-300 relative",
                          isHighlighted
                            ? "border-signal/60 ring-2 ring-signal/20 bg-signal/5 shadow-md"
                            : "border-line/70 shadow-2xs hover:border-line",
                        )}
                      >
                        {/* 卡片头部 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="size-4.5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                            <span className="text-xs text-mist font-medium">
                              {m.timeLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MoreHorizontal className="size-3.5 text-fog hover:text-ink cursor-pointer" />
                          </div>
                        </div>

                        {/* 笔记标题 */}
                        <h3 className="text-sm sm:text-base font-bold text-ink tracking-tight">
                          {m.title}
                        </h3>

                        {/* 笔记内容 */}
                        <p className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
                          {m.content}
                        </p>

                        {/* 引用样式块 */}
                        {m.quote && (
                          <div className="rounded-r-xl border-l-2 border-signal bg-signal/10 p-3 text-xs text-ink leading-relaxed">
                            {m.quote}
                          </div>
                        )}

                        {/* 标签行 */}
                        {m.tags.length > 0 && (
                          <div className="text-xs text-signal-ink font-medium">
                            {m.tags.map((t) => `#${t}`).join(" ")}
                          </div>
                        )}

                        {/* 卡片底部操作栏 */}
                        <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[11px] text-fog font-mono">
                          <span>
                            {showcase.ui.recordPrefix} {m.orderNumber}
                          </span>
                          <div className="flex gap-1.5">
                            {m.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-soft-surface px-2 py-0.5 text-[10px] text-mist"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>

        {/* ============================================================
            手机端设备：高质感钛金属 / 极夜黑真实手机硬件模型
            ============================================================ */}
        <div className="relative mx-auto w-full max-w-[320px] rounded-[48px] border-[9px] border-zinc-900 dark:border-zinc-800 bg-zinc-950 p-[2px] shadow-[0_25px_65px_-12px_rgba(0,0,0,0.45)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)] ring-1 ring-zinc-700/80 dark:ring-zinc-600/70 select-none">
          {/* 机身侧键物理凹槽 */}
          <span className="absolute -left-[12px] top-24 h-8 w-1 rounded-l-sm bg-zinc-700 dark:bg-zinc-600" />
          <span className="absolute -left-[12px] top-36 h-8 w-1 rounded-l-sm bg-zinc-700 dark:bg-zinc-600" />
          <span className="absolute -right-[12px] top-28 h-12 w-1 rounded-r-sm bg-zinc-700 dark:bg-zinc-600" />

          {/* 屏幕玻璃与边框 */}
          <div className="overflow-hidden rounded-[38px] bg-paper border border-black/20 dark:border-white/5 flex flex-col h-[560px] relative">
            {/* 手机系统状态栏 + 灵动岛 (Dynamic Island) */}
            <div className="h-10 bg-soft-surface px-6 flex items-center justify-between border-b border-line/60 shrink-0">
              <span className="text-[11px] font-bold text-ink tracking-tight">
                09:41
              </span>
              {/* 灵动岛胶囊孔 */}
              <div className="h-4 w-20 rounded-full bg-black flex items-center justify-between px-2 shadow-inner">
                <span className="size-1.5 rounded-full bg-zinc-900 ring-1 ring-zinc-800" />
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-ink font-bold">
                5G
              </div>
            </div>

            {/* 移动端 App 顶栏：汉堡菜单 + 标题 + 筛选提示 */}
            <div className="px-3.5 py-2 border-b border-line/60 bg-surface flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="p-1 -ml-1 text-ink hover:text-signal hover:bg-wash transition-colors cursor-pointer rounded-lg focus:outline-none flex items-center"
                  aria-label="导航菜单"
                >
                  <Menu className="size-4" />
                </button>
                <span className="text-sm font-bold text-ink tracking-tight">
                  {activeTag
                    ? `#${activeTag}`
                    : activeMenu === "timeline"
                      ? showcase.ui.timeline
                      : activeMenu === "archive"
                        ? showcase.ui.archive
                        : showcase.ui.trash}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {activeTag && (
                  <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className="text-[10px] text-mist hover:text-ink cursor-pointer font-medium"
                  >
                    {showcase.ui.clearFilter}
                  </button>
                )}
                <span className="text-[10px] text-fog font-mono bg-soft-surface px-1.5 py-0.5 rounded-full border border-line/60">
                  {filteredMemos.length}
                </span>
              </div>
            </div>

            {/* 手机屏幕主内容区 (可滚动，使用 no-scrollbar) */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 no-scrollbar">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="size-3 text-fog absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={showcase.ui.searchPlaceholder}
                  className="w-full h-7 pl-7 pr-3 rounded-full border border-line/70 bg-surface text-[11px] text-ink placeholder:text-fog focus:outline-none"
                />
              </div>

              {/* 手机端真实 Memo 发送器 */}
              <div className="rounded-2xl border border-line/70 bg-surface p-3 shadow-2xs space-y-2">
                <textarea
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                  placeholder={showcase.ui.composerPlaceholder}
                  rows={2}
                  className="w-full bg-transparent text-xs text-ink placeholder:text-fog resize-none focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5 text-mist">
                    <button
                      type="button"
                      onClick={() => setMobileInput((p) => `${p} #`)}
                      className="cursor-pointer hover:text-ink"
                    >
                      <Hash className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer hover:text-ink"
                    >
                      <ImageIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileInput((p) => `${p}\n• `)}
                      className="cursor-pointer hover:text-ink"
                    >
                      <List className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => publishMemo(mobileInput, true)}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-xs hover:brightness-105 active:translate-y-px transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isSyncing ? (
                      <span className="animate-spin text-xs">⟳</span>
                    ) : (
                      <>
                        <Send className="size-2.5" />
                        <span>{showcase.ui.send}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 移动端时间线笔记流 */}
              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {filteredMemos.map((m) => {
                    const isHighlighted = m.id === lastSyncedId;
                    return (
                      <motion.article
                        key={m.id}
                        layout
                        initial={{ opacity: 0, y: -16, scale: 0.97 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                          },
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                          "rounded-2xl border bg-surface p-3 space-y-2 text-xs transition-all duration-300",
                          isHighlighted
                            ? "border-signal/60 ring-2 ring-signal/20 bg-signal/5"
                            : "border-line/70 shadow-2xs",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="size-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                            <span className="text-[10px] text-mist">
                              {m.timeLabel}
                            </span>
                          </div>
                          <MoreHorizontal className="size-3 text-fog" />
                        </div>
                        <div className="font-bold text-ink text-xs line-clamp-1">
                          {m.title}
                        </div>
                        <p className="text-[11px] text-mist line-clamp-2 leading-relaxed">
                          {m.content}
                        </p>
                        {m.quote && (
                          <div className="border-l-2 border-signal/70 pl-2 text-[10px] italic text-ink/80 bg-wash/60 py-1 rounded-r-md">
                            {m.quote}
                          </div>
                        )}
                        {m.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-line/40">
                            {m.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-flame-50 dark:bg-flame-950/50 px-2 py-0.5 text-[9px] text-flame-600 dark:text-flame-400 font-medium"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* 手机底部指示条 (Home Indicator) */}
            <div className="h-5 flex items-center justify-center bg-soft-surface shrink-0 border-t border-line/40 select-none">
              <span className="h-1 w-24 rounded-full bg-mist/50" />
            </div>

            {/* 移动端真实侧边抽屉 (Sheet Drawer) */}
            <AnimatePresence>
              {mobileDrawerOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setMobileDrawerOpen(false)}
                    className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs cursor-pointer"
                  />

                  <motion.aside
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 26, stiffness: 300 }}
                    className="absolute inset-y-0 left-0 z-50 w-[84%] bg-surface border-r border-line shadow-2xl flex flex-col overflow-hidden"
                  >
                    {/* 抽屉顶部 Header */}
                    <div className="p-3.5 border-b border-line/60 flex items-center justify-between bg-surface/90">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-lg bg-brand-gradient text-white text-xs font-bold shadow-2xs">
                          <span className="text-white font-extrabold text-[13px]">
                            F
                          </span>
                        </div>
                        <span className="font-bold text-sm text-ink tracking-tight">
                          FlareMo
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-soft-surface px-1.5 py-0.5 text-[8px] font-mono border border-line/60 text-mist">
                          v0.20
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="p-1 text-mist hover:text-ink rounded-lg transition-colors cursor-pointer"
                        aria-label="关闭侧边栏"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    {/* 抽屉滚动内容 */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3.5 no-scrollbar text-xs">
                      {/* 统计概览 */}
                      <div className="grid grid-cols-3 text-center py-1.5 border-y border-line/60 bg-soft-surface/40 rounded-lg">
                        <div>
                          <div className="text-sm font-extrabold text-ink tabular-nums">
                            {totalCount}
                          </div>
                          <div className="text-[9px] text-mist">
                            {showcase.ui.statsRecords}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-ink tabular-nums">
                            {tagList.length}
                          </div>
                          <div className="text-[9px] text-mist">
                            {showcase.ui.statsTags}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-ink tabular-nums">
                            1
                          </div>
                          <div className="text-[9px] text-mist">
                            {showcase.ui.statsDays}
                          </div>
                        </div>
                      </div>

                      {/* 贡献热力图 */}
                      <div className="rounded-xl border border-line/60 bg-surface/70 p-2 space-y-1">
                        <div className="grid grid-flow-col grid-rows-6 gap-0.5 justify-between">
                          {HEATMAP_TILES.slice(0, 48).map((tile) => (
                            <span
                              key={`mob-${tile.id}`}
                              className={cn(
                                "size-1.5 rounded-[1px]",
                                tile.isHigh
                                  ? "bg-signal"
                                  : tile.isMedium
                                    ? "bg-signal/40"
                                    : "bg-line/70 dark:bg-line/40",
                              )}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[8px] text-fog font-mono px-0.5">
                          <span>{showcase.ui.months[1]}</span>
                          <span>{showcase.ui.months[2]}</span>
                          <span>{showcase.ui.months[3]}</span>
                        </div>
                      </div>

                      {/* 菜单列表 */}
                      <nav className="space-y-0.5 font-semibold text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu("timeline");
                            setActiveTag(null);
                            setMobileDrawerOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors cursor-pointer",
                            activeMenu === "timeline" && !activeTag
                              ? "bg-signal/15 text-signal-ink font-bold border border-signal/30"
                              : "text-mist hover:text-ink hover:bg-wash",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Inbox className="size-3.5 text-signal" />
                            <span>{showcase.ui.timeline}</span>
                          </div>
                          <span className="font-mono text-[9px] px-1 py-0.2 bg-line/60 rounded-full text-mist">
                            {totalCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu("archive");
                            setMobileDrawerOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors cursor-pointer",
                            activeMenu === "archive"
                              ? "bg-signal/15 text-signal-ink font-bold border border-signal/30"
                              : "text-mist hover:text-ink hover:bg-wash",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Archive className="size-3.5" />
                            <span>{showcase.ui.archive}</span>
                          </div>
                          <span className="font-mono text-[9px] px-1 py-0.2 bg-line/60 rounded-full text-mist">
                            0
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu("trash");
                            setMobileDrawerOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors cursor-pointer",
                            activeMenu === "trash"
                              ? "bg-signal/15 text-signal-ink font-bold border border-signal/30"
                              : "text-mist hover:text-ink hover:bg-wash",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Trash2 className="size-3.5" />
                            <span>{showcase.ui.trash}</span>
                          </div>
                          <span className="font-mono text-[9px] px-1 py-0.2 bg-line/60 rounded-full text-mist">
                            0
                          </span>
                        </button>
                      </nav>

                      {/* 快捷视图 */}
                      <div className="pt-2 border-t border-line/40 space-y-0.5 text-[11px] text-mist">
                        {[
                          { icon: Zap, label: showcase.ui.dailyReview },
                          { icon: Footprints, label: showcase.ui.randomWalk },
                          { icon: Brain, label: showcase.ui.memory },
                          {
                            icon: CalendarDays,
                            label: showcase.ui.calendarView,
                          },
                          { icon: FolderKanban, label: showcase.ui.projects },
                        ].map((item) => (
                          <button
                            type="button"
                            key={item.label}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:text-ink hover:bg-wash transition-colors cursor-pointer text-left"
                            onClick={() => setMobileDrawerOpen(false)}
                          >
                            <item.icon className="size-3.5 text-fog" />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* 标签列表 */}
                      <div className="pt-2 border-t border-line/40 space-y-1">
                        <div className="text-[10px] font-bold text-fog px-2">
                          {showcase.ui.tagIndex}
                        </div>
                        <div className="space-y-0.5">
                          {tagList.map((tag) => (
                            <button
                              type="button"
                              key={tag.name}
                              onClick={() => {
                                setActiveTag(
                                  activeTag === tag.name ? null : tag.name,
                                );
                                setMobileDrawerOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer",
                                activeTag === tag.name
                                  ? "bg-signal/15 text-signal-ink font-bold"
                                  : "text-mist hover:text-ink hover:bg-wash",
                              )}
                            >
                              <span>#{tag.name}</span>
                              <span className="text-[9px] text-fog font-mono">
                                {tag.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 抽屉底部设置 */}
                    <div className="p-2.5 border-t border-line/60 bg-soft-surface/50 flex items-center justify-between text-xs text-mist">
                      <div className="flex items-center gap-1.5">
                        <span className="size-4 rounded-full bg-signal/20 flex items-center justify-center text-[10px] font-bold text-signal-ink">
                          K
                        </span>
                        <span className="text-[11px] font-medium text-ink">
                          flaremo-user
                        </span>
                      </div>
                      <Settings className="size-3.5 hover:text-ink cursor-pointer" />
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
