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

const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
const MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

/** "wrzesień 2026" for a YYYY-MM month key. */
export function monthLabel(month: string): string {
  return `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
}

/** "wrz" for a YYYY-MM month key. */
export function shortMonthLabel(month: string): string {
  return MONTHS_SHORT[Number(month.slice(5, 7)) - 1];
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
