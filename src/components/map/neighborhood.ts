import { NODE_H, NODE_W } from './geometry';

import type { Position, Technique } from '@/data/types';

const GAP_X = 40;
const GAP_Y = 70;
/** Extra room between the incoming rows, the centre and the outgoing rows. */
const BAND_GAP = 60;

/**
 * One position and its direct neighbours: where you can come from on top (two columns),
 * the position in the middle, and where its techniques lead below. A neighbour you can
 * both come from and go to sits below. Only techniques touching the centre are kept.
 */
export function neighborhood(centerId: string, positions: Position[], techniques: Technique[]) {
  const touching = techniques.filter((t) => t.from === centerId || t.to === centerId);
  const outgoing = [...new Set(touching.filter((t) => t.from === centerId && t.to && t.to !== centerId).map((t) => t.to!))];
  const incoming = [...new Set(touching.filter((t) => t.to === centerId && t.from !== centerId).map((t) => t.from))].filter(
    (id) => !outgoing.includes(id)
  );

  const width = NODE_W * 2 + GAP_X;
  const layout: Record<string, { x: number; y: number }> = {};
  let y = 0;
  const grid = (ids: string[]) => {
    ids.forEach((id, i) => {
      const lastAlone = i === ids.length - 1 && ids.length % 2 === 1;
      layout[id] = { x: lastAlone ? (width - NODE_W) / 2 : (i % 2) * (NODE_W + GAP_X), y: y + Math.floor(i / 2) * (NODE_H + GAP_Y) };
    });
    if (ids.length) y += Math.ceil(ids.length / 2) * (NODE_H + GAP_Y) - GAP_Y + NODE_H + BAND_GAP;
  };

  grid(incoming);
  layout[centerId] = { x: (width - NODE_W) / 2, y };
  y += NODE_H + GAP_Y + BAND_GAP;
  grid(outgoing);

  return {
    positions: positions.filter((p) => layout[p.id]).map((p) => ({ ...p, layout: layout[p.id] })),
    techniques: touching,
  };
}
