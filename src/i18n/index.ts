import { getLocales } from 'expo-localization';

import { en } from './en';
import { type Dict, pl } from './pl';

import { type LanguageSetting, useSettings } from '@/data/settings';

export type Language = 'pl' | 'en';

const DICTS: Record<Language, Dict> = { pl, en };

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
