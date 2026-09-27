// PROTOTYPE — throwaway mock data for the main-screen UI variants. In-memory only.

export type Status = 'seen' | 'drilling' | 'works';
export type TechniqueType = 'sweep' | 'submission' | 'escape' | 'pass' | 'transition';

export type Position = {
  id: string;
  name: string;
  side: 'top' | 'bottom' | 'neutral';
  // coordinates for the graph variant (canvas units)
  x: number;
  y: number;
};

export type Technique = {
  id: string;
  name: string;
  type: TechniqueType;
  from: string;
  to: string | null; // null = submission (fight ends)
  status: Status;
  video?: { url: string; label: string };
};

export type Spar = {
  partner: string;
  belt: string;
  result: 'win' | 'loss' | 'draw';
  where?: string; // position id where it went wrong / right
  note?: string;
};

export type Session = {
  id: string;
  date: string; // YYYY-MM-DD
  kind: 'Zajęcia' | 'Open mat';
  techniques: string[];
  spars: Spar[];
  note?: string;
};

export const STATUS_LABEL: Record<Status, string> = {
  seen: 'Widziałem',
  drilling: 'Ćwiczę',
  works: 'Działa w sparingu',
};

export const STATUS_COLOR: Record<Status, string> = {
  seen: '#9CA3AF',
  drilling: '#F59E0B',
  works: '#10B981',
};

export const TYPE_LABEL: Record<TechniqueType, string> = {
  submission: 'Kończenia',
  sweep: 'Sweepy',
  escape: 'Ucieczki',
  pass: 'Przejścia gardy',
  transition: 'Przejścia',
};

export const NEXT_STATUS: Record<Status, Status> = {
  seen: 'drilling',
  drilling: 'works',
  works: 'seen',
};

export const positions: Position[] = [
  { id: 'stand', name: 'Stójka', side: 'neutral', x: 275, y: 10 },
  { id: 'cg', name: 'Closed Guard (dół)', side: 'bottom', x: 40, y: 130 },
  { id: 'half', name: 'Half Guard (dół)', side: 'bottom', x: 40, y: 300 },
  { id: 'side_b', name: 'Side Control (dół)', side: 'bottom', x: 40, y: 470 },
  { id: 'mount_b', name: 'Mount (dół)', side: 'bottom', x: 40, y: 640 },
  { id: 'cg_top', name: 'Closed Guard (góra)', side: 'top', x: 510, y: 130 },
  { id: 'side', name: 'Side Control (góra)', side: 'top', x: 510, y: 300 },
  { id: 'mount', name: 'Mount (góra)', side: 'top', x: 510, y: 470 },
  { id: 'back', name: 'Plecy (góra)', side: 'top', x: 510, y: 640 },
];

const yt = (label: string) => ({ url: 'https://www.youtube.com/results?search_query=bjj+' + encodeURIComponent(label), label });

export const initialTechniques: Technique[] = [
  { id: 't1', name: 'Pull guard', type: 'transition', from: 'stand', to: 'cg', status: 'works' },
  { id: 't2', name: 'Hip Bump Sweep', type: 'sweep', from: 'cg', to: 'mount', status: 'works', video: yt('hip bump sweep') },
  { id: 't3', name: 'Scissor Sweep', type: 'sweep', from: 'cg', to: 'mount', status: 'drilling', video: yt('scissor sweep') },
  { id: 't4', name: 'Armbar z gardy', type: 'submission', from: 'cg', to: null, status: 'drilling', video: yt('armbar closed guard') },
  { id: 't5', name: 'Kimura z gardy', type: 'submission', from: 'cg', to: null, status: 'seen', video: yt('kimura closed guard') },
  { id: 't6', name: 'Triangle', type: 'submission', from: 'cg', to: null, status: 'seen', video: yt('triangle choke') },
  { id: 't7', name: 'Guillotine', type: 'submission', from: 'cg', to: null, status: 'seen' },
  { id: 't8', name: 'Americana', type: 'submission', from: 'mount', to: null, status: 'works', video: yt('americana mount') },
  { id: 't9', name: 'Armbar z mount', type: 'submission', from: 'mount', to: null, status: 'drilling', video: yt('armbar from mount') },
  { id: 't10', name: 'Upa (bridge & roll)', type: 'escape', from: 'mount_b', to: 'cg_top', status: 'works', video: yt('upa escape') },
  { id: 't11', name: 'Elbow-knee escape', type: 'escape', from: 'mount_b', to: 'half', status: 'drilling', video: yt('elbow knee escape') },
  { id: 't12', name: 'Shrimp do gardy', type: 'escape', from: 'side_b', to: 'cg', status: 'drilling', video: yt('side control escape shrimp') },
  { id: 't13', name: 'Old school sweep', type: 'sweep', from: 'half', to: 'side', status: 'seen', video: yt('old school sweep') },
  { id: 't14', name: 'Kimura z side', type: 'submission', from: 'side', to: null, status: 'seen' },
  { id: 't15', name: 'Knee slide do mount', type: 'transition', from: 'side', to: 'mount', status: 'works' },
  { id: 't16', name: 'Wejście na plecy', type: 'transition', from: 'mount', to: 'back', status: 'seen' },
  { id: 't17', name: 'RNC', type: 'submission', from: 'back', to: null, status: 'drilling', video: yt('rear naked choke') },
  { id: 't18', name: 'Otwarcie gardy + knee cut', type: 'pass', from: 'cg_top', to: 'side', status: 'drilling', video: yt('knee cut pass') },
];

export const initialSessions: Session[] = [
  {
    id: 's8', date: '2026-09-26', kind: 'Zajęcia', techniques: ['t3', 't4'],
    spars: [
      { partner: 'Kuba', belt: 'niebieski', result: 'loss', where: 'side_b', note: 'kimura z side, znowu' },
      { partner: 'Ola', belt: 'biały', result: 'win', where: 'mount', note: 'americana' },
    ],
    note: 'Scissor sweep wychodzi tylko jak mam dobry grip na kołnierzu.',
  },
  {
    id: 's7', date: '2026-09-24', kind: 'Zajęcia', techniques: ['t12', 't11'],
    spars: [{ partner: 'Marek', belt: 'purpurowy', result: 'loss', where: 'side_b' }],
  },
  {
    id: 's6', date: '2026-09-22', kind: 'Zajęcia', techniques: ['t18'],
    spars: [
      { partner: 'Ola', belt: 'biały', result: 'draw' },
      { partner: 'Tomek', belt: 'biały', result: 'loss', where: 'mount_b', note: 'nie umiem uciec z mount' },
    ],
  },
  {
    id: 's5', date: '2026-09-20', kind: 'Open mat', techniques: [],
    spars: [
      { partner: 'Kuba', belt: 'niebieski', result: 'loss', where: 'side_b' },
      { partner: 'Tomek', belt: 'biały', result: 'win', where: 'cg', note: 'hip bump → mount → americana' },
      { partner: 'Adam', belt: 'biały', result: 'loss', where: 'half' },
    ],
    note: 'Zmęczony po 3 rundach. Kondycja!',
  },
  { id: 's4', date: '2026-09-17', kind: 'Zajęcia', techniques: ['t17', 't16'], spars: [{ partner: 'Ola', belt: 'biały', result: 'win', where: 'back' }] },
  { id: 's3', date: '2026-09-15', kind: 'Zajęcia', techniques: ['t9', 't8'], spars: [] },
  { id: 's2', date: '2026-09-12', kind: 'Zajęcia', techniques: ['t10', 't2'], spars: [{ partner: 'Kuba', belt: 'niebieski', result: 'loss', where: 'side_b' }] },
  { id: 's1', date: '2026-09-10', kind: 'Zajęcia', techniques: ['t1', 't5', 't6'], spars: [] },
];

export const positionName = (id?: string) => positions.find((p) => p.id === id)?.name ?? '—';
