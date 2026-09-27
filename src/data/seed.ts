import type { Position, Technique } from './types';

/** Starter white-belt map loaded on first launch. Everything starts as "seen". */

export const seedPositions: Position[] = [
  { id: 'standing', name: 'Stójka', group: 'standing', side: 'neutral', layout: { x: 290, y: 20 } },
  { id: 'og_bottom', name: 'Open guard (dół)', group: 'open_guard', side: 'bottom', layout: { x: 40, y: 180 } },
  { id: 'cg_bottom', name: 'Closed guard (dół)', group: 'closed_guard', side: 'bottom', layout: { x: 40, y: 360 } },
  { id: 'half_bottom', name: 'Half guard (dół)', group: 'half_guard', side: 'bottom', layout: { x: 40, y: 540 } },
  { id: 'side_bottom', name: 'Side control (dół)', group: 'side_control', side: 'bottom', layout: { x: 40, y: 720 } },
  { id: 'mount_bottom', name: 'Mount (dół)', group: 'mount', side: 'bottom', layout: { x: 40, y: 900 } },
  { id: 'og_top', name: 'Open guard (góra)', group: 'open_guard', side: 'top', layout: { x: 540, y: 180 } },
  { id: 'cg_top', name: 'Closed guard (góra)', group: 'closed_guard', side: 'top', layout: { x: 540, y: 360 } },
  { id: 'side_top', name: 'Side control (góra)', group: 'side_control', side: 'top', layout: { x: 540, y: 540 } },
  { id: 'mount_top', name: 'Mount (góra)', group: 'mount', side: 'top', layout: { x: 540, y: 720 } },
  { id: 'back_top', name: 'Plecy (góra)', group: 'back', side: 'top', layout: { x: 540, y: 900 } },
];

const technique = (t: Omit<Technique, 'status'>): Technique => ({ ...t, status: 'seen' });

export const seedTechniques: Technique[] = [
  technique({ id: 'pull_guard', name: 'Pull guard', type: 'transition', from: 'standing', to: 'cg_bottom' }),
  technique({ id: 'double_leg', name: 'Double leg', type: 'takedown', from: 'standing', to: 'side_top' }),
  technique({ id: 'tripod', name: 'Tripod sweep', type: 'sweep', from: 'og_bottom', to: 'mount_top' }),
  technique({ id: 'close_guard', name: 'Zamknięcie gardy', type: 'transition', from: 'og_bottom', to: 'cg_bottom' }),
  technique({ id: 'toreando', name: 'Toreando pass', type: 'pass', from: 'og_top', to: 'side_top' }),
  technique({ id: 'hip_bump', name: 'Hip bump sweep', type: 'sweep', from: 'cg_bottom', to: 'mount_top' }),
  technique({ id: 'scissor', name: 'Scissor sweep', type: 'sweep', from: 'cg_bottom', to: 'mount_top' }),
  technique({ id: 'armbar_guard', name: 'Armbar z gardy', type: 'submission', from: 'cg_bottom', to: null }),
  technique({ id: 'kimura_guard', name: 'Kimura z gardy', type: 'submission', from: 'cg_bottom', to: null }),
  technique({ id: 'triangle', name: 'Triangle', type: 'submission', from: 'cg_bottom', to: null }),
  technique({ id: 'knee_cut', name: 'Otwarcie gardy + knee cut', type: 'pass', from: 'cg_top', to: 'side_top' }),
  technique({ id: 'old_school', name: 'Old school sweep', type: 'sweep', from: 'half_bottom', to: 'side_top' }),
  technique({ id: 'shrimp', name: 'Shrimp do gardy', type: 'escape', from: 'side_bottom', to: 'cg_bottom' }),
  technique({ id: 'upa', name: 'Upa (bridge & roll)', type: 'escape', from: 'mount_bottom', to: 'cg_top' }),
  technique({ id: 'elbow_knee', name: 'Elbow-knee escape', type: 'escape', from: 'mount_bottom', to: 'half_bottom' }),
  technique({ id: 'knee_slide', name: 'Knee slide do mount', type: 'transition', from: 'side_top', to: 'mount_top' }),
  technique({ id: 'kimura_side', name: 'Kimura z side', type: 'submission', from: 'side_top', to: null }),
  technique({ id: 'americana', name: 'Americana', type: 'submission', from: 'mount_top', to: null }),
  technique({ id: 'armbar_mount', name: 'Armbar z mount', type: 'submission', from: 'mount_top', to: null }),
  technique({ id: 'take_back', name: 'Wejście na plecy', type: 'transition', from: 'mount_top', to: 'back_top' }),
  technique({ id: 'rnc', name: 'RNC', type: 'submission', from: 'back_top', to: null }),
];
