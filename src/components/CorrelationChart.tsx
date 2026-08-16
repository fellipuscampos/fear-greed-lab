"use client";

import { buildLinePoints, toPath } from "@/lib/chart-scale";
import { useChartHover } from "@/lib/use-chart-hover";
import type { RollingCorrelationPoint } from "@/lib/insights";
import { ChartTooltip } from "./ChartTooltip";

const WIDTH = 800;
const HEIGHT = 180;
const PADDING = 32;
const DOMAIN: [number, number] = [-1, 1];

function formatR(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}`;
}

export function CorrelationChart({ data }: { data: RollingCorrelationPoint[] }) {
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;
  const { svgRef, hoveredIndex, onPointerMove, onPointerLeave } = useChartHover(
    data.length,
    PADDING,
    innerWidth
  );

  if (data.length < 2) {
    return (
      <p className="text-sm text-neutral-400">
        Ainda não há histórico suficiente (mínimo 30 dias) para a correlação em janela móvel.
      </p>
    );
  }

  const btcPoints = buildLinePoints(data.map((d) => d.btc), DOMAIN, innerWidth, innerHeight, PADDING);
  const ethPoints = buildLinePoints(data.map((d) => d.eth), DOMAIN, innerWidth, innerHeight, PADDING);
  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto touch-none"
        role="img"
        aria-label="Correlação de Pearson em janela móvel de 30 dias entre sentimento e preço"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {[-1, -0.5, 0, 0.5, 1].map((tick) => (
          <line
            key={tick}
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={PADDING + innerHeight - ((tick + 1) / 2) * innerHeight}
            y2={PADDING + innerHeight - ((tick + 1) / 2) * innerHeight}
            stroke="currentColor"
            strokeOpacity={tick === 0 ? 0.25 : 0.08}
          />
        ))}
        <path d={toPath(ethPoints)} fill="none" stroke="#818cf8" strokeWidth={1.5} opacity={0.85} />
        <path d={toPath(btcPoints)} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.85} />

        {hoveredIndex !== null && hovered && (
          <>
            <line
              x1={btcPoints[hoveredIndex].x}
              x2={btcPoints[hoveredIndex].x}
              y1={PADDING}
              y2={PADDING + innerHeight}
              stroke="currentColor"
              strokeOpacity={0.3}
            />
            <circle cx={btcPoints[hoveredIndex].x} cy={btcPoints[hoveredIndex].y} r={3.5} fill="#f59e0b" />
            <circle cx={ethPoints[hoveredIndex].x} cy={ethPoints[hoveredIndex].y} r={3.5} fill="#818cf8" />
            <ChartTooltip
              x={btcPoints[hoveredIndex].x}
              chartWidth={WIDTH}
              lines={[hovered.date, `BTC: ${formatR(hovered.btc)}`, `ETH: ${formatR(hovered.eth)}`]}
            />
          </>
        )}
      </svg>
      <div className="flex justify-between text-xs text-neutral-500 mt-1">
        <span>{data[0].date}</span>
        <span>+1 / 0 / -1</span>
        <span>{data[data.length - 1].date}</span>
      </div>
      <div className="flex flex-wrap gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> BTC (janela de 30 dias)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]" /> ETH (janela de 30 dias)
        </span>
      </div>
    </div>
  );
}
