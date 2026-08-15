import { describe, expect, it } from "vitest";
import { backtestFearGreedStrategy } from "./backtest";

describe("backtestFearGreedStrategy", () => {
  it("stays flat and returns zero when the signal never triggers", () => {
    const points = [
      { date: "2026-01-01", fearGreedValue: 50, price: 100 },
      { date: "2026-01-02", fearGreedValue: 50, price: 110 },
      { date: "2026-01-03", fearGreedValue: 50, price: 120 },
    ];
    const result = backtestFearGreedStrategy(points);
    expect(result.trades).toBe(0);
    expect(result.daysInMarket).toBe(0);
    expect(result.strategyReturnPct).toBe(0);
    expect(result.buyHoldReturnPct).toBeCloseTo(20);
  });

  it("enters on extreme fear and exits on extreme greed, one day later", () => {
    const points = [
      { date: "2026-01-01", fearGreedValue: 10, price: 100 }, // signal to buy tomorrow
      { date: "2026-01-02", fearGreedValue: 50, price: 110 }, // enters here (+10%)
      { date: "2026-01-03", fearGreedValue: 90, price: 121 }, // still in, signal to sell tomorrow (+10%)
      { date: "2026-01-04", fearGreedValue: 50, price: 100 }, // flat again, misses the drop
    ];
    const result = backtestFearGreedStrategy(points);
    expect(result.daysInMarket).toBe(2);
    expect(result.trades).toBe(2); // one entry, one exit
    expect(result.strategyReturnPct).toBeCloseTo(21); // 1.10 * 1.10 - 1
    expect(result.buyHoldReturnPct).toBeCloseTo(0); // 100 -> 100
  });

  it("holds through neutral readings once triggered (hysteresis)", () => {
    const points = [
      { date: "2026-01-01", fearGreedValue: 10, price: 100 },
      { date: "2026-01-02", fearGreedValue: 50, price: 110 }, // enters, stays in
      { date: "2026-01-03", fearGreedValue: 50, price: 121 }, // still in (no exit signal)
    ];
    const result = backtestFearGreedStrategy(points);
    expect(result.daysInMarket).toBe(2);
    expect(result.trades).toBe(1); // only the entry; never exited
  });

  it("returns zeros for fewer than 2 points", () => {
    const result = backtestFearGreedStrategy([{ date: "2026-01-01", fearGreedValue: 10, price: 100 }]);
    expect(result.strategyReturnPct).toBe(0);
    expect(result.buyHoldReturnPct).toBe(0);
    expect(result.totalDays).toBe(1);
  });
});
