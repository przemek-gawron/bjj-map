import type { Session } from './types';

export type TrainingStats = { count: number; lastDate?: string; dates: string[] };

/** Per-technique training history derived from sessions (newest date first). */
export function trainingStats(sessions: Session[]): Map<string, TrainingStats> {
  const stats = new Map<string, TrainingStats>();
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  for (const session of sorted) {
    for (const id of session.techniqueIds) {
      const s = stats.get(id) ?? { count: 0, dates: [] };
      s.count += 1;
      s.lastDate ??= session.date;
      s.dates.push(session.date);
      stats.set(id, s);
    }
  }
  return stats;
}
