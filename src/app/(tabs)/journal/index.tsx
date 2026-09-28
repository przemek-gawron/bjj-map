import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddButton } from '@/components/add-button';
import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { JournalStats } from '@/components/stats/journal-stats';
import { SwipeToDelete } from '@/components/swipe-to-delete';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { dayLabel, relativeDay, toDateKey, weekRangeLabel, weekStartOf } from '@/data/dates';
import { STATUS_COLOR } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Session } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';

export default function JournalScreen() {
  const theme = useTheme();
  const sessions = useStore((s) => s.sessions);
  const techniques = useStore((s) => s.techniques);
  const removeSession = useStore((s) => s.removeSession);
  const [view, setView] = useState<'list' | 'stats'>('list');

  const today = toDateKey();
  const thisWeek = weekStartOf(today);
  const thisMonth = today.slice(0, 7);
  const weekCount = sessions.filter((s) => weekStartOf(s.date) === thisWeek).length;
  const monthCount = sessions.filter((s) => s.date.startsWith(thisMonth)).length;
  const monthTechniques = new Set(sessions.filter((s) => s.date.startsWith(thisMonth)).flatMap((s) => s.techniqueIds)).size;

  const weeks = new Map<string, Session[]>();
  for (const s of sessions) {
    const key = weekStartOf(s.date);
    weeks.set(key, [...(weeks.get(key) ?? []), s]);
  }

  // "+" edits today's entry if there already is one — one session per day
  const todaySession = sessions.find((s) => s.date === today);
  const remove = (s: Session) =>
    confirm('Usunąć trening?', `Trening z ${dayLabel(s.date)} zniknie z dziennika.`, 'Usuń', () => removeSession(s.id));
  const openEntry = (id?: string) => router.push(id ? { pathname: '/journal/entry', params: { id } } : '/journal/entry');

  return (
    <Screen
      title="Dziennik"
      action={
        <AddButton onPress={() => openEntry(todaySession?.id)} accessibilityLabel="Dodaj trening" />
      }>
      <Segmented
        options={[
          { value: 'list', label: 'Treningi' },
          { value: 'stats', label: 'Statystyki' },
        ]}
        value={view}
        onChange={setView}
      />

      {view === 'stats' ? (
        <JournalStats />
      ) : (
        <>
        <View style={[styles.stats, { borderColor: theme.backgroundSelected }]}>
          <Stat value={weekCount} label="w tym tygodniu" />
          <Stat value={monthCount} label="w tym miesiącu" />
          <Stat value={monthTechniques} label="technik w miesiącu" />
        </View>

        {sessions.length === 0 && (
          <ThemedView type="backgroundElement" style={styles.empty}>
            <ThemedText type="smallBold">Brak treningów</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Po treningu dotknij +, zaznacz co ćwiczyłeś i dopisz notatkę. Treningi z zakładki Techniki też tu trafiają.
            </ThemedText>
          </ThemedView>
        )}

        {[...weeks.entries()].map(([weekStart, list]) => (
          <View key={weekStart}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.weekHead}>
              {weekStart === thisWeek ? 'Ten tydzień' : weekRangeLabel(weekStart)} · {list.length}×
            </ThemedText>

            {list.map((s) => (
              <SwipeToDelete key={s.id} onDelete={() => remove(s)} style={styles.swipeable}>
                <Pressable onPress={() => openEntry(s.id)}>
                  {({ pressed }) => (
                    // pressed state tints instead of fading, which would reveal the delete button
                    <ThemedView type={pressed ? 'backgroundSelected' : 'backgroundElement'} style={styles.card}>
                      <View style={styles.cardHead}>
                        <ThemedText type="smallBold" style={styles.date}>
                          {dayLabel(s.date)}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {relativeDay(s.date)}
                        </ThemedText>
                      </View>

                      {s.techniqueIds.length > 0 && (
                        <View style={styles.chips}>
                          {s.techniqueIds.map((id) => {
                            const t = techniques.find((x) => x.id === id);
                            return t && <Chip key={id} small selected label={t.name} color={STATUS_COLOR[t.status]} />;
                          })}
                        </View>
                      )}

                      {s.note && (
                        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
                          {s.note}
                        </ThemedText>
                      )}
                    </ThemedView>
                  )}
                </Pressable>
              </SwipeToDelete>
            ))}
          </View>
        ))}
        </>
      )}
    </Screen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
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
  stats: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, marginTop: Spacing.three, marginBottom: Spacing.two },
  stat: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three },
  statValue: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  statLabel: { fontSize: 12, textAlign: 'center' },
  empty: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one, marginTop: Spacing.three },
  weekHead: { marginTop: Spacing.four, marginBottom: Spacing.two, textTransform: 'uppercase', fontSize: 12 },
  swipeable: { borderRadius: 14, marginBottom: Spacing.two },
  card: { padding: 14, gap: Spacing.two },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  date: { fontSize: 17 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  note: { fontStyle: 'italic' },
});
