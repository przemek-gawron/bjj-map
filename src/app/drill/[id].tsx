import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HeaderButtonPadding, MaxContentWidth, Spacing } from '@/constants/theme';
import { dayLabel, recentDays, relativeDay } from '@/data/dates';
import { drillIdsOf, trainingStats } from '@/data/stats';
import { useStore } from '@/data/store';
import { useStatusColors } from '@/hooks/use-status-colors';
import { useTheme } from '@/hooks/use-theme';
import { useToday } from '@/hooks/use-today';
import { useT } from '@/i18n';
import { youtubeSearch } from '@/utils/youtube';

export default function DrillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const statusColor = useStatusColors();
  const tr = useT();
  const drill = useStore((s) => s.drills.find((d) => d.id === id));
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const sessions = useStore((s) => s.sessions);
  const logDrill = useStore((s) => s.logDrill);
  const unlogDrill = useStore((s) => s.unlogDrill);

  const stats = useMemo(() => trainingStats(sessions, drillIdsOf).get(id), [sessions, id]);
  const today = useToday();

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
              accessibilityRole="button"
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
                badge
                label={t.name}
                color={statusColor[t.status]}
                onPress={() => router.push({ pathname: '/technique/[id]', params: { id: t.id } })}
              />
            ))}
          </View>
        )}

        {drill.notes && (
          <ThemedText type="small" style={styles.notes}>
            {drill.notes}
          </ThemedText>
        )}

        <Pressable
          onPress={() => Linking.openURL(drill.videoUrl ?? youtubeSearch(drill.name))}
          accessibilityRole="link"
          style={({ pressed }) => [styles.videoButton, !drill.videoUrl && styles.videoSearch, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={drill.videoUrl ? styles.videoText : styles.videoSearchText}>
            {drill.videoUrl ? tr.drills.watchVideo : tr.common.searchYoutube}
          </ThemedText>
        </Pressable>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{tr.drills.training}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {stats ? tr.drills.doneSummary(stats.count, relativeDay(stats.lastDate!, today)) : tr.drills.notDoneYet}
          </ThemedText>

          <Pressable
            onPress={() => toggleDay(today)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.todayButton,
              { backgroundColor: doneOn.has(today) ? statusColor.works : theme.accent },
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
            {recentDays(14, today)
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
                <Chip key={date} small label={dayLabel(date)} selected color={statusColor.works} />
              ))}
            </View>
          </ThemedView>
        )}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerButton: { paddingHorizontal: HeaderButtonPadding },
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, gap: Spacing.two },
  name: { fontSize: 24, lineHeight: 30, marginBottom: Spacing.one },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
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
  pressed: { opacity: 0.7 },
});
