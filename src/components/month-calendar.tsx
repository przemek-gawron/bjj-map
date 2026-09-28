import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { addMonths, monthGrid, monthLabel, toDateKey } from '@/data/dates';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAYS = ['pn', 'wt', 'śr', 'cz', 'pt', 'so', 'nd'];

type Props = {
  /** YYYY-MM */
  month: string;
  onMonthChange: (month: string) => void;
  /** Training days, shown as filled squares. */
  marked?: Set<string>;
  selected?: string;
  /** Makes past days pressable; future days never are. */
  onSelect?: (date: string) => void;
};

/** Month grid (Monday first) with arrows to page through months, up to the current one. */
export function MonthCalendar({ month, onMonthChange, marked, selected, onSelect }: Props) {
  const theme = useTheme();
  const today = toDateKey();
  const isCurrentMonth = month >= today.slice(0, 7);

  const arrow = (label: string, a11y: string, delta: number, disabled = false) => (
    <Pressable
      onPress={() => onMonthChange(addMonths(month, delta))}
      disabled={disabled}
      hitSlop={10}
      accessibilityLabel={a11y}
      style={[styles.arrow, disabled && styles.disabled]}>
      <ThemedText themeColor="accent" style={styles.arrowText}>
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <View>
      <View style={styles.head}>
        {arrow('‹', 'Poprzedni miesiąc', -1)}
        <ThemedText type="smallBold" style={styles.title}>
          {monthLabel(month)}
        </ThemedText>
        {arrow('›', 'Następny miesiąc', 1, isCurrentMonth)}
      </View>

      <View style={styles.week}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={[styles.cell, styles.weekday, { color: theme.textSecondary }]}>
            {d}
          </Text>
        ))}
      </View>

      {monthGrid(month).map((week, w) => (
        <View key={w} style={styles.week}>
          {week.map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const future = day > today;
            const isSelected = day === selected;
            const isMarked = marked?.has(day);
            return (
              <Pressable
                key={day}
                onPress={() => onSelect?.(day)}
                disabled={!onSelect || future}
                accessibilityLabel={day}
                accessibilityState={{ selected: isSelected, disabled: future }}
                style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    isMarked && { backgroundColor: theme.accent + '33' },
                    isSelected && { backgroundColor: theme.accent },
                    day === today && !isSelected && { borderColor: theme.accent, borderWidth: 1.5 },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: isSelected ? '#FFFFFF' : future ? theme.textSecondary : theme.text },
                      (isMarked || isSelected) && styles.bold,
                      future && styles.disabled,
                    ]}>
                    {Number(day.slice(8))}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  title: { textTransform: 'capitalize' },
  arrow: { paddingHorizontal: Spacing.two },
  arrowText: { fontSize: 24, lineHeight: 28 },
  week: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  weekday: { fontSize: 11, textAlign: 'center', paddingBottom: Spacing.one },
  day: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 15 },
  bold: { fontWeight: '700' },
  disabled: { opacity: 0.35 },
});
