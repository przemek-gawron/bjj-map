import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { toDateKey, weekStartOf } from './dates';
import { seedPositions, seedTechniques } from './seed';
import type { Position, Session, Status, Technique, WeeklyPlan } from './types';

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
  updateSession: (id: string, patch: Partial<Omit<Session, 'id'>>) => void;
  removeSession: (id: string) => void;

  movePosition: (id: string, layout: Position['layout']) => void;
  setPositionPhoto: (id: string, photoUri: string | undefined) => void;

  togglePlanned: (techniqueId: string) => void;
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
      updateSession: (id, patch) =>
        set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
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
    }),
    {
      name: 'bjj-map',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ positions, techniques, sessions, plan }) => ({ positions, techniques, sessions, plan }),
    }
  )
);
