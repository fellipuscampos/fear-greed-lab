type ChartPoint = {
  date: string;
  fearGreedValue: number;
  btcPriceUsd: number;
};

const WIDTH = 800;
const HEIGHT = 260;
const PADDING = 32;

function scale(values: number[], value: number, outMin: number, outMax: number): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return (outMin + outMax) / 2;
  return outMin + ((value - min) / (max - min)) * (outMax - outMin);
}

function toPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

export function SentimentChart({ data }: { data: ChartPoint[] }) {
  if (data.length < 2) {
    return <p className="text-sm text-neutral-400">Dados insuficientes para o gráfico.</p>;
  }

  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;

  const btcPrices = data.map((d) => d.btcPriceUsd);

  const fgiPoints = data.map((d, i) => ({
    x: PADDING + (i / (data.length - 1)) * innerWidth,
    y: PADDING + innerHeight - (d.fearGreedValue / 100) * innerHeight,
  }));

  const btcPoints = data.map((d, i) => ({
    x: PADDING + (i / (data.length - 1)) * innerWidth,
    y: PADDING + innerHeight - (scale(btcPrices, d.btcPriceUsd, 0, 100) / 100) * innerHeight,
  }));

  const firstDate = data[0].date;
  const lastDate = data[data.length - 1].date;

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="Fear & Greed Index vs BTC price over time">
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
        <path d={toPath(btcPoints)} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.85} />
        <path d={toPath(fgiPoints)} fill="none" stroke="#22c55e" strokeWidth={2} />
      </svg>
      <div className="flex justify-between text-xs text-neutral-400 mt-1">
        <span>{firstDate}</span>
        <span>{lastDate}</span>
      </div>
      <div className="flex gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Fear &amp; Greed Index
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Preço BTC (normalizado)
        </span>
      </div>
    </div>
  );
}
