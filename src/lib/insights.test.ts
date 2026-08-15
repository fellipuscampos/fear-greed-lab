import { describe, expect, it } from "vitest";
import { computeInsights } from "./insights";

describe("computeInsights", () => {
  it("returns zeroed insights for an empty dataset", () => {
    const insights = computeInsights([]);
    expect(insights.sampleSize).toBe(0);
    expect(insights.btc.sameDay).toBe(0);
    expect(insights.btc.nextDay).toBe(0);
  });

  it("detects a strong same-day correlation", () => {
    const snapshots = [
      { date: "2026-01-01", fearGreedValue: 10, btcChange24h: -5, ethChange24h: -4 },
      { date: "2026-01-02", fearGreedValue: 30, btcChange24h: -2, ethChange24h: -1 },
      { date: "2026-01-03", fearGreedValue: 50, btcChange24h: 0, ethChange24h: 1 },
      { date: "2026-01-04", fearGreedValue: 70, btcChange24h: 3, ethChange24h: 2 },
      { date: "2026-01-05", fearGreedValue: 90, btcChange24h: 6, ethChange24h: 5 },
    ];
    const insights = computeInsights(snapshots);
    expect(insights.sampleSize).toBe(5);
    expect(insights.btc.sameDay).toBeGreaterThan(0.9);
    expect(insights.eth.sameDay).toBeGreaterThan(0.9);
  });

  it("is independent of input order (sorts by date internally)", () => {
    const ascending = [
      { date: "2026-01-01", fearGreedValue: 10, btcChange24h: -5, ethChange24h: -4 },
      { date: "2026-01-02", fearGreedValue: 90, btcChange24h: 6, ethChange24h: 5 },
    ];
    const shuffled = [ascending[1], ascending[0]];
    expect(computeInsights(shuffled)).toEqual(computeInsights(ascending));
  });
});
