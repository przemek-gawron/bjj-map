import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { dayLabel, recentDays, relativeDay, toDateKey } from '@/data/dates';
import { STATUS_COLOR } from '@/data/labels';
import { drillIdsOf, trainingStats } from '@/data/stats';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

export default function DrillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const tr = useT();
  const drill = useStore((s) => s.drills.find((d) => d.id === id));
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const sessions = useStore((s) => s.sessions);
  const logDrill = useStore((s) => s.logDrill);
  const unlogDrill = useStore((s) => s.unlogDrill);

  const stats = useMemo(() => trainingStats(sessions, drillIdsOf).get(id), [sessions, id]);

  if (!drill) {
    return (
      <ThemedView style={styles.root}>
        <ThemedText themeColor="textSecondary" style={styles.content}>
          {tr.drills.gone}
        </ThemedText>
      </ThemedView>
    );
  }

  const doneOn = new Set(stats?.dates);
  const today = toDateKey();
  const toggleDay = (date: string) => (doneOn.has(date) ? unlogDrill(date, drill.id) : logDrill(date, drill.id));
  const linkedPositions = positions.filter((p) => drill.positionIds.includes(p.id));
  const linkedTechniques = techniques.filter((t) => drill.techniqueIds.includes(t.id));

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: drill.name,
          headerRight: () => (
            <Pressable
              hitSlop={10}
              style={styles.headerButton}
              onPress={() => router.push({ pathname: '/drill/form', params: { id: drill.id } })}>
              <ThemedText type="smallBold" themeColor="accent">
                {tr.common.edit}
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          {tr.drills.solo}
          {drill.dose ? ` · ${drill.dose}` : ''}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.name}>
          {drill.name}
        </ThemedText>

        {linkedPositions.length > 0 && (
          <View style={styles.links}>
            {linkedPositions.map((p) => (
              <Chip key={p.id} small label={p.name} />
            ))}
          </View>
        )}
        {linkedTechniques.length > 0 && (
          <View style={styles.links}>
            {linkedTechniques.map((t) => (
              <Chip
                key={t.id}
                small
                selected
                label={t.name}
                color={STATUS_COLOR[t.status]}
                onPress={() => router.push({ pathname: '/technique/[id]', params: { id: t.id } })}
              />
            ))}
          </View>
        )}

        {drill.videoUrl && (
          <Pressable
            onPress={() => Linking.openURL(drill.videoUrl!)}
            style={({ pressed }) => [styles.videoButton, pressed && styles.pressed]}>
            <ThemedText type="smallBold" style={styles.videoText}>
              {tr.drills.watchVideo}
            </ThemedText>
          </Pressable>
        )}

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{tr.drills.training}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {stats ? tr.drills.doneSummary(stats.count, relativeDay(stats.lastDate!)) : tr.drills.notDoneYet}
          </ThemedText>

          <Pressable
            onPress={() => toggleDay(today)}
            style={({ pressed }) => [
              styles.todayButton,
              { backgroundColor: doneOn.has(today) ? STATUS_COLOR.works : theme.accent },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.todayText, { color: doneOn.has(today) ? '#FFFFFF' : theme.onAccent }]}>
              {doneOn.has(today) ? tr.drills.doneToday : tr.drills.doToday}
            </ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            {tr.drills.otherDay}
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
            {recentDays(14)
              .slice(1)
              .map((date) => (
                <Chip key={date} small label={dayLabel(date)} selected={doneOn.has(date)} onPress={() => toggleDay(date)} />
              ))}
          </ScrollView>
        </ThemedView>

        {stats && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{tr.drills.history}</ThemedText>
            <View style={styles.links}>
              {stats.dates.map((date) => (
                <Chip key={date} small label={dayLabel(date)} selected color={STATUS_COLOR.works} />
              ))}
            </View>
          </ThemedView>
        )}

        {drill.notes && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{tr.drills.notes}</ThemedText>
            <ThemedText type="small">{drill.notes}</ThemedText>
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
  name: { fontSize: 24, lineHeight: 30, marginBottom: Spacing.one },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  videoButton: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: Spacing.two },
  videoText: { color: '#FFFFFF' },
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one, marginTop: Spacing.two },
  todayButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.two },
  todayText: { fontWeight: '700' },
  label: { marginTop: Spacing.two },
  days: { gap: Spacing.one, paddingVertical: Spacing.one },
  pressed: { opacity: 0.7 },
});
