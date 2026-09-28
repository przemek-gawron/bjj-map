import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BarChart } from './bar-chart';
import { YearHeatmap } from './year-heatmap';

import { MonthCalendar } from '@/components/month-calendar';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { monthGrid, shortMonthLabel, toDateKey } from '@/data/dates';
import { formatHours, HOURS_PER_SESSION, periodStats } from '@/data/stats';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

type Period = 'month' | 'year';

const TOP_TECHNIQUES = 10;

/** Journal statistics for a month or a year: calendar / heatmap, hours per week or month, most trained techniques. */
export function JournalStats() {
  const theme = useTheme();
  const tr = useT();
  const sessions = useStore((s) => s.sessions);
  const techniques = useStore((s) => s.techniques);

  const today = toDateKey();
  const [period, setPeriod] = useState<Period>('month');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [year, setYear] = useState(Number(today.slice(0, 4)));

  const prefix = period === 'month' ? month : String(year);
  const stats = periodStats(sessions, prefix);
  const trainingDays = new Set(sessions.map((s) => s.date));
  const hoursOn = (days: (string | null)[]) => days.filter((d) => d && trainingDays.has(d)).length * HOURS_PER_SESSION;

  const bars =
    period === 'month'
      ? monthGrid(month).map((week) => {
          const days = week.filter((d): d is string => !!d);
          const first = Number(days[0].slice(8));
          const last = Number(days[days.length - 1].slice(8));
          return { label: first === last ? String(first) : `${first}–${last}`, value: hoursOn(days) };
        })
      : Array.from({ length: 12 }, (_, i) => {
          const m = `${year}-${String(i + 1).padStart(2, '0')}`;
          return { label: shortMonthLabel(m), value: periodStats(sessions, m).hours };
        });

  const top = stats.techniques.slice(0, TOP_TECHNIQUES);
  const maxCount = top[0]?.count ?? 1;
  const openDay = (day: string) => {
    const s = sessions.find((x) => x.date === day);
    if (s) router.push({ pathname: '/journal/entry', params: { id: s.id } });
  };

  return (
    <View style={styles.root}>
      <Segmented
        options={[
          { value: 'month', label: tr.journal.month },
          { value: 'year', label: tr.journal.year },
        ]}
        value={period}
        onChange={setPeriod}
      />

      <ThemedView type="backgroundElement" style={styles.card}>
        {period === 'month' ? (
          <MonthCalendar month={month} onMonthChange={setMonth} marked={trainingDays} onSelect={openDay} />
        ) : (
          <>
            <View style={styles.yearHead}>
              <Pressable onPress={() => setYear(year - 1)} hitSlop={10} accessibilityLabel={tr.dates.previousYear}>
                <ThemedText themeColor="accent" style={styles.arrow}>
                  ‹
                </ThemedText>
              </Pressable>
              <ThemedText type="smallBold">{year}</ThemedText>
              <Pressable
                onPress={() => setYear(year + 1)}
                disabled={String(year) >= today.slice(0, 4)}
                hitSlop={10}
                accessibilityLabel={tr.dates.nextYear}
                style={String(year) >= today.slice(0, 4) && styles.disabled}>
                <ThemedText themeColor="accent" style={styles.arrow}>
                  ›
                </ThemedText>
              </Pressable>
            </View>
            <YearHeatmap year={year} sessions={sessions} />
          </>
        )}
      </ThemedView>

      <View style={[styles.summary, { borderColor: theme.backgroundSelected }]}>
        <Stat value={String(stats.sessions)} label={tr.journal.sessionsLabel(stats.sessions)} />
        <Stat value={formatHours(stats.hours)} label={tr.journal.hoursLabel} />
        <Stat value={String(stats.techniques.length)} label={tr.journal.techniquesLabel(stats.techniques.length)} />
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
        {period === 'month' ? tr.journal.hoursPerWeek : tr.journal.hoursPerMonth}
      </ThemedText>
      <BarChart bars={bars} format={formatHours} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        {tr.journal.hoursNote(formatHours(HOURS_PER_SESSION))}
      </ThemedText>

      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
        {tr.journal.mostTrained}
      </ThemedText>
      {top.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {tr.journal.noneInPeriod}
        </ThemedText>
      )}
      {top.map(({ id, count }) => {
        const t = techniques.find((x) => x.id === id);
        if (!t) return null;
        return (
          <Pressable
            key={id}
            onPress={() => router.push({ pathname: '/technique/[id]', params: { id } })}
            style={({ pressed }) => [styles.rank, pressed && styles.pressed]}>
            <View style={styles.rankHead}>
              <ThemedText type="small" numberOfLines={1} style={styles.flex}>
                {t.name}
              </ThemedText>
              <ThemedText type="smallBold">{count}×</ThemedText>
            </View>
            <View style={[styles.rankTrack, { backgroundColor: theme.backgroundElement }]}>
              <View style={{ flex: count, backgroundColor: theme.accent, borderRadius: 3 }} />
              <View style={{ flex: maxCount - count }} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.two, marginTop: Spacing.three },
  flex: { flex: 1 },
  card: { borderRadius: 14, padding: Spacing.three, marginTop: Spacing.two },
  yearHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  arrow: { fontSize: 24, lineHeight: 28, paddingHorizontal: Spacing.two },
  disabled: { opacity: 0.35 },
  summary: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, marginTop: Spacing.two },
  stat: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three },
  statValue: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  statLabel: { fontSize: 12, textAlign: 'center' },
  section: { marginTop: Spacing.four, marginBottom: Spacing.one, textTransform: 'uppercase', fontSize: 12 },
  hint: { fontSize: 11 },
  rank: { gap: 4, paddingVertical: 4 },
  rankHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rankTrack: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' },
  pressed: { opacity: 0.6 },
});
