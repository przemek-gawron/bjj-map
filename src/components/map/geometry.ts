import type { Technique } from '@/data/types';

export const NODE_W = 184;
export const NODE_H = 76;
/** Empty margin around the nodes' bounding box. */
export const CANVAS_PAD = 60;

type Point = { x: number; y: number };
type Layout = Record<string, Point>;

export type Edge = {
  technique: Technique;
  d: string;
  label: Point;
};

const center = (p: Point): Point => ({ x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 });

/** Point where the segment from `from` towards the box centre `c` enters the node box. */
function boxEntry(c: Point, from: Point, gap = 6): Point {
  const dx = from.x - c.x;
  const dy = from.y - c.y;
  const s = Math.min((NODE_W / 2 + gap) / Math.abs(dx || 1e-6), (NODE_H / 2 + gap) / Math.abs(dy || 1e-6));
  return { x: c.x + dx * s, y: c.y + dy * s };
}

/**
 * Curved arrows between node boxes. Parallel techniques (same from → to) fan out
 * alternately to either side so they don't overlap.
 */
export function buildEdges(techniques: Technique[], layout: Layout): Edge[] {
  const seen: Record<string, number> = {};
  const edges: Edge[] = [];

  for (const t of techniques) {
    if (!t.to || !layout[t.from] || !layout[t.to]) continue;
    const key = [t.from, t.to].sort().join('|');
    const i = (seen[key] = (seen[key] ?? -1) + 1);

    const a = center(layout[t.from]);
    const b = center(layout[t.to]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    // 0 → +40, 1 → -40, 2 → +90, 3 → -90 …
    const bend = (i % 2 === 0 ? 1 : -1) * (40 + Math.floor(i / 2) * 50);
    const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };

    const start = boxEntry(a, c);
    const end = boxEntry(b, c, 10);
    edges.push({
      technique: t,
      d: `M ${start.x} ${start.y} Q ${c.x} ${c.y} ${end.x} ${end.y}`,
      // quadratic bezier midpoint
      label: { x: 0.25 * start.x + 0.5 * c.x + 0.25 * end.x, y: 0.25 * start.y + 0.5 * c.y + 0.25 * end.y },
    });
  }
  return edges;
}

/**
 * Canvas area covering all nodes plus padding. Nodes may be dragged to negative
 * coordinates, so the origin isn't pinned to 0,0.
 */
export function canvasBounds(layout: Layout) {
  const points = Object.values(layout);
  if (points.length === 0) return { x: 0, y: 0, width: CANVAS_PAD * 2, height: CANVAS_PAD * 2 };
  const x = Math.min(...points.map((p) => p.x)) - CANVAS_PAD;
  const y = Math.min(...points.map((p) => p.y)) - CANVAS_PAD;
  return {
    x,
    y,
    width: Math.max(...points.map((p) => p.x)) + NODE_W + CANVAS_PAD - x,
    height: Math.max(...points.map((p) => p.y)) + NODE_H + CANVAS_PAD - y,
  };
}
