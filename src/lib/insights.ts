import { pearsonCorrelation } from "./correlation";

export type Snapshot = {
  date: Date | string;
  fearGreedValue: number;
  btcChange24h: number;
  ethChange24h: number;
};

export type Insights = {
  sampleSize: number;
  btc: { sameDay: number; nextDay: number };
  eth: { sameDay: number; nextDay: number };
};

export type RollingCorrelationPoint = {
  date: string;
  btc: number;
  eth: number;
};

/**
 * Computes two correlations per asset:
 * - sameDay: does today's Fear & Greed value line up with today's price move?
 * - nextDay: does today's Fear & Greed value predict tomorrow's price move?
 *   (a lag-1 correlation — the more interesting question for "does sentiment lead price")
 */
export function computeInsights(snapshots: Snapshot[]): Insights {
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const fgi = sorted.map((s) => s.fearGreedValue);
  const btcChange = sorted.map((s) => s.btcChange24h);
  const ethChange = sorted.map((s) => s.ethChange24h);

  const sameDaySize = sorted.length;
  const nextDaySize = Math.max(sorted.length - 1, 0);

  return {
    sampleSize: sameDaySize,
    btc: {
      sameDay: pearsonCorrelation(fgi, btcChange),
      nextDay:
        nextDaySize < 2
          ? 0
          : pearsonCorrelation(
              fgi.slice(0, nextDaySize),
              btcChange.slice(1, nextDaySize + 1)
            ),
    },
    eth: {
      sameDay: pearsonCorrelation(fgi, ethChange),
      nextDay:
        nextDaySize < 2
          ? 0
          : pearsonCorrelation(
              fgi.slice(0, nextDaySize),
              ethChange.slice(1, nextDaySize + 1)
            ),
    },
  };
}

/**
 * Same-day Pearson correlation over a sliding window, so you can see whether
 * the sentiment/price relationship holds steady or drifts across market
 * regimes instead of collapsing the whole history into one number.
 */
export function computeRollingCorrelation(
  snapshots: Snapshot[],
  windowSize = 30
): RollingCorrelationPoint[] {
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length < windowSize) return [];

  const points: RollingCorrelationPoint[] = [];
  for (let end = windowSize; end <= sorted.length; end++) {
    const window = sorted.slice(end - windowSize, end);
    const fgi = window.map((s) => s.fearGreedValue);
    const btcChange = window.map((s) => s.btcChange24h);
    const ethChange = window.map((s) => s.ethChange24h);
    points.push({
      date:
        typeof window[window.length - 1].date === "string"
          ? (window[window.length - 1].date as string)
          : new Date(window[window.length - 1].date).toISOString().slice(0, 10),
      btc: pearsonCorrelation(fgi, btcChange),
      eth: pearsonCorrelation(fgi, ethChange),
    });
  }
  return points;
}
