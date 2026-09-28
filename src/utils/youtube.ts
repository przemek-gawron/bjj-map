/** YouTube search for a technique or drill, used when it has no video of its own. */
export const youtubeSearch = (name: string) =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${name} bjj`);
