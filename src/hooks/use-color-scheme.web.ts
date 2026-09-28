import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useSettings } from '@/data/settings';

const noopSubscribe = () => () => {};

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web:
 * the server snapshot is `false`, the client snapshot `true`.
 */
export function useColorScheme(): 'light' | 'dark' {
  const hasHydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const colorScheme = useRNColorScheme();
  const appearance = useSettings((s) => s.appearance);

  if (appearance !== 'system') return appearance;
  return hasHydrated && colorScheme === 'dark' ? 'dark' : 'light';
}
