import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LanguageSetting = 'pl' | 'en' | 'system';
export type AppearanceSetting = 'dark' | 'light' | 'system';

type Settings = {
  language: LanguageSetting;
  setLanguage: (language: LanguageSetting) => void;
  appearance: AppearanceSetting;
  setAppearance: (appearance: AppearanceSetting) => void;
};

/** App preferences, kept apart from the training data so "delete all data" leaves them alone. */
export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      language: 'system',
      setLanguage: (language) => set({ language }),
      // the app is designed dark-first
      appearance: 'dark',
      setAppearance: (appearance) => set({ appearance }),
    }),
    {
      name: 'bjj-map-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ language, appearance }) => ({ language, appearance }),
    }
  )
);
