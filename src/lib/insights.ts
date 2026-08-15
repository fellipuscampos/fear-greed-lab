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
