import { describe, expect, it } from "vitest";
import { getLunarDateInfo, getUpcomingEvents } from "./lunar";

describe("lunar calendar & solar terms", () => {
  it("computes accurate lunar date for 2026-09-20", () => {
    const d = new Date(2026, 8, 20); // 2026-09-20
    const info = getLunarDateInfo(d);
    expect(info.yearNumber).toBe("2026");
    expect(info.cyclicalYear).toContain("丙午");
    expect(info.lunarMonth).toBe("八月");
    expect(info.lunarDay).toBe("初十");
  });

  it("identifies traditional festivals such as Mid-Autumn (中秋节)", () => {
    const d = new Date(2026, 8, 25); // 2026-09-25 is 八月十五
    const info = getLunarDateInfo(d);
    expect(info.festival).toBe("中秋节");
    expect(info.label).toBe("中秋节");
  });

  it("identifies 24 solar terms accurately", () => {
    const dWhiteDew = new Date(2026, 8, 7); // 白露
    const dAutumnEquinox = new Date(2026, 8, 23); // 秋分
    expect(getLunarDateInfo(dWhiteDew).solarTerm).toBe("白露");
    expect(getLunarDateInfo(dAutumnEquinox).solarTerm).toBe("秋分");
  });

  it("calculates upcoming events countdown correctly from 2026-09-20", () => {
    const baseDate = new Date(2026, 8, 20);
    const upcoming = getUpcomingEvents(baseDate, 3);
    expect(upcoming.length).toBeGreaterThan(0);
    // Next event is 秋分 in 3 days
    const nextEvent = upcoming[0];
    expect(nextEvent.name).toBe("秋分");
    expect(nextEvent.days).toBe(3);
    expect(nextEvent.weekday).toBe("周三");

    // Second event is 中秋节 in 5 days
    const midAutumn = upcoming.find((e) => e.name === "中秋节");
    expect(midAutumn).toBeDefined();
    expect(midAutumn?.days).toBe(5);
  });
});
