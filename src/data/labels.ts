import type { Status } from './types';

export const STATUS_COLOR: Record<Status, string> = {
  seen: '#9CA3AF',
  drilling: '#F59E0B',
  // blue, not green: green would blur with the lime accent
  works: '#38BDF8',
};
