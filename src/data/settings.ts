import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LanguageSetting = 'pl' | 'en' | 'system';

type Settings = {
  language: LanguageSetting;
  setLanguage: (language: LanguageSetting) => void;
};

/** App preferences, kept apart from the training data so "delete all data" leaves them alone. */
export const useSettings = create<Settings>()(
  persist((set) => ({ language: 'system', setLanguage: (language) => set({ language }) }), {
    name: 'bjj-map-settings',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ language }) => ({ language }),
  })
);
