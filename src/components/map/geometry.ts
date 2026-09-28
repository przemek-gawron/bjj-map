import type { Position, PositionGroup, Technique } from '@/data/types';

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
const LABEL_TS = [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.18, 0.82];

const bezier = (s: Point, c: Point, e: Point, t: number): Point => ({
  x: (1 - t) ** 2 * s.x + 2 * (1 - t) * t * c.x + t ** 2 * e.x,
  y: (1 - t) ** 2 * s.y + 2 * (1 - t) * t * c.y + t ** 2 * e.y,
});

/** Points along a curve, used to keep labels off other arrows and arrows out of other nodes. */
const samples = (s: Point, c: Point, e: Point, n = 24) =>
  Array.from({ length: n - 1 }, (_, i) => bezier(s, c, e, (i + 1) / n));

const inside = (p: Point, r: Rect, margin = 0) =>
  p.x > r.x - margin && p.x < r.x + r.w + margin && p.y > r.y - margin && p.y < r.y + r.h + margin;

/** Extra bend tried, in order, when an arrow would run through another node. */
const BEND_STEPS = [1, 2.2, 3.4, 4.6, 6, 7.5];
/** Cost of an arrow's line crossing a label, per sampled point (vs. area for overlaps). */
const LINE_COST = 40;

type Curve = { technique: Technique; start: Point; c: Point; end: Point };

/**
 * Curved arrows between node boxes. Techniques between the same two positions (either
 * direction) fan out side by side so they don't overlap. A pair whose arrow would cut
 * through another node (or out past the map's sides) bends the other way or further
 * round it, and each label slides along
 * its curve to the spot least covered by nodes, earlier labels and other arrows.
 */
export function buildEdges(techniques: Technique[], layout: Layout): Edge[] {
  const seen: Record<string, number> = {};
  // bend side and strength picked for each pair of positions, shared by all its arrows
  const choice: Record<string, { side: number; step: number }> = {};
  const nodes = Object.entries(layout).map(([id, p]) => ({ id, rect: { x: p.x, y: p.y, w: NODE_W, h: NODE_H } }));
  // arrows bulging past the outermost nodes get cut off at the canvas edge (and off screen)
  const minX = Math.min(...nodes.map((n) => n.rect.x));
  const maxX = Math.max(...nodes.map((n) => n.rect.x + n.rect.w));

  const curves: Curve[] = techniques
    .filter((t) => t.to && layout[t.from] && layout[t.to])
    .map((t) => {
      const [p, q] = [t.from, t.to!].sort();
      const key = `${p}|${q}`;
      const i = (seen[key] = (seen[key] ?? -1) + 1);

      const a = center(layout[t.from]);
      const b = center(layout[t.to!]);
      // bend relative to a direction shared by both A → B and B → A, otherwise
      // opposite arrows would bend onto the very same curve
      const n0 = center(layout[p]);
      const n1 = center(layout[q]);
      const dx = n1.x - n0.x;
      const dy = n1.y - n0.y;
      const len = Math.hypot(dx, dy) || 1;
      // arrows of one pair fan out on the same side, each further out: 40, 90, 140 …
      const bendBy = 40 + i * 50;
      const curve = (side: number, step: number): Curve => {
        const bend = bendBy * step * side;
        const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };
        return { technique: t, start: boxEntry(a, c), c, end: boxEntry(b, c, 10) };
      };

      if (!choice[key]) {
        const others = nodes.filter((n) => n.id !== p && n.id !== q);
        const hitsOf = ({ start, c, end }: Curve) =>
          samples(start, c, end).filter((pt) => pt.x < minX || pt.x > maxX || others.some((n) => inside(pt, n.rect, 8))).length;
        let best = { side: 1, step: 1, hits: Infinity };
        search: for (const step of BEND_STEPS) {
          for (const side of [1, -1]) {
            const hits = hitsOf(curve(side, step));
            if (hits < best.hits) best = { side, step, hits };
            if (hits === 0) break search;
          }
        }
        choice[key] = best;
      }
      return curve(choice[key].side, choice[key].step);
    });

  const lines = curves.map((cv) => samples(cv.start, cv.c, cv.end, 32));
  const taken: Rect[] = nodes.map((n) => n.rect);

  return curves.map(({ technique: t, start, c, end }, k) => {
    const w = labelWidth(t.name);
    let best = { point: bezier(start, c, end, 0.5), cost: Infinity };
    for (const lt of LABEL_TS) {
      const point = bezier(start, c, end, lt);
      const rect = { x: point.x - w / 2, y: point.y - LABEL_H / 2, w, h: LABEL_H };
      let cost = taken.reduce((sum, r) => sum + overlap(rect, r), 0);
      lines.forEach((line, j) => {
        if (j !== k) cost += line.filter((pt) => inside(pt, rect)).length * LINE_COST;
      });
      if (cost < best.cost) best = { point, cost };
      if (cost === 0) break;
    }
    taken.push({ x: best.point.x - w / 2, y: best.point.y - LABEL_H / 2, w, h: LABEL_H });
    return { technique: t, d: `M ${start.x} ${start.y} Q ${c.x} ${c.y} ${end.x} ${end.y}`, label: best.point };
  });
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

/** Rows of the tidy layout, top to bottom; positions of other groups go last. */
const GROUP_ROWS: PositionGroup[] = [
  'standing',
  'open_guard',
  'closed_guard',
  'half_guard',
  'turtle',
  'side_control',
  'knee_on_belly',
  'north_south',
  'mount',
  'back',
];
/** Wide enough for the arrows between the two columns to keep their labels apart. */
const COL_GAP = 200;
const ROW_GAP = 120;

/**
 * A clean layout: neutral positions centred on top, then one row per position group with
 * "you're at the bottom" on the left and "you're on top" on the right, so a group's two
 * sides sit side by side and most arrows run across or down instead of criss-crossing.
 */
export function tidyLayout(positions: Pick<Position, 'id' | 'group' | 'side'>[]): Layout {
  const rank = (g: PositionGroup) => (GROUP_ROWS.includes(g) ? GROUP_ROWS.indexOf(g) : GROUP_ROWS.length);
  const width = NODE_W * 2 + COL_GAP;
  const layout: Layout = {};
  let y = 0;

  const neutral = positions.filter((p) => p.side === 'neutral');
  neutral.forEach((p, i) => {
    const rowWidth = neutral.length * NODE_W + (neutral.length - 1) * COL_GAP;
    layout[p.id] = { x: (width - rowWidth) / 2 + i * (NODE_W + COL_GAP), y };
  });
  if (neutral.length) y += NODE_H + ROW_GAP;

  const groups = [...new Set(positions.filter((p) => p.side !== 'neutral').map((p) => p.group))].sort((a, b) => rank(a) - rank(b));
  for (const g of groups) {
    const bottom = positions.filter((p) => p.group === g && p.side === 'bottom');
    const top = positions.filter((p) => p.group === g && p.side === 'top');
    for (let i = 0; i < Math.max(bottom.length, top.length); i++) {
      if (bottom[i]) layout[bottom[i].id] = { x: 0, y };
      if (top[i]) layout[top[i].id] = { x: NODE_W + COL_GAP, y };
      y += NODE_H + ROW_GAP;
    }
  }
  return layout;
}
