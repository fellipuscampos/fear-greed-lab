import { describe, expect, it } from "vitest";
import { computeInsights, computeRollingCorrelation } from "./insights";

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

describe("computeRollingCorrelation", () => {
  function dateAt(i: number): string {
    const d = new Date("2026-01-01T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  }

  function makeSeries(n: number) {
    return Array.from({ length: n }, (_, i) => ({
      date: dateAt(i),
      fearGreedValue: 10 + i,
      btcChange24h: -5 + i,
      ethChange24h: -5 + i,
    }));
  }

  it("returns an empty array when there isn't a full window yet", () => {
    expect(computeRollingCorrelation(makeSeries(10), 30)).toEqual([]);
  });

  it("emits one point per day once the window is full", () => {
    const points = computeRollingCorrelation(makeSeries(35), 30);
    expect(points).toHaveLength(6); // windows ending on day index 29..34
    expect(points[0].date).toBe(dateAt(29));
    expect(points.at(-1)?.date).toBe(dateAt(34));
  });

  it("each window is strongly correlated for a linear series", () => {
    const points = computeRollingCorrelation(makeSeries(35), 30);
    for (const p of points) {
      expect(p.btc).toBeGreaterThan(0.99);
      expect(p.eth).toBeGreaterThan(0.99);
    }
  });
});
