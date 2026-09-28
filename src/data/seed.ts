import type { Drill, Position, Technique } from './types';

/**
 * Starter white-belt map loaded on first launch. Everything starts as "seen".
 * Layouts match tidyLayout(): neutral on top, bottom positions left, top positions right.
 */

export const seedPositions: Position[] = [
  { id: 'standing', name: 'Stójka', group: 'standing', side: 'neutral', layout: { x: 192, y: 0 } },
  { id: 'og_bottom', name: 'Open guard (dół)', group: 'open_guard', side: 'bottom', layout: { x: 0, y: 196 } },
  { id: 'cg_bottom', name: 'Closed guard (dół)', group: 'closed_guard', side: 'bottom', layout: { x: 0, y: 392 } },
  { id: 'half_bottom', name: 'Half guard (dół)', group: 'half_guard', side: 'bottom', layout: { x: 0, y: 588 } },
  { id: 'side_bottom', name: 'Side control (dół)', group: 'side_control', side: 'bottom', layout: { x: 0, y: 784 } },
  { id: 'mount_bottom', name: 'Mount (dół)', group: 'mount', side: 'bottom', layout: { x: 0, y: 980 } },
  { id: 'og_top', name: 'Open guard (góra)', group: 'open_guard', side: 'top', layout: { x: 384, y: 196 } },
  { id: 'cg_top', name: 'Closed guard (góra)', group: 'closed_guard', side: 'top', layout: { x: 384, y: 392 } },
  { id: 'side_top', name: 'Side control (góra)', group: 'side_control', side: 'top', layout: { x: 384, y: 784 } },
  { id: 'mount_top', name: 'Mount (góra)', group: 'mount', side: 'top', layout: { x: 384, y: 980 } },
  { id: 'back_top', name: 'Plecy (góra)', group: 'back', side: 'top', layout: { x: 384, y: 1176 } },
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

const drill = (d: Omit<Drill, 'techniqueIds'> & { techniqueIds?: string[] }): Drill => ({ techniqueIds: [], ...d });

/** Classic solo drills, linked to the starter positions and techniques they build. */
export const seedDrills: Drill[] = [
  drill({ id: 'drill_shrimp', name: 'Shrimp (krewetka)', dose: '3×10', positionIds: ['side_bottom', 'mount_bottom', 'half_bottom'], techniqueIds: ['shrimp', 'elbow_knee'] }),
  drill({ id: 'drill_bridge', name: 'Mostek (bridge)', dose: '3×10', positionIds: ['mount_bottom', 'side_bottom'], techniqueIds: ['upa'] }),
  drill({ id: 'drill_standup', name: 'Technical stand-up', dose: '3×10', positionIds: ['og_bottom', 'standing'] }),
  drill({ id: 'drill_granby', name: 'Granby roll', dose: '3×5', positionIds: ['og_bottom'] }),
  drill({ id: 'drill_back_roll', name: 'Przewrót w tył przez bark', dose: '3×5', positionIds: ['og_bottom'] }),
  drill({ id: 'drill_forward_roll', name: 'Przewrót w przód przez bark', dose: '3×5', positionIds: ['standing'] }),
  drill({ id: 'drill_sprawl', name: 'Sprawl', dose: '3×10', positionIds: ['standing'], techniqueIds: ['double_leg'] }),
  drill({ id: 'drill_penetration', name: 'Penetration step', dose: '3×10', positionIds: ['standing'], techniqueIds: ['double_leg'] }),
  drill({ id: 'drill_hip_up', name: 'Unoszenie bioder z gardy', dose: '3×10', positionIds: ['cg_bottom'], techniqueIds: ['hip_bump', 'armbar_guard', 'triangle'] }),
  drill({ id: 'drill_leg_circles', name: 'Kręcenie nogami (utrzymanie gardy)', dose: '3×30 s', positionIds: ['og_bottom'], techniqueIds: ['close_guard'] }),
  drill({ id: 'drill_hip_switch', name: 'Zmiana bioder (hip switch)', dose: '3×10', positionIds: ['side_top', 'mount_top'], techniqueIds: ['knee_slide'] }),
  drill({ id: 'drill_knee_cut', name: 'Knee cut solo', dose: '3×10', positionIds: ['cg_top', 'og_top'], techniqueIds: ['knee_cut'] }),
];
