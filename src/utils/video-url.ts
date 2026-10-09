/**
 * A typed video link, made openable ("youtube.com/…" gets https://). Undefined for an empty field,
 * null for text that isn't a web address (spaces, no domain), which the form refuses instead of saving.
 */
export function parseVideoUrl(text: string): string | undefined | null {
  const url = text.trim();
  if (!url) return undefined;
  const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return /^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/i.test(full) ? full : null;
}
