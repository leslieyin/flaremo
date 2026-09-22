// ============================================================================
// 2. Month Horizon View (Seamless Full-Tile Calendar Heatmap Carpet)
// ============================================================================
import { useMemo } from "react";
import { heatmapColor } from "@/lib/activity";
import {
  buildMonthGrid,
  type WeekStart,
  weekdayHeaders,
} from "@/lib/calendar-date";
import { buildDayQuadrants } from "@/lib/time-horizon";
import { cn } from "@/lib/utils";
import type { DisplayMode } from "./shared";

export function MonthHorizonPureView({
  monthKey,
  today,
  selectedDay,
  locale,
  weekStart,
  notesCountMap,
  hourlyData,
  isLoading: _isLoading,
  displayMode,
  hoveredDate,
  onDrillToWeek,
  onDrillToDay,
  onHoverDate,
  onHoverTip,
}: {
  monthKey: string;
  today: string;
  selectedDay: string;
  locale: string;
  weekStart: WeekStart;
  notesCountMap: Map<string, number>;
  hourlyData?: Array<{ date: string; hour: number; count: number }>;
  isLoading?: boolean;
  displayMode: DisplayMode;
  hoveredDate?: string | null;
  onDrillToWeek?: (day: string) => void;
  onDrillToDay?: (day: string) => void;
  onHoverDate?: (day: string | null) => void;
  onHoverTip: (tip: string | null) => void;
}) {
  const grid = useMemo(
    () => buildMonthGrid(monthKey, weekStart),
    [monthKey, weekStart],
  );
  const headers = weekdayHeaders(weekStart, locale, "narrow");

  // Map daily quadrants (night, morning, afternoon, evening) for the hover stacked-stripes preview
  const dayQuadrants = useMemo(
    () => buildDayQuadrants(hourlyData ?? []),
    [hourlyData],
  );

  return (
    <div className="flex flex-col gap-1.5">
      {/* 7 Weekday Headers: Clear orientation for the 7 columns */}
      <div className="grid grid-cols-7 gap-1">
        {["col-0", "col-1", "col-2", "col-3", "col-4", "col-5", "col-6"].map(
          (colId, i) => (
            <div
              className={cn(
                "text-center text-[10px] font-medium font-mono transition-opacity",
                displayMode === "calendar"
                  ? "text-muted-foreground/75"
                  : "text-muted-foreground/45",
              )}
              key={colId}
            >
              {headers[i]}
            </div>
          ),
        )}
      </div>

      {/* Grid of Days: 7 Columns x 5~6 Rows of Solid, Cohesive Tiles */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell) => {
          const totalCount = notesCountMap.get(cell.key) ?? 0;
          const isToday = cell.key === today;
          const isSelected = cell.key === selectedDay;
          const dayNum = Number(cell.key.slice(8));
          const [q0, q1, q2, q3] = dayQuadrants.get(cell.key) ?? [0, 0, 0, 0];

          return (
            <button
              className={cn(
                "group relative flex h-8.5 w-full items-center justify-center rounded-[5px] border transition-all select-none cursor-pointer active:scale-95",
                cell.inMonth ? "opacity-100" : "opacity-15 pointer-events-none",
                displayMode === "heatmap"
                  ? totalCount > 0
                    ? cn(
                        heatmapColor(totalCount),
                        "border-primary/25 hover:brightness-105 shadow-2xs",
                      )
                    : "border-border/40 bg-muted-foreground/10 hover:border-border/60 hover:bg-muted-foreground/15 dark:border-border/20 dark:bg-muted/20 dark:hover:bg-muted/30"
                  : cn(
                      "border-border/50 bg-background/60 hover:border-brand-500/50 hover:bg-background dark:border-border/30 dark:bg-background/50 text-foreground",
                      totalCount > 0 &&
                        "border-brand-500/40 bg-brand-500/10 font-bold text-brand-600 dark:text-brand-400",
                    ),
                isToday &&
                  "border-brand-500 ring-2 ring-brand-500/50 scale-[1.03] z-10",
                isSelected &&
                  !isToday &&
                  "ring-2 ring-foreground/60 scale-105 z-10 shadow-xs",
                hoveredDate === cell.key &&
                  "ring-1 ring-brand-500/70 scale-105",
                "hover:scale-105 hover:z-10",
              )}
              key={cell.key}
              type="button"
              onClick={() => (onDrillToWeek ?? onDrillToDay)?.(cell.key)}
              onMouseEnter={() => {
                onHoverDate?.(cell.key);
                if (totalCount > 0) {
                  onHoverTip(
                    `${cell.key} · ${totalCount} 条笔记 (早:${q1} 午:${q2} 晚:${q3} 夜:${q0})`,
                  );
                } else {
                  onHoverTip(`${cell.key} · 无记录`);
                }
              }}
              onMouseLeave={() => {
                onHoverDate?.(null);
                onHoverTip(null);
              }}
            >
              {/* Calendar Mode: Crisp Day Number & Count Indicator */}
              {displayMode === "calendar" ? (
                <div className="flex flex-col items-center justify-center leading-none transition-opacity group-hover:opacity-0">
                  <span
                    className={cn(
                      "text-[11px] font-mono tabular-nums",
                      totalCount > 0
                        ? "font-bold text-brand-600 dark:text-brand-400"
                        : "text-foreground/80",
                    )}
                  >
                    {dayNum}
                  </span>
                  {totalCount > 1 && (
                    <span className="mt-0.5 text-[8px] font-mono font-medium text-brand-500/70 tabular-nums">
                      {totalCount}
                    </span>
                  )}
                </div>
              ) : null}

              {/* Hover Stacked Micro-Stripes: Previews the single vertical column of Day view! */}
              <div className="absolute inset-0 flex flex-col justify-center gap-[1.5px] p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 dark:bg-background/95 rounded-[4px] shadow-xs pointer-events-none">
                <div
                  className={cn(
                    "h-[2px] w-full rounded-[0.5px] transition-colors",
                    q0 > 0
                      ? "bg-primary"
                      : "bg-muted-foreground/20 dark:bg-muted/40",
                  )}
                  title="夜间 (00-06)"
                />
                <div
                  className={cn(
                    "h-[2px] w-full rounded-[0.5px] transition-colors",
                    q1 > 0
                      ? "bg-primary"
                      : "bg-muted-foreground/20 dark:bg-muted/40",
                  )}
                  title="早晨 (06-12)"
                />
                <div
                  className={cn(
                    "h-[2px] w-full rounded-[0.5px] transition-colors",
                    q2 > 0
                      ? "bg-primary"
                      : "bg-muted-foreground/20 dark:bg-muted/40",
                  )}
                  title="下午 (12-18)"
                />
                <div
                  className={cn(
                    "h-[2px] w-full rounded-[0.5px] transition-colors",
                    q3 > 0
                      ? "bg-primary"
                      : "bg-muted-foreground/20 dark:bg-muted/40",
                  )}
                  title="晚间 (18-24)"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
