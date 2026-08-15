export function scaleLinear(values: number[], value: number, outMin: number, outMax: number): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return (outMin + outMax) / 2;
  return outMin + ((value - min) / (max - min)) * (outMax - outMin);
}

export function toPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

/**
 * Maps a series of numeric values onto SVG coordinates.
 * `domain`, if given, fixes the y-range (e.g. [-1, 1] for a correlation
 * coefficient); otherwise the series is min-max scaled to itself.
 */
export function buildLinePoints(
  values: number[],
  domain: [number, number] | undefined,
  innerWidth: number,
  innerHeight: number,
  padding: number
): { x: number; y: number }[] {
  const [domainMin, domainMax] = domain ?? [Math.min(...values), Math.max(...values)];
  return values.map((v, i) => {
    const t = domainMax === domainMin ? 0.5 : (v - domainMin) / (domainMax - domainMin);
    return {
      x: padding + (i / Math.max(values.length - 1, 1)) * innerWidth,
      y: padding + innerHeight - t * innerHeight,
    };
  });
}
