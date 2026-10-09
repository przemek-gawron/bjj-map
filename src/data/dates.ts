import { currentT } from '@/i18n';

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

/** Number of calendar days from `key` to today (0 = today). */
export function daysAgo(key: string): number {
  const today = fromDateKey(toDateKey());
  return Math.round((today.getTime() - fromDateKey(key).getTime()) / 86_400_000);
}

/** Day of the month and 0-based month of a date key. */
const dayAndMonth = (key: string) => [Number(key.slice(8)), Number(key.slice(5, 7)) - 1] as const;

/** "dziś", "wczoraj", "3 dni temu", or "12.09" / "Sep 12" for older dates. */
export function relativeDay(key: string): string {
  const t = currentT().dates;
  const n = daysAgo(key);
  if (n === 0) return t.today;
  if (n === 1) return t.yesterday;
  if (n < 7) return t.daysAgo(n);
  return shortDate(key);
}

/** "12.09" / "Sep 12" */
export function shortDate(key: string): string {
  return currentT().dates.shortDate(...dayAndMonth(key));
}

/** "12.09.2026" / "Sep 12, 2026" */
export function fullDate(key: string): string {
  return currentT().dates.fullDate(...dayAndMonth(key), Number(key.slice(0, 4)));
}

/** "sob 27.09" / "Sat, Sep 27" */
export function dayLabel(key: string): string {
  const t = currentT().dates;
  return t.dayLabel(t.weekdays[fromDateKey(key).getDay()], ...dayAndMonth(key));
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

/** "22.09 – 28.09" / "Sep 22 – 28" for the week starting on `weekStart`. */
export function weekRangeLabel(weekStart: string): string {
  return currentT().dates.range(...dayAndMonth(weekStart), ...dayAndMonth(addDays(weekStart, 6)));
}

/** "wrzesień 2026" for a YYYY-MM month key. */
export function monthLabel(month: string): string {
  return `${currentT().dates.months[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
}

/** "wrz" for a YYYY-MM month key. */
export function shortMonthLabel(month: string): string {
  return currentT().dates.monthsShort[Number(month.slice(5, 7)) - 1];
}

/** YYYY-MM month key `delta` months away from `month`. */
export function addMonths(month: string, delta: number): string {
  const d = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1);
  return toDateKey(d).slice(0, 7);
}

/** Date key `delta` days away from `key`. */
export function addDays(key: string, delta: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

/** Calendar grid of a YYYY-MM month in weeks starting on Monday; null pads days outside the month. */
export function monthGrid(month: string): (string | null)[][] {
  const first = fromDateKey(`${month}-01`);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${pad(i + 1)}`)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}
