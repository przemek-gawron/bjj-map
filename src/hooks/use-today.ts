import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toDateKey } from '@/data/dates';

/** Milliseconds until the next local midnight (plus a second, to land safely in the new day). */
function untilMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime() + 1000;
}

/**
 * Today's date key, kept current. Screens stay mounted for days (tabs, the app waiting in the
 * background) and the React Compiler computes a bare toDateKey() once per screen, so "today"
 * comes from here: it moves on at midnight and when the app comes back to the foreground.
 */
export function useToday(): string {
  const [today, setToday] = useState(toDateKey);

  useEffect(() => {
    const refresh = () => setToday(toDateKey());
    let timer = setTimeout(function tick() {
      refresh();
      timer = setTimeout(tick, untilMidnight());
    }, untilMidnight());
    const sub = AppState.addEventListener('change', (state) => state === 'active' && refresh());
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return today;
}
