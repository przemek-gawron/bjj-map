// PROTOTYPE — props shared by every main-screen variant.
import type { Session, Status, Technique } from './data';

export type VariantProps = {
  techniques: Technique[];
  sessions: Session[];
  setStatus: (id: string, status: Status) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
};
