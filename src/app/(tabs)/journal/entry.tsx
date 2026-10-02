import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Chip } from '@/components/chip';
import { MonthCalendar } from '@/components/month-calendar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HeaderButtonPadding, MaxContentWidth, Spacing } from '@/constants/theme';
import { dayLabel, recentDays, toDateKey } from '@/data/dates';
import { DEFAULT_SESSION_MINUTES, formatHours, SESSION_MINUTES } from '@/data/stats';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';
import { useT } from '@/i18n';

/** Add a training session, or edit one when opened with `?id=`. */
export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const theme = useTheme();
  const tr = useT();
  const existing = useStore((s) => s.sessions.find((x) => x.id === id));
  const sessions = useStore((s) => s.sessions);
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const drills = useStore((s) => s.drills);
  const saveSession = useStore((s) => s.saveSession);
  const removeSession = useStore((s) => s.removeSession);

  const [date, setDate] = useState(existing?.date ?? toDateKey());
  const [picked, setPicked] = useState<string[]>(existing?.techniqueIds ?? []);
  const [pickedDrills, setPickedDrills] = useState<string[]>(existing?.drillIds ?? []);
  const [note, setNote] = useState(existing?.note ?? '');
  const [duration, setDuration] = useState(existing?.durationMin ?? DEFAULT_SESSION_MINUTES);
  const [query, setQuery] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [month, setMonth] = useState(date.slice(0, 7));

  // quick picks for the last week; any other day comes from the calendar
  const days = recentDays(7);
  const trainingDays = new Set(sessions.map((s) => s.date));

  const clash = sessions.find((s) => s.date === date && s.id !== existing?.id);
  const canSave = picked.length > 0 || pickedDrills.length > 0 || note.trim().length > 0;
  const q = query.trim().toLowerCase();

  const toggle = (tid: string) => setPicked(picked.includes(tid) ? picked.filter((x) => x !== tid) : [...picked, tid]);
  const toggleDrill = (did: string) =>
    setPickedDrills(pickedDrills.includes(did) ? pickedDrills.filter((x) => x !== did) : [...pickedDrills, did]);
  const visibleDrills = drills.filter((d) => !q || d.name.toLowerCase().includes(q));

  const save = () => {
    if (!canSave) return;
    saveSession({ id: existing?.id, date, techniqueIds: picked, drillIds: pickedDrills, note: note.trim() || undefined, durationMin: duration });
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    confirm(tr.journal.deleteTitle, tr.journal.deleteMessage(dayLabel(existing.date)), tr.common.delete, () => {
      removeSession(existing.id);
      router.back();
    });
  };

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: existing ? tr.journal.editTitle : tr.journal.newTitle,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.headerButton}>
              <ThemedText type="small" themeColor="accent">
                {tr.common.cancel}
              </ThemedText>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={save} disabled={!canSave} hitSlop={10} accessibilityRole="button" style={styles.headerButton}>
              <ThemedText type="smallBold" themeColor={canSave ? 'accent' : 'textSecondary'}>
                {tr.common.save}
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets>
        <View style={styles.dateHead}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {tr.journal.when(dayLabel(date))}
          </ThemedText>
          <Pressable onPress={() => setCalendarOpen(!calendarOpen)} hitSlop={10} accessibilityRole="button">
            <ThemedText type="smallBold" themeColor="accent">
              {calendarOpen ? tr.journal.hideCalendar : tr.journal.showCalendar}
            </ThemedText>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
          {days.map((d, i) => (
            <Chip key={d} label={i === 0 ? tr.journal.today : i === 1 ? tr.journal.yesterday : dayLabel(d)} selected={date === d} onPress={() => setDate(d)} />
          ))}
        </ScrollView>
        {calendarOpen && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[styles.calendar, { backgroundColor: theme.backgroundElement }]}>
            <MonthCalendar month={month} onMonthChange={setMonth} marked={trainingDays} selected={date} onSelect={setDate} />
          </Animated.View>
        )}
        {clash && (
          <ThemedText type="small" themeColor="textSecondary">
            {tr.journal.clash}
          </ThemedText>
        )}

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHead}>
          {tr.journal.duration}
        </ThemedText>
        <View style={styles.chips}>
          {SESSION_MINUTES.map((m) => (
            <Chip key={m} label={`${formatHours(m / 60)} h`} selected={duration === m} onPress={() => setDuration(m)} />
          ))}
        </View>

        <View style={styles.sectionHead}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {tr.journal.practiced(picked.length)}
          </ThemedText>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={tr.journal.search}
          placeholderTextColor={theme.textSecondary}
          autoCorrect={false}
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        />
        {positions.map((p) => {
          const list = techniques.filter((t) => t.from === p.id && (!q || t.name.toLowerCase().includes(q)));
          if (list.length === 0) return null;
          return (
            <View key={p.id} style={styles.group}>
              <ThemedText type="small" themeColor="textSecondary">
                {p.name}
              </ThemedText>
              <View style={styles.chips}>
                {list.map((t) => (
                  <Chip key={t.id} label={t.name} selected={picked.includes(t.id)} onPress={() => toggle(t.id)} />
                ))}
              </View>
            </View>
          );
        })}

        {visibleDrills.length > 0 && (
          <View style={styles.group}>
            <ThemedText type="small" themeColor="textSecondary">
              {tr.journal.drills(pickedDrills.length)}
            </ThemedText>
            <View style={styles.chips}>
              {visibleDrills.map((d) => (
                <Chip key={d.id} label={d.name} selected={pickedDrills.includes(d.id)} onPress={() => toggleDrill(d.id)} />
              ))}
            </View>
          </View>
        )}

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHead}>
          {tr.journal.note}
        </ThemedText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={tr.journal.notePlaceholder}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, styles.note, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        />

        {existing && (
          <Pressable onPress={remove} accessibilityRole="button" style={({ pressed }) => [styles.delete, pressed && { opacity: 0.6 }]}>
            <ThemedText type="smallBold" style={styles.deleteText}>
              {tr.journal.deleteButton}
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerButton: { paddingHorizontal: HeaderButtonPadding },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  dateHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  days: { gap: Spacing.two, paddingVertical: Spacing.one },
  calendar: { borderRadius: 14, padding: Spacing.three },
  sectionHead: { marginTop: Spacing.three },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  group: { gap: Spacing.one, marginTop: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  note: { minHeight: 100, textAlignVertical: 'top' },
  delete: { alignItems: 'center', paddingVertical: Spacing.three, marginTop: Spacing.three },
  deleteText: { color: '#EF4444' },
});
