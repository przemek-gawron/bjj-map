import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { dayLabel, recentDays, relativeDay, toDateKey } from '@/data/dates';
import { STATUS_COLOR } from '@/data/labels';
import { trainingStats } from '@/data/stats';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

export default function TechniqueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const tr = useT();
  const technique = useStore((s) => s.techniques.find((t) => t.id === id));
  const positions = useStore((s) => s.positions);
  const sessions = useStore((s) => s.sessions);
  const allDrills = useStore((s) => s.drills);
  const setStatus = useStore((s) => s.setStatus);
  const logTraining = useStore((s) => s.logTraining);
  const unlogTraining = useStore((s) => s.unlogTraining);

  const stats = useMemo(() => trainingStats(sessions).get(id), [sessions, id]);

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
  const today = toDateKey();
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
          {tr.type[technique.type]}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.path}>
          {positionName(technique.from)}
          {technique.to ? ` → ${positionName(technique.to)}` : ` → ${tr.techniques.submission}`}
        </ThemedText>
        <StatusChip status={technique.status} onChange={(next) => setStatus(technique.id, next)} />

        {technique.videoUrl && (
          <Pressable
            onPress={() => Linking.openURL(technique.videoUrl!)}
            style={({ pressed }) => [styles.videoButton, pressed && styles.pressed]}>
            <ThemedText type="smallBold" style={styles.videoText}>
              {tr.techniques.watchVideo}
            </ThemedText>
          </Pressable>
        )}

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{tr.techniques.training}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {stats ? tr.techniques.trainedSummary(stats.count, relativeDay(stats.lastDate!)) : tr.techniques.notTrainedYet}
          </ThemedText>

          <Pressable
            onPress={() => toggleDay(today)}
            style={({ pressed }) => [
              styles.todayButton,
              { backgroundColor: trainedOn.has(today) ? STATUS_COLOR.works : theme.accent },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.todayText, { color: trainedOn.has(today) ? '#FFFFFF' : theme.onAccent }]}>{trainedOn.has(today) ? tr.techniques.trainedToday : tr.techniques.trainToday}</ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            {tr.techniques.otherDay}
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
            {recentDays(14)
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
                <Chip key={date} small label={dayLabel(date)} selected color={STATUS_COLOR.works} />
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
            style={styles.addDrill}>
            <ThemedText type="smallBold" themeColor="accent">
              {tr.techniques.addDrill}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {technique.notes && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{tr.techniques.notes}</ThemedText>
            <ThemedText type="small">{technique.notes}</ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // web headers have no side padding of their own
  headerButton: { paddingHorizontal: Platform.OS === 'web' ? Spacing.three : 0 },
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, gap: Spacing.two },
  path: { fontSize: 24, lineHeight: 30, marginBottom: Spacing.one },
  videoButton: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: Spacing.two },
  videoText: { color: '#FFFFFF' },
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
