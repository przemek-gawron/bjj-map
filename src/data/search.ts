const PLAIN: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };

/** Lower case without Polish diacritics, so "sciaganie" finds "Ściąganie" (and the other way round). */
function plain(text: string): string {
  return text.toLowerCase().replace(/[ąćęłńóśźż]/g, (ch) => PLAIN[ch]);
}

/** Matcher for a search box: everything matches an empty query. */
export function searchMatcher(query: string): (name: string) => boolean {
  const q = plain(query.trim());
  return (name) => !q || plain(name).includes(q);
}
