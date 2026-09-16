import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/motion";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  hint,
  highlight = false,
  badge,
  icon,
}: {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  hint?: string;
  highlight?: boolean;
  badge?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "panel-card card-lift relative overflow-hidden p-5 flex flex-col justify-between",
        highlight ? "bg-signal/5 border border-signal/20" : "",
      )}
    >
      {highlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-signal/15 blur-2xl"
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="icon-dock flex size-8 items-center justify-center text-signal">
              {icon}
            </div>
          )}
          <span className="text-xs font-medium text-mist sm:text-sm">
            {label}
          </span>
        </div>
        {badge && (
          <span className="rounded-full border border-signal/30 bg-signal/10 px-2 py-0.5 text-[11px] font-bold text-signal-ink">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div
          className={cn(
            "text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
            highlight ? "font-extrabold text-signal" : "text-ink",
          )}
        >
          {typeof value === "number" ? (
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          ) : (
            `${prefix}${value}${suffix}`
          )}
          {hint && (
            <span className="ml-1.5 text-xs font-semibold text-signal-ink">
              {hint}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
