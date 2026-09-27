// PROTOTYPE — Four variants of the BJJ app main screen, switchable via `?variant=A|B|C|D` on /prototype.
// Question: what should be the heart of the app — the map (A), a list (B), the post-training log (C) or the timeline (D)?
// State is in-memory and shared, so changing a status in one variant shows up in the others.
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrototypeSwitcher } from '@/components/prototype-switcher';
import { initialSessions, initialTechniques, type Session, type Status } from '@/prototype/main-screen/data';
import * as A from '@/prototype/main-screen/variant-a-map';
import * as B from '@/prototype/main-screen/variant-b-list';
import * as C from '@/prototype/main-screen/variant-c-today';
import * as D from '@/prototype/main-screen/variant-d-timeline';

const VARIANTS = [
  { key: 'A', name: A.name, Component: A.VariantA },
  { key: 'B', name: B.name, Component: B.VariantB },
  { key: 'C', name: C.name, Component: C.VariantC },
  { key: 'D', name: D.name, Component: D.VariantD },
];

export default function PrototypeMainScreen() {
  const { variant = 'A' } = useLocalSearchParams<{ variant?: string }>();
  const insets = useSafeAreaInsets();
  const [techniques, setTechniques] = useState(initialTechniques);
  const [sessions, setSessions] = useState(initialSessions);

  const setStatus = (id: string, status: Status) =>
    setTechniques((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
  const addSession = (s: Omit<Session, 'id'>) =>
    setSessions((ss) => [{ ...s, id: 's' + (ss.length + 1) }, ...ss]);

  const current = VARIANTS.find((v) => v.key === variant) ?? VARIANTS[0];
  const count = (s: Status) => techniques.filter((t) => t.status === s).length;
  const state = `widziałem ${count('seen')} · ćwiczę ${count('drilling')} · działa ${count('works')} · treningi ${sessions.length}`;

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'web' ? 76 : insets.top }]}>
      <current.Component techniques={techniques} sessions={sessions} setStatus={setStatus} addSession={addSession} />
      <PrototypeSwitcher variants={VARIANTS} current={current.key} state={state} />
    </View>
  );
}

const styles = StyleSheet.create({
  // web: paddingTop leaves room for the starter's floating top tab bar
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});
