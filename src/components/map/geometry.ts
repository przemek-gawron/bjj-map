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

type Rect = { x: number; y: number; w: number; h: number };

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/** Rough size of an edge label (11px bold, one line, capped by the label box width). */
const LABEL_H = 16;
const labelWidth = (name: string) => Math.min(140, name.length * 6.4 + 8);

/** Points along the curve tried for the label, preferring the middle. */
const LABEL_TS = [0.5, 0.38, 0.62, 0.28, 0.72, 0.2, 0.8];

const bezier = (s: Point, c: Point, e: Point, t: number): Point => ({
  x: (1 - t) ** 2 * s.x + 2 * (1 - t) * t * c.x + t ** 2 * e.x,
  y: (1 - t) ** 2 * s.y + 2 * (1 - t) * t * c.y + t ** 2 * e.y,
});

/**
 * Curved arrows between node boxes. Techniques between the same two positions (either
 * direction) fan out alternately to either side so they don't overlap, and each label
 * slides along its curve to the spot least covered by nodes and earlier labels.
 */
export function buildEdges(techniques: Technique[], layout: Layout): Edge[] {
  const seen: Record<string, number> = {};
  const edges: Edge[] = [];
  const taken: Rect[] = Object.values(layout).map((p) => ({ x: p.x, y: p.y, w: NODE_W, h: NODE_H }));

  for (const t of techniques) {
    if (!t.to || !layout[t.from] || !layout[t.to]) continue;
    const [p, q] = [t.from, t.to].sort();
    const key = `${p}|${q}`;
    const i = (seen[key] = (seen[key] ?? -1) + 1);

    const a = center(layout[t.from]);
    const b = center(layout[t.to]);
    // bend relative to a direction shared by both A → B and B → A, otherwise
    // opposite arrows would bend onto the very same curve
    const n0 = center(layout[p]);
    const n1 = center(layout[q]);
    const dx = n1.x - n0.x;
    const dy = n1.y - n0.y;
    const len = Math.hypot(dx, dy) || 1;
    // 0 → +40, 1 → -40, 2 → +90, 3 → -90 …
    const bend = (i % 2 === 0 ? 1 : -1) * (40 + Math.floor(i / 2) * 50);
    const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };

    const start = boxEntry(a, c);
    const end = boxEntry(b, c, 10);

    const w = labelWidth(t.name);
    let best = { point: bezier(start, c, end, 0.5), cost: Infinity };
    for (const lt of LABEL_TS) {
      const point = bezier(start, c, end, lt);
      const rect = { x: point.x - w / 2, y: point.y - LABEL_H / 2, w, h: LABEL_H };
      const cost = taken.reduce((sum, r) => sum + overlap(rect, r), 0);
      if (cost < best.cost) best = { point, cost };
      if (cost === 0) break;
    }
    taken.push({ x: best.point.x - w / 2, y: best.point.y - LABEL_H / 2, w, h: LABEL_H });

    edges.push({ technique: t, d: `M ${start.x} ${start.y} Q ${c.x} ${c.y} ${end.x} ${end.y}`, label: best.point });
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
