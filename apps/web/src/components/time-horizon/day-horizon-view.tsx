// ============================================================================
// 4. Day Horizon View (Option 2: Dual-Axis Timepiece - Linear Spine + Orbital Dial)
// ============================================================================
import { useMemo, useState } from "react";
import { heatmapColor } from "@/lib/activity";
import { buildHourCountMap } from "@/lib/time-horizon";
import { cn } from "@/lib/utils";
import { DAY_HOURS, type DisplayMode } from "./shared";

type MemoItem = {
  id: string;
  create_time: string;
  content?: string;
};

export function DayHorizonPureView({
  selectedDay,
  hourlyData,
  memos = [],
  isLoading,
  displayMode,
  onJumpToTimeline,
  onHoverTip,
}: {
  selectedDay: string;
  hourlyData: Array<{ date: string; hour: number; count: number }>;
  memos?: MemoItem[];
  isLoading: boolean;
  displayMode: DisplayMode;
  onJumpToTimeline: (day: string) => void;
  onHoverTip: (tip: string | null) => void;
}) {
  const hourCountMap = useMemo(
    () => buildHourCountMap(hourlyData),
    [hourlyData],
  );

  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Group memos by their local hour for informative hover tips
  const memosByHour = useMemo(() => {
    const map = new Map<number, MemoItem[]>();
    for (const m of memos) {
      const h = new Date(m.create_time).getHours();
      const list = map.get(h) ?? [];
      list.push(m);
      map.set(h, list);
    }
    return map;
  }, [memos]);

  const handleHoverHour = (h: number | null) => {
    setHoveredHour(h);
    if (h === null) {
      onHoverTip(null);
      return;
    }
    const count = hourCountMap.get(h) ?? 0;
    const hourLabel = `${String(h).padStart(2, "0")}:00`;
    const hourMemos = memosByHour.get(h) ?? [];
    const firstSnippet = hourMemos[0]?.content
      ? hourMemos[0].content
          .replace(/[#*`~>-]/g, "")
          .trim()
          .slice(0, 30)
      : null;

    if (count > 0) {
      const snippetSuffix = firstSnippet ? ` · “${firstSnippet}”` : "";
      onHoverTip(
        `${selectedDay} ${hourLabel} · ${count} 条笔记${snippetSuffix}`,
      );
    } else {
      onHoverTip(`${selectedDay} ${hourLabel} · 无记录`);
    }
  };

  // Dial Geometry Constants
  const R = 44;
  const cx = 58;
  const cy = 58;

  return (
    <div className="flex h-full min-h-[196px] items-center justify-center px-1 py-1 select-none">
      <div className="flex items-center justify-center gap-3 sm:gap-5 w-full max-w-[210px]">
        {/* ── Left Side: The Linear Spine (周视图单列的无缝切出, 24 根堆叠横条) ── */}
        <div className="flex items-stretch gap-1.5 shrink-0">
          {/* Y-axis Hour Scale (Calendar Mode Only - Zero Text in Heatmap Mode) */}
          {displayMode === "calendar" ? (
            <div className="flex w-3.5 shrink-0 flex-col justify-between py-0.5 text-[8px] font-mono text-muted-foreground/70 select-none">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
          ) : null}

          {/* The Single Magnified Column of 24 Stacked Bars */}
          <div
            className={cn(
              "flex w-8 sm:w-9 flex-col justify-between gap-[2px]",
              isLoading && "animate-pulse",
            )}
          >
            {DAY_HOURS.map((h) => {
              const count = hourCountMap.get(h) ?? 0;
              const isHovered = hoveredHour === h;

              return (
                <button
                  key={`day-bar-${h}`}
                  className={cn(
                    "h-[6px] w-full rounded-[1.5px] transition-all cursor-pointer",
                    displayMode === "heatmap"
                      ? count > 0
                        ? cn(
                            heatmapColor(count),
                            "hover:brightness-110 shadow-2xs",
                          )
                        : "bg-muted-foreground/15 dark:bg-muted/30 hover:bg-muted-foreground/35"
                      : count > 0
                        ? "bg-brand-500/75 ring-1 ring-brand-500 hover:brightness-110"
                        : "bg-muted-foreground/10 dark:bg-muted/20 hover:bg-muted-foreground/30",
                    isHovered &&
                      "ring-1.5 ring-brand-500 scale-x-110 scale-y-115 z-10 brightness-110 shadow-xs",
                    "hover:scale-x-110 hover:scale-y-115 hover:z-10",
                  )}
                  type="button"
                  onClick={() => onJumpToTimeline(selectedDay)}
                  onMouseEnter={() => handleHoverHour(h)}
                  onMouseLeave={() => handleHoverHour(null)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Right Side: The Orbital Solar Dial (24小时微型环形日晷 / 昼夜天色盘) ── */}
        <button
          type="button"
          className="flex flex-1 items-center justify-center p-1 cursor-pointer transition-transform hover:scale-105"
          onClick={() => onJumpToTimeline(selectedDay)}
          aria-label="在时间线查看该日"
        >
          <svg
            viewBox="0 0 116 116"
            className="w-[110px] h-[110px] select-none"
            aria-hidden="true"
          >
            <title>24小时日晷</title>

            {/* Outer subtle orbital track */}
            <circle
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="1.5 4"
              className="text-border/60 dark:text-border/30"
            />

            {/* Inner subtle concentric guide ring */}
            <circle
              cx={cx}
              cy={cy}
              r={25}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="1 5"
              className="text-border/40 dark:text-border/20"
            />

            {/* Center hub point */}
            <circle
              cx={cx}
              cy={cy}
              r="2"
              className="fill-brand-500/60 dark:fill-brand-400/60"
            />

            {/* 24 Hour Nodes around the orbital circle */}
            {DAY_HOURS.map((h) => {
              const count = hourCountMap.get(h) ?? 0;
              const isHovered = hoveredHour === h;
              const isCardinal = h % 6 === 0;

              // Angle: 00:00 at top (-90 deg), 06:00 right (0 deg), 12:00 bottom (90 deg), 18:00 left (180 deg)
              const angleDeg = h * 15 - 90;
              const angleRad = (angleDeg * Math.PI) / 180;
              const x = cx + R * Math.cos(angleRad);
              const y = cy + R * Math.sin(angleRad);

              const radius = isHovered
                ? count > 0
                  ? 5
                  : 3.5
                : count > 0
                  ? 3.5
                  : isCardinal
                    ? 2
                    : 1.4;

              return (
                <g key={`dial-dot-${h}`}>
                  {/* Pulsing ring if active and hovered */}
                  {isHovered && count > 0 && (
                    <circle
                      cx={x}
                      cy={y}
                      r="7"
                      fill="none"
                      stroke="var(--brand-500)"
                      strokeWidth="1"
                      className="animate-pulse opacity-75"
                    />
                  )}

                  {/* Visible Node */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    className={cn(
                      "transition-all duration-150",
                      count > 0
                        ? "fill-brand-500 dark:fill-brand-400"
                        : isCardinal
                          ? "fill-muted-foreground/45 dark:fill-muted/60"
                          : "fill-muted-foreground/25 dark:fill-muted/35",
                      isHovered && "fill-brand-500 brightness-110",
                    )}
                  />

                  {/* Expanded interactive hit circle */}
                  {/* biome-ignore lint/a11y/noStaticElementInteractions: SVG dial node hover indicator */}
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => handleHoverHour(h)}
                    onMouseLeave={() => handleHoverHour(null)}
                  />
                </g>
              );
            })}

            {/* Cardinal Markers in Calendar Mode Only (Zero Text in Heatmap Mode) */}
            {displayMode === "calendar" && (
              <>
                <text
                  x={cx}
                  y="8"
                  textAnchor="middle"
                  className="text-[7px] font-mono fill-muted-foreground/70 select-none"
                >
                  00
                </text>
                <text
                  x="111"
                  y={cy + 2.5}
                  textAnchor="start"
                  className="text-[7px] font-mono fill-muted-foreground/70 select-none"
                >
                  06
                </text>
                <text
                  x={cx}
                  y="113"
                  textAnchor="middle"
                  className="text-[7px] font-mono fill-muted-foreground/70 select-none"
                >
                  12
                </text>
                <text
                  x="5"
                  y={cy + 2.5}
                  textAnchor="end"
                  className="text-[7px] font-mono fill-muted-foreground/70 select-none"
                >
                  18
                </text>
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
