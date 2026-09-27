const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (not UTC — training "today" is the user's today). */
export function toDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday of the week containing `key`. */
export function weekStartOf(key: string): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toDateKey(d);
}

const WEEKDAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sob'];

/** Number of calendar days from `key` to today (0 = today). */
export function daysAgo(key: string): number {
  const today = fromDateKey(toDateKey());
  return Math.round((today.getTime() - fromDateKey(key).getTime()) / 86_400_000);
}

/** "dziś", "wczoraj", "3 dni temu", or "12.09" for older dates. */
export function relativeDay(key: string): string {
  const n = daysAgo(key);
  if (n === 0) return 'dziś';
  if (n === 1) return 'wczoraj';
  if (n < 7) return `${n} dni temu`;
  return shortDate(key);
}

/** "12.09" */
export function shortDate(key: string): string {
  return `${key.slice(8)}.${key.slice(5, 7)}`;
}

/** "sob 27.09" */
export function dayLabel(key: string): string {
  return `${WEEKDAYS[fromDateKey(key).getDay()]} ${shortDate(key)}`;
}

/** The last `n` days as date keys, today first. */
export function recentDays(n: number): string[] {
  const d = fromDateKey(toDateKey());
  return Array.from({ length: n }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() - i);
    return toDateKey(day);
  });
}

/** "22.09 – 28.09" for the week starting on `weekStart`. */
export function weekRangeLabel(weekStart: string): string {
  const end = fromDateKey(weekStart);
  end.setDate(end.getDate() + 6);
  return `${shortDate(weekStart)} – ${shortDate(toDateKey(end))}`;
}
