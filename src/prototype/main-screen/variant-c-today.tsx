// PROTOTYPE — Variant C: "today" first. 30-second post-training log on top, this week's drilling plan as big tiles.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { positionName, positions, STATUS_COLOR, type Spar } from './data';
import { VideoLink } from './shared';
import type { VariantProps } from './types';

export const name = 'Dziś + plan tygodnia';

const TODAY = '2026-09-27';
const RESULT_LABEL: Record<Spar['result'], string> = { win: 'Wygrałem', loss: 'Przegrałem', draw: 'Remis' };

export function VariantC({ techniques, sessions, setStatus, addSession }: VariantProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [spars, setSpars] = useState<Spar[]>([]);
  const [partner, setPartner] = useState('');
  const [result, setResult] = useState<Spar['result']>('loss');
  const [where, setWhere] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const drilling = techniques.filter((t) => t.status === 'drilling');
  const weekSessions = sessions.filter((s) => s.date >= '2026-09-21').length;
  const recentPartners = [...new Set(sessions.flatMap((s) => s.spars.map((x) => x.partner)))].slice(0, 5);

  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);

  const addSpar = () => {
    if (!partner.trim()) return;
    setSpars([...spars, { partner: partner.trim(), belt: '?', result, where }]);
    setPartner('');
    setWhere(undefined);
  };

  const save = () => {
    addSession({ date: TODAY, kind: 'Zajęcia', techniques: picked, spars, note: note || undefined });
    setPicked([]);
    setSpars([]);
    setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.greet}>Sobota, 27 września</Text>
      <Text style={styles.streak}>🔥 {weekSessions} treningi w tym tygodniu</Text>

      {/* ---- quick log ---- */}
      <View style={styles.logCard}>
        <Text style={styles.logTitle}>Po treningu (30 sek.)</Text>

        <Text style={styles.label}>Co dziś ćwiczyłeś?</Text>
        <View style={styles.wrap}>
          {techniques.slice(0, 12).map((t) => {
            const on = picked.includes(t.id);
            return (
              <Pressable key={t.id} onPress={() => toggle(t.id)} style={[styles.pill, on && styles.pillOn]}>
                <Text style={[styles.pillText, on && styles.pillTextOn]}>{t.name}</Text>
              </Pressable>
            );
          })}
          <Pressable style={[styles.pill, styles.pillAdd]}>
            <Text style={styles.pillText}>+ nowa</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Sparingi</Text>
        {spars.map((s, i) => (
          <Text key={i} style={styles.sparLine}>
            {s.result === 'win' ? '✅' : s.result === 'loss' ? '❌' : '➖'} {s.partner}
            {s.where ? ' · ' + positionName(s.where) : ''}
          </Text>
        ))}
        <View style={styles.wrap}>
          {recentPartners.map((p) => (
            <Pressable key={p} onPress={() => setPartner(p)} style={[styles.pill, partner === p && styles.pillOn]}>
              <Text style={[styles.pillText, partner === p && styles.pillTextOn]}>{p}</Text>
            </Pressable>
          ))}
          <TextInput value={partner} onChangeText={setPartner} placeholder="kto?" style={styles.input} placeholderTextColor="#9CA3AF" />
        </View>
        <View style={styles.wrap}>
          {(Object.keys(RESULT_LABEL) as Spar['result'][]).map((r) => (
            <Pressable key={r} onPress={() => setResult(r)} style={[styles.pill, result === r && styles.pillOn]}>
              <Text style={[styles.pillText, result === r && styles.pillTextOn]}>{RESULT_LABEL[r]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>{result === 'win' ? 'Gdzie wygrałeś?' : 'Gdzie było najgorzej?'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll}>
          {positions.map((p) => (
            <Pressable key={p.id} onPress={() => setWhere(where === p.id ? undefined : p.id)} style={[styles.pill, where === p.id && styles.pillOn]}>
              <Text style={[styles.pillText, where === p.id && styles.pillTextOn]}>{p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable onPress={addSpar} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>+ dodaj sparing</Text>
        </Pressable>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Notatka (opcjonalnie) — co zapamiętać?"
          placeholderTextColor="#9CA3AF"
          multiline
          style={[styles.input, styles.note]}
        />
        <Pressable onPress={save} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{saved ? '✓ Zapisane' : 'Zapisz trening'}</Text>
        </Pressable>
      </View>

      {/* ---- weekly plan ---- */}
      <Text style={styles.section}>Plan na ten tydzień</Text>
      <Text style={styles.sectionSub}>Techniki, które ćwiczysz. Gdy zadziała w sparingu, oznacz ją.</Text>
      <View style={styles.tiles}>
        {drilling.map((t) => (
          <View key={t.id} style={[styles.tile, { borderTopColor: STATUS_COLOR[t.status] }]}>
            <Text style={styles.tileFrom}>{positionName(t.from)}</Text>
            <Text style={styles.tileName}>{t.name}</Text>
            <View style={styles.tileFoot}>
              <VideoLink technique={t} />
              <Pressable onPress={() => setStatus(t.id, 'works')} style={styles.worksBtn}>
                <Text style={styles.worksBtnText}>✓ Działa</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {drilling.length === 0 && <Text style={styles.sectionSub}>Wszystko działa! Dodaj nowe techniki do ćwiczenia.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 16, paddingBottom: 140, width: '100%', maxWidth: 560, alignSelf: 'center' },
  greet: { color: '#94A3B8', fontSize: 14 },
  streak: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', marginTop: 4, marginBottom: 16 },
  logCard: { backgroundColor: '#1E293B', borderRadius: 18, padding: 16 },
  logTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  label: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  hint: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  hscroll: { gap: 6, paddingVertical: 6 },
  pill: { backgroundColor: '#334155', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  pillOn: { backgroundColor: '#F59E0B' },
  pillAdd: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#475569', borderStyle: 'dashed' },
  pillText: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  pillTextOn: { color: '#0F172A' },
  sparLine: { color: '#E2E8F0', fontSize: 14, marginBottom: 4 },
  input: { backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, minWidth: 110, fontSize: 14 },
  note: { marginTop: 16, minHeight: 60, textAlignVertical: 'top' },
  secondaryBtn: { alignSelf: 'flex-start', marginTop: 6 },
  secondaryBtnText: { color: '#F59E0B', fontWeight: '700' },
  primaryBtn: { backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  section: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginTop: 28 },
  sectionSub: { color: '#94A3B8', fontSize: 13, marginTop: 2, marginBottom: 12 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '47%', flexGrow: 1, backgroundColor: '#1E293B', borderRadius: 14, padding: 14, borderTopWidth: 4 },
  tileFrom: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  tileName: { color: '#F8FAFC', fontSize: 17, fontWeight: '800', marginTop: 4, minHeight: 44 },
  tileFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  worksBtn: { backgroundColor: '#10B98133', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  worksBtnText: { color: '#10B981', fontWeight: '700', fontSize: 13 },
});
