export type PositionGroup =
  | 'standing'
  | 'closed_guard'
  | 'open_guard'
  | 'half_guard'
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
 * One training day. The single source of truth for "when was X trained" —
 * counts, last-trained dates and future stats/reminders are derived from sessions.
 */
export type Session = {
  id: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  techniqueIds: string[];
  note?: string;
};

export type WeeklyPlan = {
  /** Monday of the planned week, YYYY-MM-DD. */
  weekStart: string;
  techniqueIds: string[];
};
