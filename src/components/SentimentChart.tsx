import { buildLinePoints, toPath } from "@/lib/chart-scale";

type ChartPoint = {
  date: string;
  fearGreedValue: number;
  btcPriceUsd: number;
  ethPriceUsd: number;
};

const WIDTH = 800;
const HEIGHT = 260;
const PADDING = 32;

export function SentimentChart({ data }: { data: ChartPoint[] }) {
  if (data.length < 2) {
    return <p className="text-sm text-neutral-400">Dados insuficientes para o gráfico.</p>;
  }

  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;

  const fgiPoints = buildLinePoints(
    data.map((d) => d.fearGreedValue),
    [0, 100],
    innerWidth,
    innerHeight,
    PADDING
  );
  const btcPoints = buildLinePoints(
    data.map((d) => d.btcPriceUsd),
    undefined,
    innerWidth,
    innerHeight,
    PADDING
  );
  const ethPoints = buildLinePoints(
    data.map((d) => d.ethPriceUsd),
    undefined,
    innerWidth,
    innerHeight,
    PADDING
  );

  const firstDate = data[0].date;
  const lastDate = data[data.length - 1].date;

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="Fear & Greed Index vs preços de BTC e ETH ao longo do tempo">
        {[0, 25, 50, 75, 100].map((tick) => (
          <line
            key={tick}
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={PADDING + innerHeight - (tick / 100) * innerHeight}
            y2={PADDING + innerHeight - (tick / 100) * innerHeight}
            stroke="currentColor"
            strokeOpacity={0.08}
          />
        ))}
        <path d={toPath(ethPoints)} fill="none" stroke="#818cf8" strokeWidth={1.5} opacity={0.75} />
        <path d={toPath(btcPoints)} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.85} />
        <path d={toPath(fgiPoints)} fill="none" stroke="#22c55e" strokeWidth={2} />
      </svg>
      <div className="flex justify-between text-xs text-neutral-400 mt-1">
        <span>{firstDate}</span>
        <span>{lastDate}</span>
      </div>
      <div className="flex flex-wrap gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Fear &amp; Greed Index
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Preço BTC (normalizado)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]" /> Preço ETH (normalizado)
        </span>
      </div>
    </div>
  );
}
