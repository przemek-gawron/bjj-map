import type { Status } from './types';

/** Status colors per theme: the light one needs darker shades to stay readable on its pale background. */
export const STATUS_COLORS: Record<'light' | 'dark', Record<Status, string>> = {
  dark: {
    seen: '#9CA3AF',
    drilling: '#F59E0B',
    // blue, not green: green would blur with the lime accent
    works: '#38BDF8',
  },
  light: {
    seen: '#6B7280',
    drilling: '#B45309',
    works: '#0369A1',
  },
};
