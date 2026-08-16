import { useRef, useState, type PointerEvent } from "react";

/**
 * Tracks which data index the pointer is over inside an SVG chart, using the
 * SVG's own coordinate transform (getScreenCTM) so it stays correct
 * regardless of how the viewBox is scaled to its rendered CSS size.
 */
export function useChartHover(length: number, padding: number, innerWidth: number) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm || length < 2) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const local = point.matrixTransform(ctm.inverse());

    const t = (local.x - padding) / innerWidth;
    const index = Math.round(t * (length - 1));
    setHoveredIndex(Math.min(Math.max(index, 0), length - 1));
  }

  function onPointerLeave() {
    setHoveredIndex(null);
  }

  return { svgRef, hoveredIndex, onPointerMove, onPointerLeave };
}
