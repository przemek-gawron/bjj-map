import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { en } from './en';
import { type Dict, pl } from './pl';

export type Language = 'pl' | 'en';
export type LanguageSetting = Language | 'system';

const DICTS: Record<Language, Dict> = { pl, en };

/** App preferences, kept apart from the training data so "delete all data" leaves them alone. */
export const useSettings = create<{ language: LanguageSetting; setLanguage: (l: LanguageSetting) => void }>()(
  persist((set) => ({ language: 'system', setLanguage: (language) => set({ language }) }), {
    name: 'bjj-map-settings',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ language }) => ({ language }),
  })
);

/** Polish for Polish devices, English for everything else. */
function resolve(setting: LanguageSetting): Language {
  if (setting !== 'system') return setting;
  return getLocales()[0]?.languageCode === 'pl' ? 'pl' : 'en';
}

export function useLanguage(): Language {
  return resolve(useSettings((s) => s.language));
}

/** Strings for the current language; re-renders the caller when the language changes. */
export function useT(): Dict {
  return DICTS[useLanguage()];
}

/** Non-hook access for helpers (dates, alerts). Callers render through useT, so they re-render on change. */
export function currentLanguage(): Language {
  return resolve(useSettings.getState().language);
}

export function currentT(): Dict {
  return DICTS[currentLanguage()];
}
