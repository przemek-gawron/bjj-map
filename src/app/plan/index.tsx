import { router } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { toDateKey, weekRangeLabel, weekStartOf } from '@/data/dates';
import { STATUS_COLOR } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Technique } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

const youtubeSearch = (t: Technique) =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${t.name} bjj`);

export default function PlanScreen() {
  const theme = useTheme();
  const plan = useStore((s) => s.plan);
  const techniques = useStore((s) => s.techniques);
  const positions = useStore((s) => s.positions);
  const sessions = useStore((s) => s.sessions);
  const setStatus = useStore((s) => s.setStatus);
  const togglePlanned = useStore((s) => s.togglePlanned);
  const setPlan = useStore((s) => s.setPlan);
  const logTraining = useStore((s) => s.logTraining);
  const unlogTraining = useStore((s) => s.unlogTraining);

  const today = toDateKey();
  const thisWeek = weekStartOf(today);
  const isCurrent = plan.weekStart === thisWeek;
  const planned = (isCurrent ? plan.techniqueIds : [])
    .map((id) => techniques.find((t) => t.id === id))
    .filter((t): t is Technique => !!t);
  // last week's plan is offered for carry-over instead of silently disappearing
  const carryOver = isCurrent ? [] : plan.techniqueIds.filter((id) => techniques.some((t) => t.id === id));

  const { weekCounts, trainedToday } = useMemo(() => {
    const weekCounts = new Map<string, number>();
    const trainedToday = new Set<string>();
    for (const s of sessions) {
      if (weekStartOf(s.date) !== thisWeek) continue;
      for (const id of s.techniqueIds) {
        weekCounts.set(id, (weekCounts.get(id) ?? 0) + 1);
        if (s.date === today) trainedToday.add(id);
      }
    }
    return { weekCounts, trainedToday };
  }, [sessions, thisWeek, today]);

  const done = planned.filter((t) => weekCounts.has(t.id)).length;
  const toggleToday = (id: string) => (trainedToday.has(id) ? unlogTraining(today, id) : logTraining(today, [id]));
  const positionName = (id: string) => positions.find((p) => p.id === id)?.name;

  return (
    <Screen
      title="Plan"
      action={
        <Pressable
          onPress={() => router.push('/plan/pick')}
          hitSlop={10}
          style={[styles.editButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={styles.editButtonText}>
            {planned.length ? 'Edytuj' : 'Wybierz'}
          </ThemedText>
        </Pressable>
      }>
      <ThemedText type="small" themeColor="textSecondary">
        Tydzień {weekRangeLabel(thisWeek)}
      </ThemedText>

      {planned.length > 0 && (
        <View style={styles.progressBox}>
          <ThemedText type="smallBold">
            {done} z {planned.length} przećwiczone w tym tygodniu
          </ThemedText>
          <View style={[styles.progress, { backgroundColor: theme.backgroundElement }]}>
            <View style={{ flex: done, backgroundColor: STATUS_COLOR.works }} />
            <View style={{ flex: planned.length - done }} />
          </View>
        </View>
      )}

      {carryOver.length > 0 && (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Plan z poprzedniego tygodnia</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {carryOver.length} technik czekało na przećwiczenie.
          </ThemedText>
          <Pressable onPress={() => setPlan(carryOver)} style={[styles.secondaryButton, { borderColor: theme.accent }]}>
            <ThemedText type="smallBold" themeColor="accent">
              Przenieś na ten tydzień
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {planned.length === 0 && (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Co chcesz ćwiczyć w tym tygodniu?</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Wybierz kilka technik — zobaczysz je tu razem z wideo, a po treningu odhaczysz jednym tapnięciem.
          </ThemedText>
        </ThemedView>
      )}

      {planned.map((t) => {
        const count = weekCounts.get(t.id) ?? 0;
        const checked = trainedToday.has(t.id);
        return (
          <ThemedView key={t.id} type="backgroundElement" style={styles.card}>
            <View style={styles.row}>
              <Pressable
                onPress={() => toggleToday(t.id)}
                hitSlop={8}
                accessibilityLabel={checked ? `${t.name}: odznacz dzisiejszy trening` : `${t.name}: trenowałem dziś`}
                style={[
                  styles.check,
                  { borderColor: checked ? STATUS_COLOR.works : theme.textSecondary },
                  checked && { backgroundColor: STATUS_COLOR.works },
                ]}>
                {checked && <ThemedText style={styles.checkMark}>✓</ThemedText>}
              </Pressable>
              <Pressable style={styles.flex} onPress={() => router.push({ pathname: '/techniques/[id]', params: { id: t.id } })}>
                <ThemedText type="smallBold" style={styles.name}>
                  {t.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {positionName(t.from)} · {count ? `${count}× w tym tygodniu` : 'jeszcze nie w tym tygodniu'}
                </ThemedText>
              </Pressable>
              <StatusChip small status={t.status} onChange={(next) => setStatus(t.id, next)} />
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => Linking.openURL(t.videoUrl ?? youtubeSearch(t))}
                style={({ pressed }) => [styles.videoButton, !t.videoUrl && styles.videoSearch, pressed && styles.pressed]}>
                <ThemedText type="smallBold" style={t.videoUrl ? styles.videoText : styles.videoSearchText}>
                  {t.videoUrl ? '▶ Wideo' : '🔍 Szukaj na YouTube'}
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => togglePlanned(t.id)} hitSlop={8}>
                <ThemedText type="small" themeColor="textSecondary">
                  Usuń z planu
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  editButton: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  editButtonText: { color: '#FFFFFF' },
  progressBox: { gap: Spacing.two, marginTop: Spacing.three, marginBottom: Spacing.one },
  progress: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  card: { borderRadius: 14, padding: 14, gap: Spacing.two, marginTop: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, lineHeight: 18 },
  name: { fontSize: 17 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  videoButton: { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  videoSearch: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444' },
  videoText: { color: '#FFFFFF' },
  videoSearchText: { color: '#EF4444' },
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: Spacing.one },
  pressed: { opacity: 0.7 },
});
