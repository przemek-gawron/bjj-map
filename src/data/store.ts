import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { toDateKey, weekStartOf } from './dates';
import { seedDrills, seedPositions, seedTechniques } from './seed';
import type { Drill, Position, Session, Status, Technique, WeeklyPlan } from './types';

import { currentLanguage, type Language } from '@/i18n';
import { localizeSeedNames } from '@/i18n/seed-names';

type State = {
  positions: Position[];
  techniques: Technique[];
  drills: Drill[];
  sessions: Session[];
  plan: WeeklyPlan;
};

type Actions = {
  addTechnique: (t: Omit<Technique, 'id' | 'status'> & { status?: Status }) => string;
  updateTechnique: (id: string, patch: Partial<Omit<Technique, 'id'>>) => void;
  removeTechnique: (id: string) => void;
  setStatus: (id: string, status: Status) => void;

  addDrill: (d: Omit<Drill, 'id'>) => string;
  updateDrill: (id: string, patch: Partial<Omit<Drill, 'id'>>) => void;
  /** Also drops the drill from sessions and the plan. */
  removeDrill: (id: string) => void;

  /** Marks techniques as trained on `date`, merging into that day's session. */
  logTraining: (date: string, techniqueIds: string[], note?: string) => void;
  unlogTraining: (date: string, techniqueId: string) => void;
  logDrill: (date: string, drillId: string) => void;
  unlogDrill: (date: string, drillId: string) => void;
  /**
   * Creates or edits a session. Keeps one session per date: saving onto a date that
   * already has another session merges into it (techniques unioned, notes joined).
   */
  saveSession: (session: Omit<Session, 'id'> & { id?: string }) => void;
  removeSession: (id: string) => void;

  movePosition: (id: string, layout: Position['layout']) => void;
  /** Moves several positions at once, e.g. to a tidy layout. */
  setLayouts: (layouts: Record<string, Position['layout']>) => void;
  setPositionPhoto: (id: string, photoUri: string | undefined) => void;
  updatePosition: (id: string, patch: Partial<Pick<Position, 'name' | 'notes'>>) => void;

  togglePlanned: (techniqueId: string) => void;
  togglePlannedDrill: (drillId: string) => void;
  /** Replaces this week's plan (e.g. carrying over last week's). */
  setPlan: (techniqueIds: string[], drillIds?: string[]) => void;

  /** Back to the starting positions, techniques and drills; sessions, plan and photos are dropped. */
  resetAll: () => void;
  /** Switches the starter positions', techniques' and drills' names to `language` (user-renamed ones stay). */
  localizeSeed: (language: Language) => void;
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** A session left with no techniques, drills or note isn't a training any more. */
const dropEmpty = (sessions: Session[]) => sessions.filter((x) => x.techniqueIds.length > 0 || x.drillIds?.length || x.note);

const emptyPlan = (): WeeklyPlan => ({ weekStart: weekStartOf(toDateKey()), techniqueIds: [], drillIds: [] });

/** This week's plan; one from a past week starts fresh. */
const currentPlan = (plan: WeeklyPlan) => (plan.weekStart === weekStartOf(toDateKey()) ? plan : emptyPlan());

const toggle = (ids: string[] | undefined, id: string) => (ids?.includes(id) ? ids.filter((x) => x !== id) : [...(ids ?? []), id]);

/** Seed drills whose linked positions and techniques exist; links to deleted ones are dropped. */
const availableSeedDrills = (positions: Position[], techniques: Technique[]) =>
  seedDrills.map((d) => ({
    ...d,
    positionIds: d.positionIds.filter((id) => positions.some((p) => p.id === id)),
    techniqueIds: d.techniqueIds.filter((id) => techniques.some((t) => t.id === id)),
  }));

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      positions: seedPositions,
      techniques: seedTechniques,
      drills: seedDrills,
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
          drills: s.drills.map((d) => ({ ...d, techniqueIds: d.techniqueIds.filter((t) => t !== id) })),
          sessions: dropEmpty(s.sessions.map((x) => ({ ...x, techniqueIds: x.techniqueIds.filter((t) => t !== id) }))),
          plan: { ...s.plan, techniqueIds: s.plan.techniqueIds.filter((t) => t !== id) },
        })),
      setStatus: (id, status) => get().updateTechnique(id, { status }),

      addDrill: (d) => {
        const id = newId();
        set((s) => ({ drills: [...s.drills, { ...d, id }] }));
        return id;
      },
      updateDrill: (id, patch) => set((s) => ({ drills: s.drills.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      removeDrill: (id) =>
        set((s) => ({
          drills: s.drills.filter((d) => d.id !== id),
          sessions: dropEmpty(s.sessions.map((x) => (x.drillIds?.includes(id) ? { ...x, drillIds: x.drillIds.filter((d) => d !== id) } : x))),
          plan: { ...s.plan, drillIds: s.plan.drillIds?.filter((d) => d !== id) },
        })),

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
          sessions: dropEmpty(
            s.sessions.map((x) => (x.date === date ? { ...x, techniqueIds: x.techniqueIds.filter((t) => t !== techniqueId) } : x))
          ),
        })),
      logDrill: (date, drillId) =>
        set((s) => {
          const existing = s.sessions.find((x) => x.date === date);
          if (!existing) {
            const session: Session = { id: newId(), date, techniqueIds: [], drillIds: [drillId] };
            return { sessions: [...s.sessions, session].sort((a, b) => b.date.localeCompare(a.date)) };
          }
          return {
            sessions: s.sessions.map((x) =>
              x.id === existing.id ? { ...x, drillIds: [...new Set([...(x.drillIds ?? []), drillId])] } : x
            ),
          };
        }),
      unlogDrill: (date, drillId) =>
        set((s) => ({
          sessions: dropEmpty(
            s.sessions.map((x) => (x.date === date ? { ...x, drillIds: x.drillIds?.filter((d) => d !== drillId) } : x))
          ),
        })),
      saveSession: ({ id, date, techniqueIds, drillIds = [], note, durationMin }) =>
        set((s) => {
          const rest = id ? s.sessions.filter((x) => x.id !== id) : s.sessions;
          const other = rest.find((x) => x.date === date);
          const saved: Session = other
            ? {
                ...other,
                techniqueIds: [...new Set([...other.techniqueIds, ...techniqueIds])],
                drillIds: [...new Set([...(other.drillIds ?? []), ...drillIds])],
                note: [other.note, note].filter(Boolean).join('\n\n') || undefined,
                durationMin: durationMin ?? other.durationMin,
              }
            : { id: id ?? newId(), date, techniqueIds: [...new Set(techniqueIds)], drillIds: [...new Set(drillIds)], note, durationMin };
          return {
            sessions: [...rest.filter((x) => x !== other), saved].sort((a, b) => b.date.localeCompare(a.date)),
          };
        }),
      removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      movePosition: (id, layout) =>
        set((s) => ({ positions: s.positions.map((p) => (p.id === id ? { ...p, layout } : p)) })),
      setLayouts: (layouts) =>
        set((s) => ({ positions: s.positions.map((p) => (layouts[p.id] ? { ...p, layout: layouts[p.id] } : p)) })),
      updatePosition: (id, patch) => set((s) => ({ positions: s.positions.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      setPositionPhoto: (id, photoUri) =>
        set((s) => ({ positions: s.positions.map((p) => (p.id === id ? { ...p, photoUri } : p)) })),

      togglePlanned: (techniqueId) =>
        set((s) => {
          const plan = currentPlan(s.plan);
          return { plan: { ...plan, techniqueIds: toggle(plan.techniqueIds, techniqueId) } };
        }),
      togglePlannedDrill: (drillId) =>
        set((s) => {
          const plan = currentPlan(s.plan);
          return { plan: { ...plan, drillIds: toggle(plan.drillIds, drillId) } };
        }),
      setPlan: (techniqueIds, drillIds = []) => set({ plan: { weekStart: weekStartOf(toDateKey()), techniqueIds, drillIds } }),

      resetAll: () =>
        set({
          positions: localizeSeedNames(seedPositions, currentLanguage()),
          techniques: localizeSeedNames(seedTechniques, currentLanguage()),
          drills: localizeSeedNames(seedDrills, currentLanguage()),
          sessions: [],
          plan: emptyPlan(),
        }),
      localizeSeed: (language) =>
        set((s) => ({
          positions: localizeSeedNames(s.positions, language),
          techniques: localizeSeedNames(s.techniques, language),
          drills: localizeSeedNames(s.drills, language),
        })),
    }),
    {
      name: 'bjj-map',
      version: 5,
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
        if (version < 4) {
          // v4: unticking a day's last technique used to leave an empty session behind
          state.sessions = dropEmpty(state.sessions);
        }
        if (version < 5) {
          // v5: drills, starting with the classic solo ones
          state.drills = availableSeedDrills(state.positions, state.techniques);
        }
        return state;
      },
      partialize: ({ positions, techniques, drills, sessions, plan }) => ({ positions, techniques, drills, sessions, plan }),
    }
  )
);
