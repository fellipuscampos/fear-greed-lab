import type { BacktestResult } from "@/lib/backtest";

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export function BacktestCard({ asset, result }: { asset: string; result: BacktestResult }) {
  const beatMarket = result.strategyReturnPct > result.buyHoldReturnPct;
  const pctOfDaysInMarket =
    result.totalDays > 0 ? Math.round((result.daysInMarket / result.totalDays) * 100) : 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400 mb-3">{asset}</p>
      <div className="flex items-end gap-6">
        <div>
          <p className="text-[11px] text-neutral-500">Estratégia (compra medo, vende ganância)</p>
          <p className="text-2xl font-semibold mt-0.5">{formatPct(result.strategyReturnPct)}</p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-500">Buy &amp; hold</p>
          <p className="text-2xl font-semibold mt-0.5 text-neutral-400">
            {formatPct(result.buyHoldReturnPct)}
          </p>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-3">
        {beatMarket ? "Bateu" : "Não bateu"} o buy &amp; hold no período · {result.trades} operações
        · {pctOfDaysInMarket}% dos dias posicionado
      </p>
    </div>
  );
}
