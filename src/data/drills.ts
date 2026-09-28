import type { Drill, Technique } from './types';

/** Drills for a position: linked to it directly, or to a technique that starts there. */
export function drillsForPosition(positionId: string, drills: Drill[], techniques: Technique[]): Drill[] {
  const fromHere = new Set(techniques.filter((t) => t.from === positionId).map((t) => t.id));
  return drills.filter((d) => d.positionIds.includes(positionId) || d.techniqueIds.some((id) => fromHere.has(id)));
}
