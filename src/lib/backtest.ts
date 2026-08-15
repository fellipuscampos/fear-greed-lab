export type BacktestPoint = {
  date: Date | string;
  fearGreedValue: number;
  price: number;
};

export type BacktestResult = {
  strategyReturnPct: number;
  buyHoldReturnPct: number;
  trades: number;
  daysInMarket: number;
  totalDays: number;
};

/**
 * Simulates a naive "buy fear, sell greed" strategy and compares it to
 * buy-and-hold, so the correlation numbers translate into something
 * concrete: would acting on this signal actually have beaten just holding?
 *
 * To avoid lookahead bias, each day's position is decided from the
 * *previous* day's Fear & Greed reading (the earliest you could realistically
 * have acted on it), then that position earns (or misses) that day's return.
 * Once triggered, the position holds until the opposite signal fires
 * (hysteresis) rather than flattening on every neutral reading.
 */
export function backtestFearGreedStrategy(
  points: BacktestPoint[],
  opts: { buyBelow?: number; sellAbove?: number } = {}
): BacktestResult {
  const buyBelow = opts.buyBelow ?? 20;
  const sellAbove = opts.sellAbove ?? 80;

  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length < 2) {
    return { strategyReturnPct: 0, buyHoldReturnPct: 0, trades: 0, daysInMarket: 0, totalDays: sorted.length };
  }

  let inPosition: boolean = false;
  let trades = 0;
  let daysInMarket = 0;
  let strategyMultiplier = 1;

  for (let i = 1; i < sorted.length; i++) {
    const signal = sorted[i - 1].fearGreedValue;
    const wasInPosition: boolean = inPosition;

    if (!inPosition && signal <= buyBelow) inPosition = true;
    else if (inPosition && signal >= sellAbove) inPosition = false;

    if (inPosition !== wasInPosition) trades++;

    if (inPosition) {
      strategyMultiplier *= sorted[i].price / sorted[i - 1].price;
      daysInMarket++;
    }
  }

  const buyHoldMultiplier = sorted[sorted.length - 1].price / sorted[0].price;

  return {
    strategyReturnPct: (strategyMultiplier - 1) * 100,
    buyHoldReturnPct: (buyHoldMultiplier - 1) * 100,
    trades,
    daysInMarket,
    totalDays: sorted.length,
  };
}
