import type { Drill, Position, PositionGroup, Side, Technique, TechniqueType } from './types';

/**
 * Sample library loaded from Settings: fundamentals a white or blue belt actually trains,
 * with descriptions. Adds what's missing next to the starter map (seed.ts) and fills in
 * descriptions of starter items that don't have one yet.
 */

export type Text = { pl: string; en: string };

type LibraryPosition = Pick<Position, 'id' | 'group' | 'side'> & { name: Text; notes: Text };
type LibraryTechnique = Pick<Technique, 'id' | 'type' | 'from' | 'to'> & { name: Text; notes: Text };
type LibraryDrill = Pick<Drill, 'id' | 'positionIds' | 'techniqueIds' | 'dose'> & { name: Text; notes: Text };

const position = (id: string, group: PositionGroup, side: Side, name: Text, notes: Text): LibraryPosition => ({
  id,
  group,
  side,
  name,
  notes,
});
const technique = (id: string, type: TechniqueType, from: string, to: string | null, name: Text, notes: Text): LibraryTechnique => ({
  id,
  type,
  from,
  to,
  name,
  notes,
});
const drill = (id: string, positionIds: string[], techniqueIds: string[], dose: string, name: Text, notes: Text): LibraryDrill => ({
  id,
  positionIds,
  techniqueIds,
  dose,
  name,
  notes,
});
/** Same name in both languages (most BJJ terms are used in English). */
const same = (name: string): Text => ({ pl: name, en: name });

/** Order of positions after loading: bottom positions first, then top ones, like the starter map. */
export const LIBRARY_POSITION_ORDER = [
  'standing',
  'og_bottom',
  'butterfly_bottom',
  'dlr_bottom',
  'spider_bottom',
  'cg_bottom',
  'half_bottom',
  'turtle_bottom',
  'side_bottom',
  'kob_bottom',
  'ns_bottom',
  'mount_bottom',
  'back_bottom',
  'og_top',
  'cg_top',
  'half_top',
  'turtle_top',
  'side_top',
  'kob_top',
  'ns_top',
  'mount_top',
  'back_top',
];

export const libraryPositions: LibraryPosition[] = [
  position(
    'butterfly_bottom',
    'open_guard',
    'bottom',
    { pl: 'Butterfly guard (dół)', en: 'Butterfly guard (bottom)' },
    {
      pl: 'Siedzisz, stopy jak haki pod udami rywala. Underhook i głowa wyżej niż jego — wtedy podrywasz go hakiem na bok.',
      en: 'You sit with your feet hooked inside their thighs. Underhook and head higher than theirs — then you elevate them with a hook.',
    }
  ),
  position(
    'dlr_bottom',
    'open_guard',
    'bottom',
    { pl: 'De La Riva (dół)', en: 'De La Riva guard (bottom)' },
    {
      pl: 'Noga owinięta od zewnątrz wokół przedniej nogi rywala, uchwyt za kostkę i rękaw. Świetna przeciw stojącemu — otwiera sweepy i wejście na plecy.',
      en: 'Your leg hooks around the outside of their lead leg, with ankle and sleeve grips. Great against a standing opponent — opens sweeps and back takes.',
    }
  ),
  position(
    'spider_bottom',
    'open_guard',
    'bottom',
    { pl: 'Spider / lasso (dół)', en: 'Spider / lasso guard (bottom)' },
    {
      pl: 'Stopy w bicepsach (spider) albo noga owinięta wokół ręki (lasso), uchwyty za rękawy. Kontrolujesz dystans i ręce rywala — idealna do triangle i omoplaty.',
      en: 'Feet on the biceps (spider) or a leg wrapped around the arm (lasso), sleeve grips. You control distance and their arms — ideal for triangles and omoplatas.',
    }
  ),
  position(
    'half_top',
    'half_guard',
    'top',
    { pl: 'Half guard (góra)', en: 'Half guard (top)' },
    {
      pl: 'Jedna Twoja noga jest uwięziona. Crossface i underhook, klatka nisko — nie oddawaj rywalowi underhooka. Uwolnij nogę do mount albo side control.',
      en: 'One of your legs is trapped. Crossface, underhook, chest heavy — deny their underhook. Free the leg into mount or side control.',
    }
  ),
  position(
    'turtle_bottom',
    'turtle',
    'bottom',
    { pl: 'Turtle (dół)', en: 'Turtle (bottom)' },
    {
      pl: 'Na kolanach i łokciach, łokcie przy kolanach, broda schowana. Pozycja przejściowa — nie czekaj w niej: wstań, zrób granby albo sit-out.',
      en: 'On knees and elbows, elbows tight to knees, chin tucked. A transition, not a place to wait: stand up, granby or sit out.',
    }
  ),
  position(
    'turtle_top',
    'turtle',
    'top',
    { pl: 'Turtle (góra)', en: 'Turtle (top)' },
    {
      pl: 'Rywal jest na czworakach. Kontroluj biodra i bliższą rękę, szukaj seatbelta i haków albo clock choke.',
      en: "They're on all fours. Control the hips and near arm, look for the seatbelt and hooks, or the clock choke.",
    }
  ),
  position(
    'kob_bottom',
    'knee_on_belly',
    'bottom',
    { pl: 'Knee on belly (dół)', en: 'Knee on belly (bottom)' },
    {
      pl: 'Rywal wbija kolano w brzuch. Rama na kolanie i biodrze, shrimp od kolana i nogi z powrotem do gardy. Nie pchaj prostymi rękami w klatkę.',
      en: "They drive a knee into your belly. Frame on the knee and hip, shrimp away and get your legs back in. Don't push their chest with straight arms.",
    }
  ),
  position(
    'kob_top',
    'knee_on_belly',
    'top',
    { pl: 'Knee on belly (góra)', en: 'Knee on belly (top)' },
    {
      pl: 'Kolano na brzuchu, druga noga szeroko, uchwyt za kołnierz i biodro. Mobilna i bardzo męcząca dla rywala — gdy odpycha, wystawia ręce.',
      en: 'Knee on the belly, other leg wide, grips on collar and hip. Mobile and exhausting for them — when they push, they give up an arm.',
    }
  ),
  position(
    'ns_bottom',
    'north_south',
    'bottom',
    { pl: 'North-south (dół)', en: 'North-south (bottom)' },
    {
      pl: 'Rywal leży na Tobie głową w stronę Twoich nóg. Chroń szyję, rama na biodrach, obróć się na bok i wkładaj kolana do gardy.',
      en: 'They lie on you, head toward your legs. Protect your neck, frame on the hips, turn to your side and bring your knees back in.',
    }
  ),
  position(
    'ns_top',
    'north_south',
    'top',
    { pl: 'North-south (góra)', en: 'North-south (top)' },
    {
      pl: 'Klatka na klatce rywala, głowy w przeciwnych kierunkach, biodra nisko. Świetna do duszenia north-south i kimury.',
      en: 'Chest on their chest, heads in opposite directions, hips low. Great for the north-south choke and kimura.',
    }
  ),
  position(
    'back_bottom',
    'back',
    'bottom',
    { pl: 'Plecy (dół)', en: 'Back control (bottom)' },
    {
      pl: 'Rywal ma haki i seatbelt. Najpierw broń szyję (obie ręce na ręce duszącej), potem zsuń się na matę na stronę bez haka i obróć się do rywala.',
      en: 'They have hooks and a seatbelt. Defend the neck first (both hands on the choking arm), then slide to the mat on the side without a hook and turn in.',
    }
  ),
];

export const libraryTechniques: LibraryTechnique[] = [
  // standing
  technique('single_leg', 'takedown', 'standing', 'half_top', same('Single leg'), {
    pl: 'Złap jedną nogę wysoko przy biodrze, głowa przy klatce rywala, wyprowadź ją w bok i podetnij. Zwykle lądujesz w half guardzie.',
    en: 'Grab one leg high by the hip, head against their chest, run it to the side and trip. You usually land in half guard.',
  }),
  technique('osoto_gari', 'takedown', 'standing', 'side_top', same('O-soto-gari'), {
    pl: 'Wejdź krokiem obok rywala, złam jego balans do tyłu i zmieć nogę od zewnątrz. Klasyk judo.',
    en: 'Step beside them, break their balance backwards and reap the leg from the outside. A judo classic.',
  }),
  technique('ankle_pick', 'takedown', 'standing', 'og_top', same('Ankle pick'), {
    pl: 'Ściągnij głowę rywala w dół, żeby przeniósł ciężar do przodu, i złap jego kostkę — przewraca się na plecy.',
    en: 'Snap their head down so they step forward, then pick the ankle — they fall on their back.',
  }),
  technique('snap_down', 'transition', 'standing', 'turtle_top', same('Snap down'), {
    pl: 'Szarpnięciem za kark ściągnij rywala na kolana i obejdź go za plecy.',
    en: 'Snap their head down to the mat and spin behind them.',
  }),
  technique('guillotine_standing', 'submission', 'standing', null, { pl: 'Gilotyna ze stójki', en: 'Standing guillotine' }, {
    pl: 'Gdy rywal wchodzi nisko głową, owiń szyję, zapnij dłonie i ciągnij w górę przedramieniem pod brodą.',
    en: 'When they shoot with their head low, wrap the neck, clasp your hands and pull up with the forearm under the chin.',
  }),
  technique('arm_drag_standing', 'transition', 'standing', 'back_top', { pl: 'Arm drag na plecy', en: 'Arm drag to the back' }, {
    pl: 'Pociągnij rękę rywala przez swoje ciało, wejdź za jego plecy i zapnij ręce wokół pasa.',
    en: 'Drag their arm across your body, step behind them and lock your hands around the waist.',
  }),

  // open guard (bottom)
  technique('og_standup', 'escape', 'og_bottom', 'standing', same('Technical stand-up'), {
    pl: 'Gdy rywal stoi daleko: ręka podparta za sobą, druga osłania twarz, przeciągnij nogę pod sobą i wstań w postawie.',
    en: 'When they stand at a distance: post a hand behind you, guard your face, swing your leg under you and stand in your stance.',
  }),
  technique('og_to_butterfly', 'transition', 'og_bottom', 'butterfly_bottom', { pl: 'Wejście w butterfly', en: 'Enter butterfly guard' }, {
    pl: 'Gdy rywal klęczy blisko, usiądź i wsuń stopy jako haki pod jego uda.',
    en: 'When they kneel close, sit up and slide your feet in as hooks under their thighs.',
  }),
  technique('og_to_dlr', 'transition', 'og_bottom', 'dlr_bottom', { pl: 'Wejście w De La Riva', en: 'Enter De La Riva' }, {
    pl: 'Gdy rywal wstaje, owiń nogę wokół jego przedniej nogi od zewnątrz i złap kostkę.',
    en: 'As they stand, hook your leg around the outside of their lead leg and grab the ankle.',
  }),
  technique('og_to_spider', 'transition', 'og_bottom', 'spider_bottom', { pl: 'Wejście w spider', en: 'Enter spider guard' }, {
    pl: 'Złap oba rękawy i wstaw stopy w bicepsy rywala, zanim zacznie kontrolować Twoje nogi.',
    en: 'Grab both sleeves and put your feet on their biceps before they control your legs.',
  }),

  // butterfly
  technique('butterfly_sweep', 'sweep', 'butterfly_bottom', 'mount_top', same('Butterfly sweep'), {
    pl: 'Underhook z jednej strony, zablokuj rękę z drugiej, przewróć się na bok i przerzuć rywala hakiem nad sobą.',
    en: 'Underhook one side, trap the arm on the other, fall to your side and lift them over with the hook.',
  }),
  technique('butterfly_arm_drag', 'transition', 'butterfly_bottom', 'back_top', { pl: 'Arm drag na plecy', en: 'Arm drag to the back' }, {
    pl: 'Pociągnij rękę rywala przez siebie, wyjdź biodrem na zewnątrz i wejdź na plecy.',
    en: 'Drag the arm across, get your hips out and climb to the back.',
  }),
  technique('butterfly_guillotine', 'submission', 'butterfly_bottom', null, { pl: 'Gilotyna z butterfly', en: 'Guillotine from butterfly' }, {
    pl: 'Gdy głowa rywala schodzi nisko, zapnij gilotynę, połóż się na boku i zamknij gardę.',
    en: 'When their head comes low, lock the guillotine, fall to your side and close your guard.',
  }),

  // De La Riva
  technique('dlr_trip', 'sweep', 'dlr_bottom', 'og_top', { pl: 'Sweep z De La Riva', en: 'De La Riva trip sweep' }, {
    pl: 'Pchnij biodro rywala wolną stopą, pociągnij rękaw i kostkę — rywal siada, a Ty wstajesz nad jego nogami.',
    en: 'Push their hip with your free foot, pull the sleeve and ankle — they sit and you come up over their legs.',
  }),
  technique('berimbolo', 'transition', 'dlr_bottom', 'back_top', same('Berimbolo'), {
    pl: 'Z DLR wytrąć rywala na bok, obróć się pod nim przez bark i wyjdź na plecy. Ruch dla bardziej zaawansowanych.',
    en: 'From DLR off-balance them to the side, invert under them and come out on the back. A more advanced move.',
  }),

  // spider / lasso
  technique('spider_sweep', 'sweep', 'spider_bottom', 'mount_top', same('Spider sweep'), {
    pl: 'Jedna stopa w bicepsie, drugą zahacz nogę rywala; pociągnij rękaw w górę i przewróć go nożycami.',
    en: 'One foot on the biceps, the other hooks their leg; pull the sleeve up and scissor them over.',
  }),
  technique('spider_triangle', 'submission', 'spider_bottom', null, { pl: 'Triangle ze spidera', en: 'Triangle from spider' }, {
    pl: 'Puść jedną rękę, drugą trzymaj w spiderze, zarzuć nogę na kark i zapnij trójkąt.',
    en: 'Let one arm through, keep the other in spider, swing your leg over the neck and lock the triangle.',
  }),
  technique('lasso_omoplata', 'submission', 'spider_bottom', null, { pl: 'Omoplata z lasso', en: 'Omoplata from lasso' }, {
    pl: 'Z lasso przełóż nogę pod pachą rywala, obróć się twarzą do jego stóp i usiądź, blokując rękę.',
    en: 'From lasso bring your leg under their armpit, turn to face their feet and sit up, locking the arm.',
  }),

  // closed guard (bottom)
  technique('omoplata', 'submission', 'cg_bottom', null, same('Omoplata'), {
    pl: 'Wyjdź biodrem w bok, noga przez bark rywala, obróć się twarzą do jego stóp, usiądź i pochyl się do przodu.',
    en: 'Hip out, leg over their shoulder, turn to face their feet, sit up and lean forward.',
  }),
  technique('guillotine_guard', 'submission', 'cg_bottom', null, { pl: 'Gilotyna z gardy', en: 'Guillotine from guard' }, {
    pl: 'Gdy rywal opuści głowę, owiń szyję, zapnij gardę wyżej i ściśnij, wyginając się do tyłu.',
    en: 'When their head drops, wrap the neck, close your guard higher and squeeze by arching back.',
  }),
  technique('cross_collar', 'submission', 'cg_bottom', null, same('Cross collar choke'), {
    pl: 'Głęboki uchwyt za kołnierz jedną ręką, druga krzyżem po drugiej stronie; przyciągnij rywala i rozłóż łokcie.',
    en: 'Deep collar grip with one hand, the other crosses to the opposite collar; pull them in and flare your elbows.',
  }),
  technique('flower_sweep', 'sweep', 'cg_bottom', 'mount_top', { pl: 'Flower sweep', en: 'Flower (pendulum) sweep' }, {
    pl: 'Trzymaj rękaw i nogawkę po tej samej stronie, zamachnij się nogą jak wahadłem i przewróć rywala.',
    en: 'Hold the sleeve and pant leg on the same side, swing your leg like a pendulum and roll them over.',
  }),
  technique('cg_arm_drag', 'transition', 'cg_bottom', 'back_top', { pl: 'Arm drag na plecy', en: 'Arm drag to the back' }, {
    pl: 'Otwórz gardę, przeciągnij rękę rywala przez siebie i wspinaj się na jego plecy.',
    en: 'Open the guard, drag their arm across and climb onto their back.',
  }),

  // half guard
  technique('half_recover', 'escape', 'half_bottom', 'cg_bottom', { pl: 'Powrót do pełnej gardy', en: 'Recover full guard' }, {
    pl: 'Knee shield między Wami, shrimp i wyciągnij nogę spod rywala, żeby zapiąć pełną gardę.',
    en: 'Knee shield between you, shrimp and free your leg to close full guard.',
  }),
  technique('half_back_take', 'transition', 'half_bottom', 'back_top', { pl: 'Wyjście na plecy z underhooka', en: 'Back take from the underhook' }, {
    pl: 'Z underhookiem wyjdź na bok rywala i przejdź za jego plecy, gdy się pochyli.',
    en: 'With the underhook come up on their side and slip behind them as they lean.',
  }),
  technique('half_kimura', 'submission', 'half_bottom', null, { pl: 'Kimura z half guard', en: 'Kimura from half guard' }, {
    pl: 'Gdy rywal oprze rękę o matę, złap figure-four i obróć ją za jego plecy, wychodząc biodrem.',
    en: 'When they post a hand, catch the figure-four and turn it behind their back as you hip out.',
  }),
  technique('half_knee_slice', 'pass', 'half_top', 'side_top', { pl: 'Knee slice z half guard', en: 'Knee slice from half guard' }, {
    pl: 'Crossface i underhook, wsuń kolano po udzie rywala i uwolnij nogę do side control.',
    en: 'Crossface and underhook, slice your knee over their thigh and free your leg to side control.',
  }),
  technique('half_to_mount', 'pass', 'half_top', 'mount_top', { pl: 'Przejście do mount', en: 'Pass straight to mount' }, {
    pl: 'Spłaszcz rywala, uwolnij stopę drugą nogą i przełóż ją prosto do mount.',
    en: 'Flatten them, free your foot with the other leg and step straight into mount.',
  }),
  technique('darce', 'submission', 'half_top', null, { pl: "Duszenie D'Arce", en: "D'Arce choke" }, {
    pl: 'Ręka pod szyją i pod pachą rywala, zapnij na bicepsie drugiej ręki, dociśnij klatką i przejdź biodrami w bok.',
    en: 'Thread your arm under the neck and armpit, lock on your other biceps, drop your chest and walk your hips.',
  }),

  // guard (top)
  technique('cg_standing_break', 'transition', 'cg_top', 'og_top', { pl: 'Otwarcie gardy na stojąco', en: 'Standing guard break' }, {
    pl: 'Wstań z dobrą postawą, jedna ręka kontroluje, druga rozpina stopy rywala za Tobą, a Ty cofasz biodra.',
    en: 'Stand with good posture, one hand controlling, the other pries their feet open behind you as you step back.',
  }),
  technique('leg_drag', 'pass', 'og_top', 'side_top', same('Leg drag'), {
    pl: 'Przeciągnij nogę rywala przez swoje biodro, przyciśnij ją i obejdź do side control.',
    en: 'Drag their leg across your hip, pin it there and circle into side control.',
  }),
  technique('over_under', 'pass', 'og_top', 'side_top', same('Over-under pass'), {
    pl: 'Jedna ręka pod nogą, druga na drugiej nodze, głowa na brzuchu rywala; przyciśnij biodra i obejdź go.',
    en: 'One arm under a leg, the other over the other leg, head on their belly; stack the hips and walk around.',
  }),
  technique('x_pass', 'pass', 'og_top', 'kob_top', same('X-pass'), {
    pl: 'Kontroluj kolana, zrób długi krok po skosie za nogi rywala i wbij kolano w brzuch.',
    en: 'Control the knees, take a long diagonal step past the legs and drop into knee on belly.',
  }),
  technique('straight_ankle', 'submission', 'og_top', null, { pl: 'Prosta dźwignia na stopę', en: 'Straight ankle lock' }, {
    pl: 'Stopa rywala pod pachą, przedramię pod ścięgnem Achillesa, wygnij się do tyłu. Nie skręcaj stopy.',
    en: "Their foot under your armpit, forearm under the Achilles, arch back. Don't twist the foot.",
  }),

  // side control
  technique('side_to_kob', 'transition', 'side_top', 'kob_top', { pl: 'Wejście w knee on belly', en: 'Knee on belly' }, {
    pl: 'Wstań na nogi i wbij kolano w brzuch rywala, trzymając kołnierz i biodro.',
    en: 'Pop up and drive your knee onto their belly, holding the collar and hip.',
  }),
  technique('side_to_ns', 'transition', 'side_top', 'ns_top', { pl: 'Przejście do north-south', en: 'Walk to north-south' }, {
    pl: 'Utrzymaj klatkę na rywalu i przejdź nogami wokół jego głowy.',
    en: 'Keep your chest on them and walk your legs around their head.',
  }),
  technique('americana_side', 'submission', 'side_top', null, { pl: 'Americana z side control', en: 'Americana from side control' }, {
    pl: 'Przyciśnij nadgarstek rywala do maty przy jego głowie, figure-four i unieś łokieć.',
    en: 'Pin their wrist to the mat by the head, figure-four and lift the elbow.',
  }),
  technique('paper_cutter', 'submission', 'side_top', null, same('Paper cutter choke'), {
    pl: 'Głęboki uchwyt za kołnierz pod szyją, drugie przedramię przez gardło i opuść łokieć jak nóż do papieru.',
    en: 'Deep collar grip under the neck, other forearm across the throat, then drop the elbow like a paper cutter.',
  }),
  technique('side_to_turtle', 'escape', 'side_bottom', 'turtle_bottom', { pl: 'Ucieczka na kolana', en: 'Escape to your knees' }, {
    pl: 'Rama i shrimp, potem obróć się twarzą do maty, wsuwając kolano pod siebie — lądujesz w turtle.',
    en: 'Frame and shrimp, then turn to face the mat, pulling a knee under you — you end up in turtle.',
  }),

  // knee on belly
  technique('kob_armbar', 'submission', 'kob_top', null, { pl: 'Armbar z knee on belly', en: 'Armbar from knee on belly' }, {
    pl: 'Gdy rywal odpycha kolano ręką, obejdź jego głowę i usiądź w armbar.',
    en: 'When they push your knee, step around the head and sit into the armbar.',
  }),
  technique('kob_to_mount', 'transition', 'kob_top', 'mount_top', { pl: 'Przejście do mount', en: 'Slide to mount' }, {
    pl: 'Przesuń kolano po brzuchu rywala na drugą stronę i usiądź.',
    en: 'Slide your knee across the belly and sit down into mount.',
  }),
  technique('kob_escape', 'escape', 'kob_bottom', 'og_bottom', { pl: 'Ucieczka z knee on belly', en: 'Knee on belly escape' }, {
    pl: 'Rama na kolanie, shrimp od rywala (nie do niego) i włóż nogi z powrotem do gardy.',
    en: 'Frame on the knee, shrimp away (not toward them) and put your legs back in.',
  }),

  // north-south
  technique('ns_choke', 'submission', 'ns_top', null, { pl: 'Duszenie north-south', en: 'North-south choke' }, {
    pl: 'Ręka pod szyją rywala, Twój bark zamyka drugą stronę szyi; opuść biodra i ściśnij.',
    en: 'Arm under their neck, your shoulder closes the other side; drop your hips and squeeze.',
  }),
  technique('ns_kimura', 'submission', 'ns_top', null, { pl: 'Kimura z north-south', en: 'Kimura from north-south' }, {
    pl: 'Złap rękę rywala figure-four, usiądź na boku i obróć ją za jego plecy.',
    en: 'Catch the arm in a figure-four, sit to your side and turn it behind their back.',
  }),
  technique('ns_escape', 'escape', 'ns_bottom', 'og_bottom', { pl: 'Ucieczka z north-south', en: 'North-south escape' }, {
    pl: 'Rama na biodrach rywala, obróć się na bok i wkręć nogi między siebie a niego.',
    en: 'Frame on their hips, turn to your side and swing your legs back between you.',
  }),

  // mount
  technique('cross_collar_mount', 'submission', 'mount_top', null, { pl: 'Cross collar z mount', en: 'Cross collar choke from mount' }, {
    pl: 'Głęboki uchwyt za kołnierz, druga ręka krzyżem; opuść się klatką i rozłóż łokcie.',
    en: 'Deep collar grip, the other hand crosses over; drop your chest and flare the elbows.',
  }),
  technique('arm_triangle', 'submission', 'mount_top', null, same('Arm triangle'), {
    pl: 'Wepchnij rękę rywala na jego szyję, zapnij uchwyt, zejdź na bok i dociśnij barkiem.',
    en: 'Push their arm across their neck, lock your grip, dismount to the side and press with your shoulder.',
  }),
  technique('ezekiel', 'submission', 'mount_top', null, same('Ezekiel'), {
    pl: 'Ręka za głową rywala łapie Twój własny rękaw, drugie przedramię idzie przez gardło — ściśnij.',
    en: 'One arm behind their head grips your own sleeve, the other forearm goes across the throat — squeeze.',
  }),

  // back
  technique('bow_arrow', 'submission', 'back_top', null, same('Bow and arrow choke'), {
    pl: 'Głęboki uchwyt za kołnierz, druga ręka łapie spodnie; zejdź na bok i rozciągnij rywala jak łuk.',
    en: 'Deep collar grip, other hand grabs the pants; fall to the side and stretch them like a bow.',
  }),
  technique('back_armbar', 'submission', 'back_top', null, { pl: 'Armbar z pleców', en: 'Armbar from the back' }, {
    pl: 'Gdy rywal broni szyi, złap jego rękę, wyjdź biodrem i przełóż nogę przez twarz.',
    en: 'When they defend the neck, trap an arm, swing your hips out and bring your leg over the face.',
  }),
  technique('back_to_mount', 'transition', 'back_top', 'mount_top', { pl: 'Przejście do mount', en: 'Back to mount' }, {
    pl: 'Gdy rywal ucieka na plecy, przerzuć nogę i usiądź w mount.',
    en: 'When they escape to their back, swing your leg over and settle into mount.',
  }),
  technique('back_escape', 'escape', 'back_bottom', 'cg_top', { pl: 'Ucieczka z pleców', en: 'Back escape' }, {
    pl: 'Obie ręce na ręce duszącej, zsuń się na matę na stronę bez haka, uwolnij głowę i obróć się do rywala.',
    en: 'Both hands on the choking arm, slide down to the side without the hook, clear your head and turn in.',
  }),

  // turtle
  technique('turtle_back_take', 'transition', 'turtle_top', 'back_top', { pl: 'Wejście na plecy z turtle', en: 'Back take from turtle' }, {
    pl: 'Seatbelt, wbij bliższy hak, przewróć się z rywalem na bok i dołóż drugi hak.',
    en: 'Seatbelt grip, sink the near hook, roll to your side with them and add the second hook.',
  }),
  technique('clock_choke', 'submission', 'turtle_top', null, same('Clock choke'), {
    pl: 'Uchwyt za kołnierz pod szyją, połóż się na plecach rywala i obchodź go nogami jak wskazówka zegara.',
    en: 'Collar grip under the neck, lie across their back and walk your legs around like a clock hand.',
  }),
  technique('turtle_granby', 'escape', 'turtle_bottom', 'og_bottom', { pl: 'Granby roll do gardy', en: 'Granby roll to guard' }, {
    pl: 'Przetocz się przez barki pod rywalem i wyjdź twarzą do niego z nogami w gardzie.',
    en: 'Roll over your shoulders under them and come out facing them with your legs in guard.',
  }),
  technique('turtle_standup', 'escape', 'turtle_bottom', 'standing', { pl: 'Wstanie z turtle', en: 'Stand up from turtle' }, {
    pl: 'Kontroluj ręce rywala na swoim pasie, postaw stopę i wstań, uwalniając biodra.',
    en: 'Control their hands at your waist, post a foot and stand up, freeing your hips.',
  }),
  technique('turtle_single_leg', 'sweep', 'turtle_bottom', 'side_top', { pl: 'Single leg z kolan', en: 'Single leg from turtle' }, {
    pl: 'Sięgnij za nogę rywala stojącego obok, przyciągnij ją i przewróć go — kończysz na górze.',
    en: 'Reach for the leg of the opponent beside you, pull it in and drive them over — you end on top.',
  }),
];

export const libraryDrills: LibraryDrill[] = [
  drill('drill_sit_out', ['turtle_bottom'], ['turtle_standup'], '3×10', same('Sit-out'), {
    pl: 'Z czworaków przełóż nogę pod sobą na drugą stronę i obróć biodra. Na zmianę, szybko.',
    en: 'From all fours thread one leg under you to the other side and turn your hips. Alternate, fast.',
  }),
  drill('drill_bridge_turn', ['side_bottom', 'turtle_bottom'], ['side_to_turtle'], '3×10', { pl: 'Mostek z obrotem na kolana', en: 'Bridge and turn to knees' }, {
    pl: 'Mostek, shrimp i obrót twarzą do maty, kończysz na kolanach. Ucieczka do turtle w jednym ruchu.',
    en: 'Bridge, shrimp and turn to face the mat, finishing on your knees. The escape to turtle in one motion.',
  }),
  drill('drill_butterfly_lift', ['butterfly_bottom'], ['butterfly_sweep'], '3×10', { pl: 'Podrywanie z butterfly', en: 'Butterfly hook lifts' }, {
    pl: 'Siedząc, przewróć się na bok i wykop jedną nogę w górę, jak hak unoszący rywala. Na zmianę strony.',
    en: 'Sitting, fall to one side and kick a leg up as if lifting with the hook. Alternate sides.',
  }),
  drill('drill_toreando_steps', ['og_top'], ['toreando', 'x_pass'], '3×30 s', { pl: 'Kroki toreando', en: 'Toreando footwork' }, {
    pl: 'Z niskiej postawy odrzucaj wyobrażone nogi rywala w bok i obchodź je krokiem, raz w lewo, raz w prawo.',
    en: 'From a low stance throw imaginary legs aside and step around them, left then right.',
  }),
  drill('drill_inversion', ['dlr_bottom', 'spider_bottom', 'og_bottom'], ['berimbolo'], '3×5', { pl: 'Inwersja (obrót na łopatkach)', en: 'Inversions' }, {
    pl: 'Leżąc, przetocz biodra nad głowę i obróć się na łopatkach, wracając twarzą do przodu. Ciężar na barkach, nie na szyi.',
    en: 'On your back roll your hips over your head and spin on your shoulders, coming back facing forward. Weight on the shoulders, not the neck.',
  }),
  drill('drill_hip_heist', ['kob_bottom', 'og_bottom'], ['og_standup'], '3×10', same('Hip heist'), {
    pl: 'Z siadu podpartego unieś biodra i przełóż nogę pod sobą, lądując na kolanie. Szybkie przejście z pleców na nogi.',
    en: 'From a seated post lift your hips and thread a leg under you, landing on a knee. A fast way from your back to your feet.',
  }),
  drill('drill_shoulder_walk', ['cg_bottom', 'half_bottom'], ['half_recover'], '2×10', { pl: 'Chodzenie na łopatkach', en: 'Shoulder walk' }, {
    pl: 'Z uniesionymi biodrami przesuwaj się do tyłu naprzemiennie na łopatkach. Uczy ruchu biodrami pod rywalem.',
    en: 'Hips up, walk backwards on alternating shoulder blades. Teaches you to move your hips under someone.',
  }),
  drill('drill_ns_circle', ['side_top', 'ns_top'], ['side_to_ns'], '3×30 s', { pl: 'Obchodzenie do north-south', en: 'Side to north-south circles' }, {
    pl: 'Na czworakach, z klatką nisko, obchodź wyobrażonego rywala nogami wokół głowy, nie podnosząc bioder.',
    en: "On all fours, chest low, walk around an imaginary partner's head without lifting your hips.",
  }),
  drill('drill_kob_popup', ['side_top', 'kob_top'], ['side_to_kob'], '3×10', { pl: 'Wejścia w knee on belly', en: 'Knee on belly pop-ups' }, {
    pl: 'Z pozycji side control dynamicznie wstań i postaw kolano, potem wróć. Kolano w miejscu, druga noga szeroko.',
    en: 'From a side control posture pop up and place the knee, then drop back. Knee planted, other leg wide.',
  }),
  drill('drill_back_escape', ['back_bottom'], ['back_escape'], '3×10', { pl: 'Ucieczka z pleców solo', en: 'Solo back escape' }, {
    pl: 'Siedząc jak z rywalem za plecami, zsuwaj biodra w bok, kładź barki na macie i obróć się twarzą w dół.',
    en: 'Sitting as if someone had your back, slide your hips to the side, put your shoulders on the mat and turn face down.',
  }),
];

/** Descriptions for the starter map (seed.ts), keyed by id; loaded where the item has none yet. */
export const starterNotes: Record<string, Text> = {
  // positions
  standing: {
    pl: 'Start każdej walki. Cel: obalić rywala albo przejść do parteru na swoich warunkach. Niska postawa, łokcie blisko, walka o uchwyty.',
    en: 'Where every match starts. Goal: take them down or get to the ground on your terms. Stay low, elbows in, win the grips.',
  },
  og_bottom: {
    pl: 'Nogi nie są zapięte. Cel: kontrolować dystans stopami i uchwytami, potem sweep albo powrót do zamkniętej gardy. Nie pozwól, żeby kolana rywala minęły Twoje stopy.',
    en: "Your legs aren't locked. Goal: manage distance with feet and grips, then sweep or close the guard. Don't let their knees get past your feet.",
  },
  cg_bottom: {
    pl: 'Nogi zapięte za plecami rywala. Cel: złamać jego postawę (przyciągnąć kolanami i za kark), potem atak albo sweep. Nie leż płasko — pracuj biodrami i kątem.',
    en: "Legs locked behind their back. Goal: break their posture (pull with knees and head), then attack or sweep. Don't lie flat — work your hips and angle.",
  },
  half_bottom: {
    pl: 'Jedna noga rywala między Twoimi. Najważniejsze: underhook i leżenie na boku, nie na plecach. Na płasko przegrywasz — na boku masz sweepy i powrót do gardy.',
    en: 'One of their legs trapped between yours. Get the underhook and stay on your side, not flat. Flat you lose; on your side you have sweeps and guard recovery.',
  },
  side_bottom: {
    pl: 'Rywal leży w poprzek Ciebie. Priorytet: przetrwać i nie dać się dosiąść. Rama przy szyi i biodrze, shrimp, kolano z powrotem do gardy.',
    en: "They're lying across you. Priority: survive and stop the mount. Frame on the neck and hip, shrimp, get the knee back in to recover guard.",
  },
  mount_bottom: {
    pl: 'Najgorsza pozycja — rywal siedzi na Tobie. Łokcie przy żebrach, ręce chronią szyję. Uciekaj mostkiem (upa) albo przez łokieć-kolano, nigdy nie pchaj prostymi rękami.',
    en: 'The worst spot — they sit on you. Elbows tight to ribs, hands guard the neck. Escape with the bridge (upa) or elbow-knee; never push with straight arms.',
  },
  og_top: {
    pl: 'Stoisz albo klęczysz przed otwartą gardą. Cel: kontrolować nogi (spodnie, kolana) i obejść je do side control. Nie pozwól trzymać stóp na swoich biodrach.',
    en: "You're standing or kneeling in front of an open guard. Goal: control the legs (pants, knees) and get around them to side control. Don't let their feet sit on your hips.",
  },
  cg_top: {
    pl: 'Jesteś w zamkniętej gardzie. Najpierw postawa: plecy proste, ręce na biodrach albo pasie rywala. Dopiero potem otwieraj gardę — na kolanach albo na stojąco.',
    en: "You're inside the closed guard. Posture first: straight back, hands on their hips or belt. Only then open the guard — kneeling or standing.",
  },
  side_top: {
    pl: 'Kontrola w poprzek rywala: klatka na klatce, biodra nisko, crossface i underhook. Stąd mount, knee on belly, north-south i kończenia na ręce.',
    en: 'Chest to chest across them: hips low, crossface and underhook. From here: mount, knee on belly, north-south and arm attacks.',
  },
  mount_top: {
    pl: 'Siedzisz na rywalu. Trzymaj balans (kolana wysoko, ręce gotowe do podparcia) i czekaj na wystawioną rękę. Najlepsze miejsce do kończeń i wejścia na plecy.',
    en: 'You sit on them. Keep your base (knees high, hands ready to post) and wait for an arm. The best spot for submissions and taking the back.',
  },
  back_top: {
    pl: 'Najlepsza pozycja w BJJ: haki w biodrach i seatbelt. Kontroluj ręce rywala, nie pozwól mu zejść plecami na matę i szukaj duszenia.',
    en: 'The best position in BJJ: hooks in and a seatbelt grip. Control their hands, keep their back off the mat and hunt the choke.',
  },

  // techniques
  pull_guard: {
    pl: 'Z uchwytu za kołnierz i rękaw usiądź i zapnij nogi. Ląduj biodrami blisko rywala, nie siadaj daleko.',
    en: 'From collar and sleeve grips, sit down and close your legs. Land close to them, not far away.',
  },
  double_leg: {
    pl: 'Obniż poziom, krok wejściowy między nogi rywala, głowa przy jego boku, złap oba kolana i przejedź przez niego.',
    en: 'Change levels, penetration step between their feet, head on their side, grab both knees and drive through.',
  },
  tripod: {
    pl: 'Jedna stopa na biodrze, druga za piętą rywala; pchnij biodro i ściągnij piętę — rywal pada na plecy, a Ty wstajesz na górę.',
    en: 'One foot on the hip, the other hooks behind the heel; push the hip and pull the heel — they fall back and you come up on top.',
  },
  close_guard: {
    pl: 'Przyciągnij biodra do rywala, zapnij nogi wysoko na jego plecach i od razu złam postawę.',
    en: 'Pull your hips in, lock your legs high on their back and break their posture right away.',
  },
  toreando: {
    pl: 'Złap spodnie przy kolanach, odrzuć nogi rywala w bok i obejdź je szybkim krokiem do side control.',
    en: 'Grip the pants at the knees, throw the legs to one side and step around fast into side control.',
  },
  hip_bump: {
    pl: 'Gdy rywal siedzi prosto: usiądź, ręka za jego bark, biodro w górę i przewróć go przez ramię do mount.',
    en: 'When they sit upright: sit up, reach over the shoulder, hips up and roll them over into mount.',
  },
  scissor: {
    pl: 'Goleń w poprzek brzucha, druga noga nisko przy kolanie rywala; pociągnij rękaw i kołnierz i przewróć go nożycami.',
    en: 'Shin across the belly, other leg low by their knee; pull sleeve and collar and scissor them over.',
  },
  armbar_guard: {
    pl: 'Kontroluj rękę, stopa na biodrze, obróć się bokiem, noga przez twarz, kolana razem i biodra w górę.',
    en: 'Control the arm, foot on the hip, pivot to the side, leg over the face, knees together, hips up.',
  },
  kimura_guard: {
    pl: 'Gdy rywal oprze rękę o matę: usiądź, figure-four na nadgarstku i obróć rękę za jego plecy.',
    en: 'When they post a hand: sit up, figure-four on the wrist and rotate the arm behind their back.',
  },
  triangle: {
    pl: 'Jedna ręka rywala w środku, druga na zewnątrz; noga przez kark, zapnij trójkąt pod kolanem, przyciągnij głowę i unieś biodra.',
    en: 'One arm in, one arm out; leg over the neck, lock the figure-four behind your knee, pull the head and lift your hips.',
  },
  knee_cut: {
    pl: 'Otwórz gardę, wsuń kolano po udzie rywala na drugą stronę, crossface i underhook, wyprowadź nogę do side control.',
    en: 'Open the guard, slide your knee across their thigh, crossface and underhook, then free your leg into side control.',
  },
  old_school: {
    pl: 'Z underhookiem wyjdź na kolano, złap dalszą kostkę rywala i przewróć go na bok, wychodząc na górę.',
    en: 'From the underhook, come up on your knee, grab their far ankle and drive them over to come up on top.',
  },
  shrimp: {
    pl: 'Rama przy szyi i biodrze, mostek, odsuń biodra (shrimp) i włóż kolano między siebie a rywala.',
    en: 'Frame on the neck and hip, bridge, shrimp your hips out and bring your knee back in between you.',
  },
  upa: {
    pl: 'Zablokuj rękę i nogę rywala po tej samej stronie, zrób wysoki mostek nad barkiem i przewróć go do jego gardy.',
    en: 'Trap their arm and leg on one side, bridge high over your shoulder and roll them into their guard.',
  },
  elbow_knee: {
    pl: 'Łokieć do kolana, shrimp i wyciągnij nogę spod rywala — najpierw half guard, potem pełna garda.',
    en: 'Elbow to knee, shrimp and pull your leg out from under them — half guard first, then full guard.',
  },
  knee_slide: {
    pl: 'Z side control przesuń kolano po brzuchu rywala na drugą stronę i usiądź w mount, kontrolując głowę.',
    en: 'From side control slide your knee over their belly to the far side and settle into mount, controlling the head.',
  },
  kimura_side: {
    pl: 'Złap dalszą rękę rywala figure-four, przyciśnij jego łokieć do maty i obróć przedramię za plecy.',
    en: 'Catch the far arm in a figure-four, pin the elbow to the mat and rotate the forearm behind their back.',
  },
  americana: {
    pl: 'Nadgarstek rywala na macie przy głowie, figure-four i unieś łokieć, jakbyś malował matę pędzlem.',
    en: 'Pin the wrist to the mat by the head, figure-four and lift the elbow like painting the mat with a brush.',
  },
  armbar_mount: {
    pl: 'Wysoki mount, zablokuj rękę na swojej klatce, obróć się, noga przez twarz, usiądź blisko barku i unieś biodra.',
    en: 'High mount, trap the arm on your chest, pivot, leg over the face, sit tight to the shoulder and lift your hips.',
  },
  take_back: {
    pl: 'Gdy rywal obraca się na bok, wbij górny hak, złap seatbelt i przewróć się z nim — drugi hak wejdzie sam.',
    en: 'As they turn to their side, sink the top hook, get the seatbelt and roll with them — the second hook follows.',
  },
  rnc: {
    pl: 'Ręka pod brodą, dłoń na bicepsie drugiej ręki, druga dłoń za głową rywala; ściśnij łokcie i wypnij klatkę.',
    en: 'Arm under the chin, hand on your other biceps, other hand behind their head; squeeze the elbows and puff your chest.',
  },

  // drills
  drill_shrimp: {
    pl: 'Leżąc na plecach, odepchnij się stopą, wypchnij biodra w bok i przesuwaj się po macie. Ręce jak rama przed sobą.',
    en: 'On your back, push off one foot, drive your hips out and travel down the mat. Hands framing in front.',
  },
  drill_bridge: {
    pl: 'Stopy blisko pośladków, wypchnij biodra wysoko i obróć się nad barkiem. Na zmianę na obie strony.',
    en: 'Feet close to your butt, drive your hips high and turn over your shoulder. Alternate sides.',
  },
  drill_standup: {
    pl: 'Z siadu: ręka podparta za sobą, druga osłania twarz; unieś biodra i przeciągnij nogę pod sobą do postawy.',
    en: 'From sitting: post a hand behind, the other guards your face; lift your hips and swing your leg under into a stance.',
  },
  drill_granby: {
    pl: 'Z kolan przetocz się przez barki (nie przez głowę) i wróć twarzą do rywala.',
    en: 'From your knees roll across your shoulders (not your head) and come back facing your partner.',
  },
  drill_back_roll: {
    pl: 'Z siadu przetocz się do tyłu przez jeden bark i wyląduj na kolanach. Uczy wychodzenia z ciasnych sytuacji.',
    en: 'From sitting, roll backwards over one shoulder and land on your knees. Teaches you to escape tight spots.',
  },
  drill_forward_roll: {
    pl: 'Z ręką przed sobą przetocz się po skosie przez bark na przeciwne biodro. Podstawa bezpiecznego upadania.',
    en: 'Hand in front, roll diagonally across one shoulder to the opposite hip. The basis of safe falling.',
  },
  drill_sprawl: {
    pl: 'Z postawy wyrzuć nogi do tyłu i opuść biodra na matę, potem szybko wróć do postawy.',
    en: 'From your stance shoot your legs back and drop your hips to the mat, then pop back up.',
  },
  drill_penetration: {
    pl: 'Obniż poziom, długi krok między nogi wyobrażonego rywala, kolano dotyka maty, druga noga dostawiona.',
    en: "Change levels, long step between an imaginary opponent's feet, knee touches the mat, trail leg follows.",
  },
  drill_hip_up: {
    pl: 'Z pleców unieś biodra jak przy armbarze z gardy i obróć się bokiem. Buduje ruch do armbara, triangle i hip bumpa.',
    en: 'On your back lift your hips as for an armbar from guard and turn to the side. Builds the motion for armbar, triangle and hip bump.',
  },
  drill_leg_circles: {
    pl: 'Leżąc na plecach, zataczaj nogami koła i obracaj się na łopatkach, jakbyś wkładał nogi z powrotem przed rywala.',
    en: 'On your back circle your legs and spin on your shoulders, as if putting your legs back in front of someone.',
  },
  drill_hip_switch: {
    pl: 'W pozycji side control przerzuć biodra: nogi przeplatają się pod Tobą, a klatka zostaje nisko.',
    en: 'In a side control posture switch your hips: legs thread under you while your chest stays low.',
  },
  drill_knee_cut: {
    pl: 'Z przysiadu wsuń kolano po skosie przed siebie, tylna noga wyprostowana, i wróć. Na zmianę strony.',
    en: 'From a crouch slide your knee diagonally forward, back leg straight, and return. Alternate sides.',
  },
};
