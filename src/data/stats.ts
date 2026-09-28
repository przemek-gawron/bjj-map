import { currentLanguage } from '@/i18n';

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

/** Length assumed for trainings logged without one (e.g. ticked off in Techniki or Plan). */
export const DEFAULT_SESSION_MINUTES = 90;

/** Durations offered in the journal entry form. */
export const SESSION_MINUTES = [60, 90, 120, 150, 180];

export function sessionHours(s: Session): number {
  return (s.durationMin ?? DEFAULT_SESSION_MINUTES) / 60;
}

export function totalHours(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + sessionHours(s), 0);
}

export type PeriodStats = {
  sessions: number;
  hours: number;
  /** Techniques trained in the period, most trained first. */
  techniques: { id: string; count: number }[];
};

/** Totals for sessions whose date starts with `prefix` (YYYY for a year, YYYY-MM for a month). */
export function periodStats(sessions: Session[], prefix: string): PeriodStats {
  const inPeriod = sessions.filter((s) => s.date.startsWith(prefix));
  const counts = new Map<string, number>();
  for (const s of inPeriod) for (const id of s.techniqueIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return {
    sessions: inPeriod.length,
    hours: totalHours(inPeriod),
    techniques: [...counts].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count),
  };
}

/** "4,5" in Polish, "4.5" in English. */
export function formatHours(h: number): string {
  const text = Number.isInteger(h) ? String(h) : h.toFixed(1);
  return currentLanguage() === 'pl' ? text.replace('.', ',') : text;
}
