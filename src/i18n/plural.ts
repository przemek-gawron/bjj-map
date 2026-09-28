/** Polish plural: 1 trening, 2–4 treningi (not 12–14), 5+ treningów. */
export function plPlural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const tens = n % 100;
  return n % 10 >= 2 && n % 10 <= 4 && (tens < 12 || tens > 14) ? few : many;
}

export function enPlural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
