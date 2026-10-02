import { router } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Screen } from '@/components/screen';
import { StatusChip } from '@/components/status-chip';
import { SwipeToDelete } from '@/components/swipe-to-delete';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { toDateKey, weekRangeLabel, weekStartOf } from '@/data/dates';
import { useStore } from '@/data/store';
import type { Drill, Technique } from '@/data/types';
import { useStatusColors } from '@/hooks/use-status-colors';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { youtubeSearch } from '@/utils/youtube';

export default function PlanScreen() {
  const theme = useTheme();
  const statusColor = useStatusColors();
  const tr = useT();
  const plan = useStore((s) => s.plan);
  const techniques = useStore((s) => s.techniques);
  const positions = useStore((s) => s.positions);
  const drills = useStore((s) => s.drills);
  const sessions = useStore((s) => s.sessions);
  const setStatus = useStore((s) => s.setStatus);
  const togglePlanned = useStore((s) => s.togglePlanned);
  const togglePlannedDrill = useStore((s) => s.togglePlannedDrill);
  const setPlan = useStore((s) => s.setPlan);
  const logTraining = useStore((s) => s.logTraining);
  const unlogTraining = useStore((s) => s.unlogTraining);
  const logDrill = useStore((s) => s.logDrill);
  const unlogDrill = useStore((s) => s.unlogDrill);

  const today = toDateKey();
  const thisWeek = weekStartOf(today);
  const isCurrent = plan.weekStart === thisWeek;
  const planned = (isCurrent ? plan.techniqueIds : [])
    .map((id) => techniques.find((t) => t.id === id))
    .filter((t): t is Technique => !!t);
  const plannedDrills = (isCurrent ? (plan.drillIds ?? []) : [])
    .map((id) => drills.find((d) => d.id === id))
    .filter((d): d is Drill => !!d);
  // last week's plan is offered for carry-over instead of silently disappearing
  const carryOver = isCurrent ? [] : plan.techniqueIds.filter((id) => techniques.some((t) => t.id === id));
  const carryOverDrills = isCurrent ? [] : (plan.drillIds ?? []).filter((id) => drills.some((d) => d.id === id));
  const carryOverCount = carryOver.length + carryOverDrills.length;

  // technique and drill ids never clash (drills are prefixed or random), so one map holds both
  const { weekCounts, doneToday } = useMemo(() => {
    const weekCounts = new Map<string, number>();
    const doneToday = new Set<string>();
    for (const s of sessions) {
      if (weekStartOf(s.date) !== thisWeek) continue;
      for (const id of [...s.techniqueIds, ...(s.drillIds ?? [])]) {
        weekCounts.set(id, (weekCounts.get(id) ?? 0) + 1);
        if (s.date === today) doneToday.add(id);
      }
    }
    return { weekCounts, doneToday };
  }, [sessions, thisWeek, today]);

  const total = planned.length + plannedDrills.length;
  const done = [...planned, ...plannedDrills].filter((x) => weekCounts.has(x.id)).length;
  const toggleToday = (id: string) => (doneToday.has(id) ? unlogTraining(today, id) : logTraining(today, [id]));
  const toggleDrillToday = (id: string) => (doneToday.has(id) ? unlogDrill(today, id) : logDrill(today, id));
  const weekLabel = (id: string) => {
    const count = weekCounts.get(id) ?? 0;
    return count ? tr.plan.thisWeekCount(count) : tr.plan.notThisWeek;
  };
  const positionName = (id: string) => positions.find((p) => p.id === id)?.name;

  return (
    <Screen
      title={tr.plan.title}
      action={
        <Pressable
          onPress={() => router.push('/plan/pick')}
          hitSlop={10}
          accessibilityRole="button"
          style={[styles.editButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {total ? tr.plan.edit : tr.plan.choose}
          </ThemedText>
        </Pressable>
      }>
      <ThemedText type="small" themeColor="textSecondary">
        {tr.plan.week(weekRangeLabel(thisWeek))}
      </ThemedText>

      {total > 0 && (
        <View style={styles.progressBox}>
          <ThemedText type="smallBold">
            {tr.plan.progress(done, total)}
          </ThemedText>
          <View style={[styles.progress, { backgroundColor: theme.backgroundElement }]}>
            <View style={{ flex: done, backgroundColor: statusColor.works }} />
            <View style={{ flex: total - done }} />
          </View>
        </View>
      )}

      {carryOverCount > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(180)}
          layout={LinearTransition.duration(220)}
          style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold">{tr.plan.lastWeek}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {tr.plan.lastWeekWaiting(carryOverCount)}
          </ThemedText>
          <Pressable onPress={() => setPlan(carryOver, carryOverDrills)} accessibilityRole="button" style={[styles.secondaryButton, { borderColor: theme.accent }]}>
            <ThemedText type="smallBold" themeColor="accent">
              {tr.plan.carryOver}
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}

      {total === 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(180)}
          layout={LinearTransition.duration(220)}
          style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold">{tr.plan.emptyTitle}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {tr.plan.emptyText}
          </ThemedText>
        </Animated.View>
      )}

      {planned.map((t) => (
        <PlanItem
          key={t.id}
          name={t.name}
          subtitle={`${positionName(t.from)} · ${weekLabel(t.id)}`}
          checked={doneToday.has(t.id)}
          onCheck={() => toggleToday(t.id)}
          onOpen={() => router.push({ pathname: '/technique/[id]', params: { id: t.id } })}
          onRemove={() => togglePlanned(t.id)}
          videoUrl={t.videoUrl}
          accessory={<StatusChip small status={t.status} onChange={(next) => setStatus(t.id, next)} />}
        />
      ))}

      {plannedDrills.length > 0 && (
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHead}>
          {tr.plan.drills}
        </ThemedText>
      )}
      {plannedDrills.map((d) => (
        <PlanItem
          key={d.id}
          name={`🔁 ${d.name}`}
          subtitle={`${d.dose ? `${d.dose} · ` : ''}${weekLabel(d.id)}`}
          checked={doneToday.has(d.id)}
          onCheck={() => toggleDrillToday(d.id)}
          onOpen={() => router.push({ pathname: '/drill/[id]', params: { id: d.id } })}
          onRemove={() => togglePlannedDrill(d.id)}
          videoUrl={d.videoUrl}
          searchName={d.name}
        />
      ))}
    </Screen>
  );
}

type PlanItemProps = {
  name: string;
  subtitle: string;
  checked: boolean;
  onCheck: () => void;
  onOpen: () => void;
  onRemove: () => void;
  videoUrl?: string;
  /** What to search YouTube for when there's no video; defaults to the name. */
  searchName?: string;
  /** Shown at the end of the row, e.g. a technique's status. */
  accessory?: ReactNode;
};

/** A planned technique or drill: tick it off for today, open it, watch its video, swipe to unplan. */
function PlanItem({ name, subtitle, checked, onCheck, onOpen, onRemove, videoUrl, searchName, accessory }: PlanItemProps) {
  const theme = useTheme();
  const statusColor = useStatusColors();
  const tr = useT();

  return (
    <SwipeToDelete label={tr.plan.remove} onDelete={onRemove} style={styles.swipeable}>
      <ThemedView type="backgroundElement" style={styles.plannedCard}>
        <View style={styles.row}>
          <Pressable
            onPress={onCheck}
            hitSlop={8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={checked ? tr.plan.uncheckToday(name) : tr.plan.checkToday(name)}
            style={[
              styles.check,
              { borderColor: checked ? statusColor.works : theme.textSecondary },
              checked && { backgroundColor: statusColor.works },
            ]}>
            {checked && (
              <Animated.View entering={ZoomIn.duration(180)}>
                <ThemedText style={styles.checkMark}>✓</ThemedText>
              </Animated.View>
            )}
          </Pressable>
          <Pressable style={styles.flex} onPress={onOpen}>
            <ThemedText type="smallBold" style={styles.name}>
              {name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          </Pressable>
          {accessory}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => Linking.openURL(videoUrl ?? youtubeSearch(searchName ?? name))}
            accessibilityRole="link"
            style={({ pressed }) => [styles.videoButton, !videoUrl && styles.videoSearch, pressed && styles.pressed]}>
            <ThemedText type="smallBold" style={videoUrl ? styles.videoText : styles.videoSearchText}>
              {videoUrl ? tr.plan.video : tr.common.searchYoutube}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  sectionHead: { marginTop: Spacing.four, textTransform: 'uppercase', fontSize: 12 },
  flex: { flex: 1 },
  editButton: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  progressBox: { gap: Spacing.two, marginTop: Spacing.three, marginBottom: Spacing.one },
  progress: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  card: { borderRadius: 14, padding: 14, gap: Spacing.two, marginTop: Spacing.three },
  swipeable: { borderRadius: 14, marginTop: Spacing.three },
  plannedCard: { padding: 14, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, lineHeight: 18 },
  name: { fontSize: 17 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  videoButton: { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  videoSearch: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444' },
  videoText: { color: '#FFFFFF' },
  videoSearchText: { color: '#EF4444' },
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: Spacing.one },
  pressed: { opacity: 0.7 },
});
