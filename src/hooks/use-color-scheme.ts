import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettings } from '@/data/settings';

/** The app's color scheme: the one chosen in Settings, or the system's when set to "system". */
export function useColorScheme(): 'light' | 'dark' {
  const system = useSystemColorScheme();
  const appearance = useSettings((s) => s.appearance);
  if (appearance !== 'system') return appearance;
  return system === 'dark' ? 'dark' : 'light';
}
