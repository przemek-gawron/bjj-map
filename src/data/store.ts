import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { toDateKey, weekStartOf } from './dates';
import { seedPositions, seedTechniques } from './seed';
import type { Position, Session, Status, Technique, WeeklyPlan } from './types';

import { currentLanguage, type Language } from '@/i18n';
import { localizeSeedNames } from '@/i18n/seed-names';

type State = {
  positions: Position[];
  techniques: Technique[];
  sessions: Session[];
  plan: WeeklyPlan;
};

type Actions = {
  addTechnique: (t: Omit<Technique, 'id' | 'status'> & { status?: Status }) => string;
  updateTechnique: (id: string, patch: Partial<Omit<Technique, 'id'>>) => void;
  removeTechnique: (id: string) => void;
  setStatus: (id: string, status: Status) => void;

  /** Marks techniques as trained on `date`, merging into that day's session. */
  logTraining: (date: string, techniqueIds: string[], note?: string) => void;
  unlogTraining: (date: string, techniqueId: string) => void;
  /**
   * Creates or edits a session. Keeps one session per date: saving onto a date that
   * already has another session merges into it (techniques unioned, notes joined).
   */
  saveSession: (session: Omit<Session, 'id'> & { id?: string }) => void;
  removeSession: (id: string) => void;

  movePosition: (id: string, layout: Position['layout']) => void;
  setPositionPhoto: (id: string, photoUri: string | undefined) => void;

  togglePlanned: (techniqueId: string) => void;
  /** Replaces this week's plan (e.g. carrying over last week's). */
  setPlan: (techniqueIds: string[]) => void;

  /** Back to the starting positions and techniques; sessions, plan and photos are dropped. */
  resetAll: () => void;
  /** Switches the starter positions' and techniques' names to `language` (user-renamed ones stay). */
  localizeSeed: (language: Language) => void;
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const emptyPlan = (): WeeklyPlan => ({ weekStart: weekStartOf(toDateKey()), techniqueIds: [] });

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      positions: seedPositions,
      techniques: seedTechniques,
      sessions: [],
      plan: emptyPlan(),

      addTechnique: ({ status = 'seen', ...t }) => {
        const id = newId();
        set((s) => ({ techniques: [...s.techniques, { ...t, id, status }] }));
        return id;
      },
      updateTechnique: (id, patch) =>
        set((s) => ({ techniques: s.techniques.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTechnique: (id) =>
        set((s) => ({
          techniques: s.techniques.filter((t) => t.id !== id),
          sessions: s.sessions.map((x) => ({ ...x, techniqueIds: x.techniqueIds.filter((t) => t !== id) })),
          plan: { ...s.plan, techniqueIds: s.plan.techniqueIds.filter((t) => t !== id) },
        })),
      setStatus: (id, status) => get().updateTechnique(id, { status }),

      logTraining: (date, techniqueIds, note) =>
        set((s) => {
          const existing = s.sessions.find((x) => x.date === date);
          if (!existing) {
            const session: Session = { id: newId(), date, techniqueIds: [...new Set(techniqueIds)], note };
            return { sessions: [...s.sessions, session].sort((a, b) => b.date.localeCompare(a.date)) };
          }
          return {
            sessions: s.sessions.map((x) =>
              x.id === existing.id
                ? { ...x, techniqueIds: [...new Set([...x.techniqueIds, ...techniqueIds])], note: note ?? x.note }
                : x
            ),
          };
        }),
      unlogTraining: (date, techniqueId) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.date === date ? { ...x, techniqueIds: x.techniqueIds.filter((t) => t !== techniqueId) } : x
          ),
        })),
      saveSession: ({ id, date, techniqueIds, note }) =>
        set((s) => {
          const rest = id ? s.sessions.filter((x) => x.id !== id) : s.sessions;
          const other = rest.find((x) => x.date === date);
          const saved: Session = other
            ? {
                ...other,
                techniqueIds: [...new Set([...other.techniqueIds, ...techniqueIds])],
                note: [other.note, note].filter(Boolean).join('\n\n') || undefined,
              }
            : { id: id ?? newId(), date, techniqueIds: [...new Set(techniqueIds)], note };
          return {
            sessions: [...rest.filter((x) => x !== other), saved].sort((a, b) => b.date.localeCompare(a.date)),
          };
        }),
      removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      movePosition: (id, layout) =>
        set((s) => ({ positions: s.positions.map((p) => (p.id === id ? { ...p, layout } : p)) })),
      setPositionPhoto: (id, photoUri) =>
        set((s) => ({ positions: s.positions.map((p) => (p.id === id ? { ...p, photoUri } : p)) })),

      togglePlanned: (techniqueId) =>
        set((s) => {
          // a plan from a past week starts fresh
          const plan = s.plan.weekStart === weekStartOf(toDateKey()) ? s.plan : emptyPlan();
          const has = plan.techniqueIds.includes(techniqueId);
          return {
            plan: {
              ...plan,
              techniqueIds: has ? plan.techniqueIds.filter((t) => t !== techniqueId) : [...plan.techniqueIds, techniqueId],
            },
          };
        }),
      setPlan: (techniqueIds) => set({ plan: { weekStart: weekStartOf(toDateKey()), techniqueIds } }),

      resetAll: () =>
        set({
          positions: localizeSeedNames(seedPositions, currentLanguage()),
          techniques: localizeSeedNames(seedTechniques, currentLanguage()),
          sessions: [],
          plan: emptyPlan(),
        }),
      localizeSeed: (language) =>
        set((s) => ({ positions: localizeSeedNames(s.positions, language), techniques: localizeSeedNames(s.techniques, language) })),
    }),
    {
      name: 'bjj-map',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const state = persisted as State;
        if (version < 2) {
          // v2: open guard positions + techniques, and a re-spaced map layout for the seed positions
          // (safe: v1 had no map screen, so no layout was ever user-edited)
          const seedById = new Map(seedPositions.map((p) => [p.id, p]));
          state.positions = [
            ...state.positions.map((p) => ({ ...p, layout: seedById.get(p.id)?.layout ?? p.layout })),
            ...seedPositions.filter((p) => !state.positions.some((x) => x.id === p.id)),
          ];
          state.techniques = [
            ...state.techniques,
            ...seedTechniques.filter((t) => !state.techniques.some((x) => x.id === t.id)),
          ];
        }
        if (version < 3) {
          // v3: v2 appended the open guard positions at the end; restore the seed order
          // (bottom column, then top column) so lists and pickers read top-to-bottom
          const rank = (id: string) => {
            const i = seedPositions.findIndex((p) => p.id === id);
            return i === -1 ? seedPositions.length : i;
          };
          state.positions = [...state.positions].sort((a, b) => rank(a.id) - rank(b.id));
        }
        return state;
      },
      partialize: ({ positions, techniques, sessions, plan }) => ({ positions, techniques, sessions, plan }),
    }
  )
);
