import type { Position, PositionGroup, Technique } from '@/data/types';

/** Order of the group cards. */
export const GROUP_ORDER: PositionGroup[] = [
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

export type GroupSummary = {
  group: PositionGroup;
  positions: Position[];
  /** Techniques starting in the group. */
  techniques: number;
  works: number;
  submissions: number;
  /** Where the group's techniques lead, most common first (other groups only). */
  leadsTo: { group: PositionGroup; count: number }[];
};

/** One summary per position group on the map: the map one level up, without any arrows. */
export function groupSummaries(positions: Position[], techniques: Technique[]): GroupSummary[] {
  const groupById = new Map(positions.map((p) => [p.id, p.group]));
  return GROUP_ORDER.filter((g) => positions.some((p) => p.group === g)).map((group) => {
    const from = techniques.filter((t) => groupById.get(t.from) === group);
    const counts = new Map<PositionGroup, number>();
    for (const t of from) {
      const to = t.to ? groupById.get(t.to) : undefined;
      if (to && to !== group) counts.set(to, (counts.get(to) ?? 0) + 1);
    }
    return {
      group,
      positions: positions.filter((p) => p.group === group),
      techniques: from.length,
      works: from.filter((t) => t.status === 'works').length,
      submissions: from.filter((t) => !t.to).length,
      leadsTo: [...counts].map(([g, count]) => ({ group: g, count })).sort((a, b) => b.count - a.count),
    };
  });
}
