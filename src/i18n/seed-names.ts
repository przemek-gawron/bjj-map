import type { Language } from '.';

import { seedPositions, seedTechniques } from '@/data/seed';

const en: Record<string, string> = {
  // positions
  standing: 'Standing',
  og_bottom: 'Open guard (bottom)',
  cg_bottom: 'Closed guard (bottom)',
  half_bottom: 'Half guard (bottom)',
  side_bottom: 'Side control (bottom)',
  mount_bottom: 'Mount (bottom)',
  og_top: 'Open guard (top)',
  cg_top: 'Closed guard (top)',
  side_top: 'Side control (top)',
  mount_top: 'Mount (top)',
  back_top: 'Back control (top)',
  // techniques
  pull_guard: 'Pull guard',
  double_leg: 'Double leg',
  tripod: 'Tripod sweep',
  close_guard: 'Closing the guard',
  toreando: 'Toreando pass',
  hip_bump: 'Hip bump sweep',
  scissor: 'Scissor sweep',
  armbar_guard: 'Armbar from guard',
  kimura_guard: 'Kimura from guard',
  triangle: 'Triangle',
  knee_cut: 'Guard break + knee cut',
  old_school: 'Old school sweep',
  shrimp: 'Shrimp to guard',
  upa: 'Upa (bridge & roll)',
  elbow_knee: 'Elbow-knee escape',
  knee_slide: 'Knee slide to mount',
  kimura_side: 'Kimura from side control',
  americana: 'Americana',
  armbar_mount: 'Armbar from mount',
  take_back: 'Taking the back',
  rnc: 'RNC',
};

// the seed itself is written in Polish
const pl: Record<string, string> = Object.fromEntries([...seedPositions, ...seedTechniques].map((x) => [x.id, x.name]));

const NAMES: Record<Language, Record<string, string>> = { pl, en };

/**
 * Starter positions and techniques in `language`. Only names still matching a seed
 * name in either language are switched, so anything the user renamed stays as is.
 */
export function localizeSeedNames<T extends { id: string; name: string }>(items: T[], language: Language): T[] {
  return items.map((item) => {
    const target = NAMES[language][item.id];
    if (!target || item.name === target) return item;
    return item.name === pl[item.id] || item.name === en[item.id] ? { ...item, name: target } : item;
  });
}
