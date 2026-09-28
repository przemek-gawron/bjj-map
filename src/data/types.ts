export type PositionGroup =
  | 'standing'
  | 'closed_guard'
  | 'open_guard'
  | 'half_guard'
  | 'turtle'
  | 'knee_on_belly'
  | 'north_south'
  | 'side_control'
  | 'mount'
  | 'back';

export type Side = 'top' | 'bottom' | 'neutral';

export type Position = {
  id: string;
  name: string;
  group: PositionGroup;
  side: Side;
  /** Node position on the map canvas. */
  layout: { x: number; y: number };
  /** Own photo replacing the default illustration. */
  photoUri?: string;
  /** What the position is about: goals, key details, common mistakes. */
  notes?: string;
};

export type TechniqueType = 'submission' | 'sweep' | 'escape' | 'pass' | 'takedown' | 'transition';

export type Status = 'seen' | 'drilling' | 'works';

export type Technique = {
  id: string;
  name: string;
  type: TechniqueType;
  from: string;
  /** Position the technique ends in; null for submissions. */
  to: string | null;
  status: Status;
  videoUrl?: string;
  notes?: string;
};

/**
 * Solo exercise (shrimp, bridge, technical stand-up…) that builds the movement behind
 * positions and techniques. Linked to any number of both; shown on the map with them.
 */
export type Drill = {
  id: string;
  name: string;
  positionIds: string[];
  techniqueIds: string[];
  /** Free-form volume, e.g. "3×10" or "2 min". */
  dose?: string;
  videoUrl?: string;
  notes?: string;
};

/**
 * One training day. The single source of truth for "when was X trained" —
 * counts, last-trained dates and future stats/reminders are derived from sessions.
 */
export type Session = {
  id: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  techniqueIds: string[];
  drillIds?: string[];
  note?: string;
  /** Length of the training in minutes; unset counts as DEFAULT_SESSION_MINUTES. */
  durationMin?: number;
};

export type WeeklyPlan = {
  /** Monday of the planned week, YYYY-MM-DD. */
  weekStart: string;
  techniqueIds: string[];
  drillIds?: string[];
};
