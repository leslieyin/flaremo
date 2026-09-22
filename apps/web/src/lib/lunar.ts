// Native Lunar Calendar, Solar Terms (24节气), and Traditional Festival Utilities
// Zero dependencies: powered by standard Intl.DateTimeFormat('zh-CN-u-ca-chinese')
// and astronomical solar term constants.

export type LunarDateInfo = {
  yearNumber: string; // e.g. "2026"
  cyclicalYear: string; // e.g. "丙午年"
  lunarMonth: string; // e.g. "八月"
  lunarDay: string; // e.g. "初十"
  weekday: string; // e.g. "星期日"
  label: string; // e.g. "八月初十"
  fullLabel: string; // e.g. "丙午年 八月初十"
  festival?: string;
  solarTerm?: string;
};

export type UpcomingEvent = {
  dateKey: string; // "YYYY-MM-DD"
  name: string; // e.g. "秋分", "中秋节"
  days: number; // e.g. 3
  formattedDate: string; // e.g. "9月23日"
  weekday: string; // e.g. "周三"
  category: "solar_term" | "traditional" | "public";
};

// 24 Solar Terms offsets in minutes from 1900-01-06 02:05:00 UTC
const SOLAR_TERM_INFO = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072,
  240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210,
  440795, 462224, 483532, 504758,
];

const SOLAR_TERM_NAMES = [
  "小寒",
  "大寒",
  "立春",
  "雨水",
  "惊蛰",
  "春分",
  "清明",
  "谷雨",
  "立夏",
  "小满",
  "芒种",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "处暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
  "冬至",
];

// Fixed solar date festivals (month is 1-indexed)
const SOLAR_FESTIVALS: Record<string, string> = {
  "01-01": "元旦",
  "02-14": "情人节",
  "03-08": "妇女节",
  "03-12": "植树节",
  "04-01": "愚人节",
  "05-01": "劳动节",
  "05-04": "青年节",
  "06-01": "儿童节",
  "07-01": "建党节",
  "08-01": "建军节",
  "09-03": "抗战胜利",
  "09-10": "教师节",
  "10-01": "国庆节",
  "12-25": "圣诞节",
};

// Traditional lunar festivals by lunar month and lunar day
const LUNAR_FESTIVALS: Record<string, string> = {
  正月初一: "春节",
  正月十五: "元宵节",
  二月初二: "龙抬头",
  五月初五: "端午节",
  七月初七: "七夕节",
  七月十五: "中元节",
  八月十五: "中秋节",
  九月初九: "重阳节",
  腊月初八: "腊八节",
  腊月廿三: "北方小年",
  腊月廿四: "南方小年",
};

const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// Cache for solar term calculations per year to avoid repeated heavy math
const solarTermYearCache = new Map<number, Map<string, string>>();

function getSolarTermsForYear(year: number): Map<string, string> {
  const cached = solarTermYearCache.get(year);
  if (cached) return cached;

  const map = new Map<string, string>();
  // Base time: 1900-01-06 02:05:00 Beijing Time (UTC+8 => 1900-01-05 18:05:00 UTC)
  const baseUtc = Date.UTC(1900, 0, 5, 18, 5, 0);

  for (let i = 0; i < 24; i++) {
    const off = 31556925974.7 * (year - 1900) + SOLAR_TERM_INFO[i] * 60000;
    const termUtc = new Date(baseUtc + off);
    // Convert to Beijing Time (UTC+8)
    const beijingTime = new Date(termUtc.getTime() + 8 * 3600000);
    const y = beijingTime.getUTCFullYear();
    const m = String(beijingTime.getUTCMonth() + 1).padStart(2, "0");
    const d = String(beijingTime.getUTCDate()).padStart(2, "0");
    map.set(`${y}-${m}-${d}`, SOLAR_TERM_NAMES[i]);
  }
  solarTermYearCache.set(year, map);
  return map;
}

/**
 * Get accurate lunar date details for any given Date object.
 */
export function getLunarDateInfo(date: Date): LunarDateInfo {
  const year = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const isoKey = `${year}-${m}-${d}`;
  const monthDayKey = `${m}-${d}`;

  let cyclicalYear = "";
  let lunarMonth = "";
  let lunarDay = "";
  let weekday = "";

  try {
    const full = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      dateStyle: "full",
    }).format(date);
    // e.g. "2026丙午年八月初十星期日"
    const match = full.match(/(\d+)(.+?年)(.+?月)(.+?)(星期.+)/);
    if (match) {
      cyclicalYear = match[2];
      lunarMonth = match[3];
      lunarDay = match[4];
      weekday = match[5];
    }
  } catch {
    // Fallback if Intl chinese calendar is not supported in current engine
    lunarMonth = `${date.getMonth() + 1}月`;
    lunarDay = `${date.getDate()}日`;
    weekday = WEEKDAY_NAMES[date.getDay()];
  }

  // Check 24 solar terms
  const solarTerms = getSolarTermsForYear(year);
  const solarTerm = solarTerms.get(isoKey);

  // Check festivals
  const lunarFestivalKey = `${lunarMonth}${lunarDay}`;
  let festival =
    LUNAR_FESTIVALS[lunarFestivalKey] ?? SOLAR_FESTIVALS[monthDayKey];

  // Special case: 秋分 is also 中国农民丰收节
  if (solarTerm === "秋分" && !festival) {
    festival = "秋分";
  }

  const label =
    festival || solarTerm || (lunarDay === "初一" ? lunarMonth : lunarDay);
  const fullLabel = `${cyclicalYear} ${lunarMonth}${lunarDay}`.trim();

  return {
    yearNumber: String(year),
    cyclicalYear,
    lunarMonth,
    lunarDay,
    weekday,
    label,
    fullLabel,
    festival,
    solarTerm,
  };
}

/**
 * Find upcoming festivals and solar terms from `baseDate` within next 60 days.
 */
export function getUpcomingEvents(baseDate: Date, limit = 3): UpcomingEvent[] {
  const events: UpcomingEvent[] = [];
  const startDay = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    12,
    0,
    0,
  );

  for (let i = 1; i <= 60; i++) {
    const nextDate = new Date(startDay.getTime() + i * 86400000);
    const info = getLunarDateInfo(nextDate);

    if (info.festival || info.solarTerm) {
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, "0");
      const d = String(nextDate.getDate()).padStart(2, "0");
      const dateKey = `${y}-${m}-${d}`;
      const name = info.festival || info.solarTerm || "";

      // Add event if not duplicate name
      if (!events.some((e) => e.name === name)) {
        events.push({
          dateKey,
          name,
          days: i,
          formattedDate: `${nextDate.getMonth() + 1}月${nextDate.getDate()}日`,
          weekday: WEEKDAY_NAMES[nextDate.getDay()],
          category: info.festival ? "traditional" : "solar_term",
        });
      }
    }

    if (events.length >= limit) break;
  }

  return events;
}
