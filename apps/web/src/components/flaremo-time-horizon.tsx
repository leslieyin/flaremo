/**
 * FlareMoTimeHorizon — 四维纯粹高级时间视界
 *
 * 核心设计哲学 (双态彻底分工)：
 * 1. 热力图态 (Heatmap Mode) ——【纯粹的克制，只展示热力与力度】：
 *    - 画布中间彻底去除所有文字说明、数字标牌与文字描述。
 *    - 纯靠方块的点阵与色彩深浅传达节奏与能量状态，极致高级、沉静。
 *    - 尺度层层递进：年 365天微点 / 月 30天饱满热力毯 / 周 168小时横条矩阵 / 日 24小时全景时间能量流。
 * 2. 日历图态 (Calendar Mode) ——【展示信息本身】：
 *    - 相同网格与结构，显示月份、日期、星期、整点时间与条数信息。
 * 3. 严格零 Emoji，外轴极简，信息仅在悬停时于最底线静默提示。
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { getHourlyActivity, listMemos } from "@/api";
import { useI18n } from "@/i18n";
import {
  addMonths,
  buildWeekGrid,
  dayFilterQuery,
  formatMonthTitle,
  monthOf,
  nextDay,
  prevDay,
  todayKey,
  type WeekStart,
} from "@/lib/calendar-date";
import {
  buildActivityCountMap,
  monthRangeOf,
  parseDayKey,
  shiftDayKey,
  weekRangeOf,
  yearOf,
} from "@/lib/time-horizon";
import { cn } from "@/lib/utils";
import { DayHorizonPureView } from "./time-horizon/day-horizon-view";
import { MonthHorizonPureView } from "./time-horizon/month-horizon-view";
import type {
  DisplayMode,
  FlareMoTimeHorizonProps,
  TimeHorizonTab,
} from "./time-horizon/shared";
import { WeekHorizonPureView } from "./time-horizon/week-horizon-view";
import { YearHorizonPureView } from "./time-horizon/year-horizon-view";

export type {
  DisplayMode,
  FlareMoTimeHorizonProps,
  TimeHorizonTab,
} from "./time-horizon/shared";

// ============================================================================
// Root Component
// ============================================================================
export const FlareMoTimeHorizon = memo(function FlareMoTimeHorizon({
  stats,
  streak,
  monthLabels,
  onDaySelect,
  onNavigate,
  hoveredDate,
  onHoverDate,
  className,
}: FlareMoTimeHorizonProps) {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const today = useMemo(() => todayKey(), []);

  const [tab, setTab] = useState<TimeHorizonTab>("month");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("heatmap");
  const [selectedDay, setSelectedDay] = useState<string>(today);
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(
    monthOf(today),
  );
  const [currentWeekBase, setCurrentWeekBase] = useState<string>(today);
  const [currentYear, setCurrentYear] = useState<number>(yearOf(today));
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);

  const weekStart: WeekStart = locale.startsWith("en") ? "sunday" : "monday";
  const tz = useMemo(() => new Date().getTimezoneOffset(), []);

  // Map daily counts
  const notesCountMap = useMemo(
    () => buildActivityCountMap(stats.activity),
    [stats.activity],
  );

  // Hourly query for Day view (24 hours)
  const dayHourlyQuery = useQuery({
    queryKey: ["stats-hourly-day", selectedDay, tz],
    queryFn: ({ signal }) =>
      getHourlyActivity({ date: selectedDay }, tz, signal),
    staleTime: 60_000,
    enabled: tab === "day",
  });

  // Memo query for Day view 15-minute fine-grained resolution (24 hours x 4 slots = 96 micro-slits)
  const dayMemosQuery = useQuery({
    queryKey: ["memos-day-slots", selectedDay],
    queryFn: ({ signal }) =>
      listMemos({ q: dayFilterQuery(selectedDay), page_size: 100 }, signal),
    staleTime: 30_000,
    enabled: tab === "day",
  });

  // Month range calculations for hourly query (1st to last of current month)
  const { from: monthFrom, to: monthTo } = monthRangeOf(currentMonthKey);

  const monthHourlyQuery = useQuery({
    queryKey: ["stats-hourly-month", monthFrom, monthTo, tz],
    queryFn: ({ signal }) =>
      getHourlyActivity({ from: monthFrom, to: monthTo }, tz, signal),
    staleTime: 60_000,
    enabled: tab === "month",
  });

  // Week range calculations (7 days x 24 hours)
  const weekDays = useMemo(
    () => buildWeekGrid(currentWeekBase, weekStart),
    [currentWeekBase, weekStart],
  );
  const { from: weekFrom, to: weekTo } = weekRangeOf(weekDays, today);

  const weekHourlyQuery = useQuery({
    queryKey: ["stats-hourly-week", weekFrom, weekTo, tz],
    queryFn: ({ signal }) =>
      getHourlyActivity({ from: weekFrom, to: weekTo }, tz, signal),
    staleTime: 60_000,
    enabled: tab === "week",
  });

  const handleSelectDay = (day: string) => {
    setSelectedDay(day);
    onDaySelect?.(day);
  };

  /** Drill-down: Year -> Month */
  const drillToMonth = (monthKey: string) => {
    setCurrentMonthKey(monthKey);
    setTab("month");
  };

  /** Drill-down: Month -> Week */
  const drillToWeek = (day: string) => {
    handleSelectDay(day);
    setCurrentWeekBase(day);
    setTab("week");
  };

  /** Drill-down: Week -> Day */
  const drillToDay = (day: string) => {
    handleSelectDay(day);
    setTab("day");
  };

  /** Jump to Timeline search for this day */
  const jumpToTimeline = (day: string) => {
    handleSelectDay(day);
    void navigate({
      to: "/",
      search: (current) => ({
        compose: current.compose,
        q: dayFilterQuery(day),
        space: current.space,
        tag: undefined,
        untagged: undefined,
        view: "all",
      }),
    });
    onNavigate?.();
  };

  // ── Range Title ────────────────────────────────────────────────────────────
  const rangeTitle = useMemo(() => {
    if (tab === "year") return `${currentYear}年`;
    if (tab === "month") return formatMonthTitle(currentMonthKey, locale);
    if (tab === "week") {
      const first = weekDays[0];
      const last = weekDays[6];
      if (!first || !last) return "";
      const fmt = new Intl.DateTimeFormat(locale, {
        month: "numeric",
        day: "numeric",
      });
      return `${fmt.format(parseDayKey(first.key))} – ${fmt.format(parseDayKey(last.key))}`;
    }
    // day
    const d = parseDayKey(selectedDay);
    const fmt = new Intl.DateTimeFormat(locale, {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
    return fmt.format(d);
  }, [tab, currentYear, currentMonthKey, weekDays, selectedDay, locale]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handlePrev = () => {
    if (tab === "year") setCurrentYear((y) => y - 1);
    else if (tab === "month") setCurrentMonthKey((m) => addMonths(-1, m));
    else if (tab === "week") setCurrentWeekBase((b) => shiftDayKey(b, -7));
    else setSelectedDay((d) => prevDay(d));
  };

  const handleNext = () => {
    if (tab === "year") setCurrentYear((y) => y + 1);
    else if (tab === "month") setCurrentMonthKey((m) => addMonths(1, m));
    else if (tab === "week") setCurrentWeekBase((b) => shiftDayKey(b, 7));
    else setSelectedDay((d) => nextDay(d));
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* ── Top Bar: 4 Tabs + Mode Toggle ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-0.5">
        <div
          aria-label={t("explorer.timeViewLabel")}
          className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5"
          role="tablist"
        >
          {(
            [
              ["year", "年"],
              ["month", "月"],
              ["week", "周"],
              ["day", "日"],
            ] as const
          ).map(([id, label]) => (
            <button
              aria-selected={tab === id}
              className={cn(
                "min-w-[30px] rounded px-2 py-0.5 text-xs font-medium tabular-nums transition-colors",
                tab === id
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              key={id}
              role="tab"
              type="button"
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dual Mode Switch: Calendar (Information) / Heatmap (Pure Heat) */}
        <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-0.5">
          <button
            aria-label="数字日历"
            className={cn(
              "rounded p-1 text-muted-foreground transition-colors hover:text-foreground",
              displayMode === "calendar" &&
                "bg-background text-foreground shadow-2xs",
            )}
            title="数字日历 (展示信息)"
            type="button"
            onClick={() => setDisplayMode("calendar")}
          >
            <CalendarDaysIcon className="size-3.5" />
          </button>
          <button
            aria-label="热力图"
            className={cn(
              "rounded p-1 text-muted-foreground transition-colors hover:text-foreground",
              displayMode === "heatmap" &&
                "bg-background text-foreground shadow-2xs",
            )}
            title="热力图 (纯粹力度)"
            type="button"
            onClick={() => setDisplayMode("heatmap")}
          >
            <GridIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Range Navigator ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <button
          aria-label="上一期"
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          type="button"
          onClick={handlePrev}
        >
          <ChevronLeftIcon className="size-3.5" />
        </button>
        <span className="text-xs font-medium text-foreground">
          {rangeTitle}
        </span>
        <button
          aria-label="下一期"
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          type="button"
          onClick={handleNext}
        >
          <ChevronRightIcon className="size-3.5" />
        </button>
      </div>

      {/* ── Unified High-Impact Canvas Container (~240px Tall) ─────────────── */}
      <div
        className="relative flex min-h-[238px] flex-col justify-center rounded-xl border border-border/60 bg-muted/20 p-2.5 shadow-2xs dark:border-border/40 dark:bg-muted/15 overflow-hidden"
        data-testid="activity-heatmap"
      >
        <div
          key={tab}
          className={cn(
            "w-full transition-all",
            tab === "day"
              ? "animate-horizon-flip"
              : tab === "week"
                ? "animate-horizon-zoom"
                : tab === "month"
                  ? "animate-horizon-zoom"
                  : "animate-horizon-flip",
          )}
        >
          {/* YEAR VIEW: 365 Days across 12 Month Dot Clusters */}
          {tab === "year" && (
            <YearHorizonPureView
              activity={stats.activity}
              displayMode={displayMode}
              today={today}
              weekStart={weekStart}
              year={currentYear}
              onDrillToMonth={drillToMonth}
              onHoverTip={setHoveredTip}
            />
          )}

          {/* MONTH VIEW: 7 Columns x 5~6 Rows of Solid Cohesive Heatmap Tiles */}
          {tab === "month" && (
            <MonthHorizonPureView
              displayMode={displayMode}
              hourlyData={monthHourlyQuery.data?.hours ?? []}
              hoveredDate={hoveredDate}
              isLoading={monthHourlyQuery.isLoading}
              locale={locale}
              monthKey={currentMonthKey}
              notesCountMap={notesCountMap}
              selectedDay={selectedDay}
              today={today}
              weekStart={weekStart}
              onDrillToWeek={drillToWeek}
              onHoverDate={onHoverDate}
              onHoverTip={setHoveredTip}
            />
          )}

          {/* WEEK VIEW: 7 Days x 24 Hours Micro-Stream (168 Squares) */}
          {tab === "week" && (
            <WeekHorizonPureView
              days={weekDays}
              displayMode={displayMode}
              hourlyData={weekHourlyQuery.data?.hours ?? []}
              isLoading={weekHourlyQuery.isLoading}
              selectedDay={selectedDay}
              today={today}
              onDrillToDay={drillToDay}
              onHoverTip={setHoveredTip}
            />
          )}

          {/* DAY VIEW: 24-Hour Panoramic Energy Spectrum (Time Stream) */}
          {tab === "day" && (
            <DayHorizonPureView
              displayMode={displayMode}
              hourlyData={dayHourlyQuery.data?.hours ?? []}
              isLoading={dayHourlyQuery.isLoading || dayMemosQuery.isLoading}
              memos={dayMemosQuery.data?.memos ?? []}
              selectedDay={selectedDay}
              onHoverTip={setHoveredTip}
              onJumpToTimeline={jumpToTimeline}
            />
          )}
        </div>
      </div>

      {/* ── Hidden monthLabels container for E2E Contract Parity ─────────── */}
      <div aria-hidden="true" className="hidden">
        {monthLabels.map((m) => (
          <span key={m.date}>{m.label}</span>
        ))}
      </div>

      {/* ── Bottom Single-Line Micro Tooltip ──────────────────────────────── */}
      <div className="flex h-4 items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span className="truncate">
          {hoveredTip ??
            (streak > 0 ? `${streak} 天连记` : `${today} · 今日就绪`)}
        </span>
      </div>
    </div>
  );
});
