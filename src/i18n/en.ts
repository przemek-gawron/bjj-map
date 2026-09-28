import type { Dict } from './pl';

export const en: Dict = {
  common: {
    back: 'Back',
    cancel: 'Cancel',
    delete: 'Delete',
  },
  tabs: {
    map: 'Map',
    techniques: 'Techniques',
    plan: 'Plan',
    journal: 'Journal',
  },
  settings: {
    title: 'Settings',
    about: 'About',
    aboutText:
      'Your BJJ map: positions, the techniques between them, and what already works for you when rolling. Plan what to drill this week and log your trainings in the journal.',
    version: (v: string) => `Version ${v}`,
    language: 'Language',
    languageSystem: 'System',
    account: 'Account',
    logout: 'Log out',
    noAccount: 'There are no accounts yet. Your data is stored only on this device.',
    data: 'Data',
    deleteAll: 'Delete all data',
    deleteAllTitle: 'Delete all data?',
    deleteAllMessage:
      'Your trainings, plan, notes, photos and own techniques will be removed, and the map goes back to its starting state. This cannot be undone.',
    deleteAllConfirm: 'Delete everything',
  },
};
