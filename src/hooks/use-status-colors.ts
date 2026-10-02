import { STATUS_COLORS } from '@/data/labels';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Status colors (seen / drilling / works) for the current theme. */
export function useStatusColors() {
  return STATUS_COLORS[useColorScheme()];
}
