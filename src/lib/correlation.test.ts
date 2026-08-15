import { describe, expect, it } from "vitest";
import { pearsonCorrelation } from "./correlation";

describe("pearsonCorrelation", () => {
  it("returns 1 for perfectly correlated series", () => {
    expect(pearsonCorrelation([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
  });

  it("returns -1 for perfectly inversely correlated series", () => {
    expect(pearsonCorrelation([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
  });

  it("returns 0 when one series has no variance", () => {
    expect(pearsonCorrelation([1, 2, 3], [5, 5, 5])).toBe(0);
  });

  it("returns 0 for fewer than 2 points", () => {
    expect(pearsonCorrelation([1], [1])).toBe(0);
    expect(pearsonCorrelation([], [])).toBe(0);
  });

  it("throws on mismatched lengths", () => {
    expect(() => pearsonCorrelation([1, 2], [1])).toThrow();
  });

  it("computes a known intermediate value", () => {
    // x and y share a weak positive relationship
    const x = [1, 2, 3, 4, 5];
    const y = [2, 1, 4, 3, 5];
    const r = pearsonCorrelation(x, y);
    expect(r).toBeGreaterThan(0.7);
    expect(r).toBeLessThan(1);
  });
});
