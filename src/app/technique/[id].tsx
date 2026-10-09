import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HeaderButtonPadding, MaxContentWidth, Spacing } from '@/constants/theme';
import { dayLabel, recentDays, relativeDay } from '@/data/dates';
import { trainingStats } from '@/data/stats';
import { useStore } from '@/data/store';
import { useStatusColors } from '@/hooks/use-status-colors';
import { useTheme } from '@/hooks/use-theme';
import { useToday } from '@/hooks/use-today';
import { useT } from '@/i18n';
import { youtubeSearch } from '@/utils/youtube';

export default function TechniqueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const statusColor = useStatusColors();
  const tr = useT();
  const technique = useStore((s) => s.techniques.find((t) => t.id === id));
  const positions = useStore((s) => s.positions);
  const sessions = useStore((s) => s.sessions);
  const allDrills = useStore((s) => s.drills);
  const setStatus = useStore((s) => s.setStatus);
  const logTraining = useStore((s) => s.logTraining);
  const unlogTraining = useStore((s) => s.unlogTraining);

  const stats = useMemo(() => trainingStats(sessions).get(id), [sessions, id]);
  const today = useToday();

  if (!technique) {
    return (
      <ThemedView style={styles.root}>
        <ThemedText themeColor="textSecondary" style={styles.content}>
          {tr.techniques.gone}
        </ThemedText>
      </ThemedView>
    );
  }

  const trainedOn = new Set(stats?.dates);
  const toggleDay = (date: string) =>
    trainedOn.has(date) ? unlogTraining(date, technique.id) : logTraining(date, [technique.id]);
  const drills = allDrills.filter((d) => d.techniqueIds.includes(technique.id));
  const positionName = (pid: string | null) => positions.find((p) => p.id === pid)?.name;

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: technique.name,
          headerRight: () => (
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              style={styles.headerButton}
              onPress={() => router.push({ pathname: '/technique/form', params: { id: technique.id } })}>
              <ThemedText type="smallBold" themeColor="accent">
                {tr.common.edit}
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          {tr.typeSingular[technique.type]}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.path}>
          {positionName(technique.from)}
          {technique.to ? ` → ${positionName(technique.to)}` : ` → ${tr.techniques.submission}`}
        </ThemedText>
        <StatusChip status={technique.status} onChange={(next) => setStatus(technique.id, next)} />

        {technique.notes && (
          <ThemedText type="small" style={styles.notes}>
            {technique.notes}
          </ThemedText>
        )}

        <Pressable
          onPress={() => Linking.openURL(technique.videoUrl ?? youtubeSearch(technique.name))}
          accessibilityRole="link"
          style={({ pressed }) => [styles.videoButton, !technique.videoUrl && styles.videoSearch, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={technique.videoUrl ? styles.videoText : styles.videoSearchText}>
            {technique.videoUrl ? tr.techniques.watchVideo : tr.common.searchYoutube}
          </ThemedText>
        </Pressable>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{tr.techniques.training}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {stats ? tr.techniques.trainedSummary(stats.count, relativeDay(stats.lastDate!, today)) : tr.techniques.notTrainedYet}
          </ThemedText>

          <Pressable
            onPress={() => toggleDay(today)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.todayButton,
              { backgroundColor: trainedOn.has(today) ? statusColor.works : theme.accent },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.todayText, { color: trainedOn.has(today) ? '#FFFFFF' : theme.onAccent }]}>{trainedOn.has(today) ? tr.techniques.trainedToday : tr.techniques.trainToday}</ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            {tr.techniques.otherDay}
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
            {recentDays(14, today)
              .slice(1)
              .map((date) => (
                <Chip key={date} small label={dayLabel(date)} selected={trainedOn.has(date)} onPress={() => toggleDay(date)} />
              ))}
          </ScrollView>
        </ThemedView>

        {stats && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{tr.techniques.history}</ThemedText>
            <View style={styles.history}>
              {stats.dates.map((date) => (
                <Chip key={date} small label={dayLabel(date)} selected color={statusColor.works} />
              ))}
            </View>
          </ThemedView>
        )}

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{tr.techniques.drills}</ThemedText>
          {drills.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => router.push({ pathname: '/drill/[id]', params: { id: d.id } })}
              style={({ pressed }) => [styles.drill, { borderColor: theme.backgroundSelected }, pressed && styles.pressed]}>
              <ThemedText type="small" style={styles.flex}>
                {d.name}
              </ThemedText>
              {d.dose && (
                <ThemedText type="small" themeColor="accent">
                  {d.dose}
                </ThemedText>
              )}
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push({ pathname: '/drill/form', params: { technique: technique.id } })}
            hitSlop={6}
            accessibilityRole="button"
            style={styles.addDrill}>
            <ThemedText type="smallBold" themeColor="accent">
              {tr.techniques.addDrill}
            </ThemedText>
          </Pressable>
        </ThemedView>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerButton: { paddingHorizontal: HeaderButtonPadding },
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, gap: Spacing.two },
  path: { fontSize: 24, lineHeight: 30, marginBottom: Spacing.one },
  notes: { lineHeight: 21 },
  videoButton: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: Spacing.two },
  videoText: { color: '#FFFFFF' },
  // no video of its own: an outlined search button instead of a filled "watch" one
  videoSearch: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444' },
  videoSearchText: { color: '#EF4444' },
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one, marginTop: Spacing.two },
  todayButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.two },
  todayText: { fontWeight: '700' },
  label: { marginTop: Spacing.two },
  days: { gap: Spacing.one, paddingVertical: Spacing.one },
  history: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one, marginTop: Spacing.one },
  flex: { flex: 1 },
  drill: { flexDirection: 'row', gap: Spacing.two, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  addDrill: { paddingTop: Spacing.one },
  pressed: { opacity: 0.7 },
});
