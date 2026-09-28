import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { addDays, shortMonthLabel, toDateKey, weekStartOf } from '@/data/dates';
import type { Session } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

const CELL = 13;
const GAP = 3;
const ROW_LABELS = ['pn', '', 'śr', '', 'pt', '', ''];

type Props = { year: number; sessions: Session[] };

/** GitHub-style grid of a year: one column per week, one square per day, darker for more techniques. */
export function YearHeatmap({ year, sessions }: Props) {
  const theme = useTheme();
  const scroll = useRef<ScrollView>(null);
  const today = toDateKey();

  const byDate = new Map(sessions.filter((s) => s.date.startsWith(String(year))).map((s) => [s.date, s]));
  const weeks: string[][] = [];
  for (let day = weekStartOf(`${year}-01-01`); day <= `${year}-12-31`; ) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++, day = addDays(day, 1)) week.push(day);
    weeks.push(week);
  }
  const todayColumn = weeks.findIndex((w) => w.includes(today));

  const shade = (day: string) => {
    const s = byDate.get(day);
    if (!s) return theme.backgroundSelected;
    const n = s.techniqueIds.length;
    // hex alpha: note-only / 1–2 / 3–4 / 5+ techniques
    return theme.accent + (n === 0 ? '55' : n <= 2 ? '88' : n <= 4 ? 'BB' : 'FF');
  };

  return (
    <View style={styles.root}>
      <View style={styles.rowLabels}>
        {ROW_LABELS.map((l, i) => (
          <Text key={i} style={[styles.rowLabel, { color: theme.textSecondary }]}>
            {l}
          </Text>
        ))}
      </View>
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        // start at the current week rather than January
        onContentSizeChange={() => {
          if (todayColumn > 0) scroll.current?.scrollTo({ x: Math.max(0, (todayColumn - 12) * (CELL + GAP)), animated: false });
        }}>
        <View>
          <View style={styles.months}>
            {weeks.map((w, i) => {
              const first = w.find((d) => d.endsWith('-01') && d.startsWith(String(year)));
              return (
                first && (
                  <Text key={i} style={[styles.month, { left: i * (CELL + GAP), color: theme.textSecondary }]}>
                    {shortMonthLabel(first.slice(0, 7))}
                  </Text>
                )
              );
            })}
          </View>
          <View style={styles.grid}>
            {weeks.map((w, i) => (
              <View key={i} style={styles.column}>
                {w.map((day) => (
                  <View
                    key={day}
                    accessibilityLabel={byDate.has(day) ? `${day}: trening` : undefined}
                    style={[
                      styles.cell,
                      { backgroundColor: shade(day) },
                      (!day.startsWith(String(year)) || day > today) && styles.outside,
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', gap: 6 },
  rowLabels: { paddingTop: 16, gap: GAP },
  rowLabel: { height: CELL, fontSize: 9, lineHeight: CELL },
  months: { height: 16 },
  month: { position: 'absolute', top: 0, fontSize: 9 },
  grid: { flexDirection: 'row', gap: GAP },
  column: { gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3 },
  outside: { opacity: 0.3 },
});
