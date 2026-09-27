import type { PositionGroup, Status, TechniqueType } from './types';

export const GROUP_LABEL: Record<PositionGroup, string> = {
  standing: 'Stójka',
  closed_guard: 'Closed guard',
  open_guard: 'Open guard',
  half_guard: 'Half guard',
  side_control: 'Side control',
  mount: 'Mount',
  back: 'Plecy',
};

export const TYPE_LABEL: Record<TechniqueType, string> = {
  submission: 'Kończenia',
  sweep: 'Sweepy',
  escape: 'Ucieczki',
  pass: 'Przejścia gardy',
  takedown: 'Obalenia',
  transition: 'Przejścia',
};

export const STATUS_LABEL: Record<Status, string> = {
  seen: 'Widziałem',
  drilling: 'Ćwiczę',
  works: 'Działa w sparingu',
};

export const STATUS_COLOR: Record<Status, string> = {
  seen: '#9CA3AF',
  drilling: '#F59E0B',
  works: '#10B981',
};
