const CHAR_WIDTH = 6.1;
const LINE_HEIGHT = 15;
const BOX_PADDING = 8;

export function ChartTooltip({
  x,
  chartWidth,
  lines,
  topY = 8,
}: {
  x: number;
  chartWidth: number;
  lines: string[];
  topY?: number;
}) {
  const longest = Math.max(...lines.map((l) => l.length));
  const boxWidth = longest * CHAR_WIDTH + BOX_PADDING * 2;
  const boxHeight = lines.length * LINE_HEIGHT + BOX_PADDING * 1.5;

  const overflowsRight = x + 12 + boxWidth > chartWidth;
  const boxX = overflowsRight ? x - 12 - boxWidth : x + 12;

  return (
    <g pointerEvents="none">
      <rect
        x={boxX}
        y={topY}
        width={boxWidth}
        height={boxHeight}
        rx={6}
        fill="#171717"
        stroke="#404040"
        strokeWidth={1}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={boxX + BOX_PADDING}
          y={topY + BOX_PADDING + (i + 0.75) * LINE_HEIGHT}
          fontSize={11}
          fill={i === 0 ? "#a3a3a3" : "#f5f5f5"}
        >
          {line}
        </text>
      ))}
    </g>
  );
}
