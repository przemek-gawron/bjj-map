// PROTOTYPE — Variant D: training timeline. Stats + auto "patterns" insight on top, sessions grouped by week below.
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { positionName, STATUS_COLOR, type Session } from './data';
import type { VariantProps } from './types';

export const name = 'Oś czasu treningów';

const DAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sob'];

function weekKey(date: string) {
  const d = new Date(date + 'T12:00:00');
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export function VariantD({ techniques, sessions }: VariantProps) {
  const allSpars = sessions.flatMap((s) => s.spars);
  const wins = allSpars.filter((s) => s.result === 'win').length;
  const losses = allSpars.filter((s) => s.result === 'loss').length;

  const lossSpots: Record<string, number> = {};
  allSpars.filter((s) => s.result === 'loss' && s.where).forEach((s) => (lossSpots[s.where!] = (lossSpots[s.where!] ?? 0) + 1));
  const worst = Object.entries(lossSpots).sort((a, b) => b[1] - a[1])[0];
  const escapesForWorst = worst ? techniques.filter((t) => t.from === worst[0]) : [];

  const weeks: Record<string, Session[]> = {};
  [...sessions].sort((a, b) => b.date.localeCompare(a.date)).forEach((s) => (weeks[weekKey(s.date)] ??= []).push(s));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dziennik</Text>

      <View style={styles.stats}>
        <Stat n={sessions.length} label="treningów" />
        <Stat n={allSpars.length} label="sparingów" />
        <Stat n={`${wins}–${losses}`} label="W–L" />
        <Stat n={techniques.filter((t) => t.status === 'works').length} label="działa" />
      </View>

      {worst && (
        <View style={styles.insight}>
          <Text style={styles.insightKicker}>WZORZEC</Text>
          <Text style={styles.insightText}>
            Przegrałeś {worst[1]}× z pozycji <Text style={{ fontWeight: '800' }}>{positionName(worst[0])}</Text>.
          </Text>
          <Text style={styles.insightSub}>
            {escapesForWorst.length
              ? 'Znasz: ' + escapesForWorst.map((t) => t.name).join(', ') + ' — przećwicz w tym tygodniu.'
              : 'Nie masz jeszcze żadnej ucieczki z tej pozycji. Zapytaj trenera!'}
          </Text>
        </View>
      )}

      {Object.entries(weeks).map(([wk, list]) => (
        <View key={wk}>
          <Text style={styles.weekHead}>Tydzień od {wk.slice(8)}.{wk.slice(5, 7)} · {list.length}×</Text>
          {list.map((s) => {
            const d = new Date(s.date + 'T12:00:00');
            return (
              <View key={s.id} style={styles.item}>
                <View style={styles.dateCol}>
                  <Text style={styles.day}>{DAYS[d.getDay()]}</Text>
                  <Text style={styles.dateNum}>{d.getDate()}</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.body}>
                  <Text style={styles.kind}>{s.kind}</Text>
                  {s.techniques.length > 0 && (
                    <View style={styles.tags}>
                      {s.techniques.map((id) => {
                        const t = techniques.find((x) => x.id === id);
                        if (!t) return null;
                        return (
                          <View key={id} style={[styles.tag, { borderColor: STATUS_COLOR[t.status] }]}>
                            <Text style={styles.tagText}>{t.name}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  {s.spars.map((sp, i) => (
                    <Text key={i} style={styles.spar}>
                      <Text style={{ color: sp.result === 'win' ? '#10B981' : sp.result === 'loss' ? '#EF4444' : '#9CA3AF', fontWeight: '800' }}>
                        {sp.result === 'win' ? 'W' : sp.result === 'loss' ? 'L' : 'D'}
                      </Text>
                      {'  '}
                      {sp.partner} ({sp.belt}){sp.where ? ' · ' + positionName(sp.where) : ''}
                      {sp.note ? ' — ' + sp.note : ''}
                    </Text>
                  ))}
                  {s.note && <Text style={styles.note}>„{s.note}”</Text>}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFBF5' },
  content: { padding: 16, paddingBottom: 140, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#1C1917', letterSpacing: -0.5 },
  stats: { flexDirection: 'row', marginTop: 12, borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#1C1917' },
  stat: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  statN: { fontSize: 22, fontWeight: '900', color: '#1C1917' },
  statL: { fontSize: 11, color: '#78716C' },
  insight: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, marginTop: 16 },
  insightKicker: { fontSize: 10, fontWeight: '800', color: '#B91C1C', letterSpacing: 1 },
  insightText: { fontSize: 16, color: '#1C1917', marginTop: 4 },
  insightSub: { fontSize: 13, color: '#57534E', marginTop: 4 },
  weekHead: { fontSize: 12, fontWeight: '800', color: '#A8A29E', textTransform: 'uppercase', marginTop: 24, marginBottom: 8 },
  item: { flexDirection: 'row', marginBottom: 14 },
  dateCol: { width: 40, alignItems: 'center' },
  day: { fontSize: 11, color: '#78716C' },
  dateNum: { fontSize: 20, fontWeight: '800', color: '#1C1917' },
  line: { width: 2, backgroundColor: '#E7E5E4', marginHorizontal: 10 },
  body: { flex: 1 },
  kind: { fontSize: 13, fontWeight: '700', color: '#57534E' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600', color: '#1C1917' },
  spar: { fontSize: 13, color: '#44403C', marginTop: 6 },
  note: { fontSize: 13, color: '#78716C', fontStyle: 'italic', marginTop: 6 },
});
