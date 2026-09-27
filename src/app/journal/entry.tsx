import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { dayLabel, recentDays, toDateKey } from '@/data/dates';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';

/** Add a training session, or edit one when opened with `?id=`. */
export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const theme = useTheme();
  const existing = useStore((s) => s.sessions.find((x) => x.id === id));
  const sessions = useStore((s) => s.sessions);
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const saveSession = useStore((s) => s.saveSession);
  const removeSession = useStore((s) => s.removeSession);

  const [date, setDate] = useState(existing?.date ?? toDateKey());
  const [picked, setPicked] = useState<string[]>(existing?.techniqueIds ?? []);
  const [note, setNote] = useState(existing?.note ?? '');
  const [query, setQuery] = useState('');

  const days = recentDays(14);
  if (existing && !days.includes(existing.date)) days.push(existing.date);

  const clash = sessions.find((s) => s.date === date && s.id !== existing?.id);
  const canSave = picked.length > 0 || note.trim().length > 0;
  const q = query.trim().toLowerCase();

  const toggle = (tid: string) => setPicked(picked.includes(tid) ? picked.filter((x) => x !== tid) : [...picked, tid]);

  const save = () => {
    if (!canSave) return;
    saveSession({ id: existing?.id, date, techniqueIds: picked, note: note.trim() || undefined });
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    confirm('Usunąć trening?', `Trening z ${dayLabel(existing.date)} zniknie z dziennika.`, 'Usuń', () => {
      removeSession(existing.id);
      router.back();
    });
  };

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: existing ? 'Edytuj trening' : 'Nowy trening',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
              <ThemedText type="small" themeColor="accent">
                Anuluj
              </ThemedText>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={save} disabled={!canSave} hitSlop={10} style={styles.headerButton}>
              <ThemedText type="smallBold" themeColor={canSave ? 'accent' : 'textSecondary'}>
                Zapisz
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="smallBold" themeColor="textSecondary">
          Kiedy
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
          {days.map((d, i) => (
            <Chip key={d} label={i === 0 ? 'Dziś' : i === 1 ? 'Wczoraj' : dayLabel(d)} selected={date === d} onPress={() => setDate(d)} />
          ))}
        </ScrollView>
        {clash && (
          <ThemedText type="small" themeColor="textSecondary">
            Na ten dzień jest już trening — zapis połączy oba wpisy.
          </ThemedText>
        )}

        <View style={styles.sectionHead}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Co ćwiczyłeś · {picked.length}
          </ThemedText>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Szukaj techniki…"
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

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHead}>
          Notatka
        </ThemedText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Co zapamiętać z treningu?"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, styles.note, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        />

        {existing && (
          <Pressable onPress={remove} style={({ pressed }) => [styles.delete, pressed && { opacity: 0.6 }]}>
            <ThemedText type="smallBold" style={styles.deleteText}>
              Usuń trening
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // web headers have no side padding of their own
  headerButton: { paddingHorizontal: Platform.OS === 'web' ? Spacing.three : 0 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  days: { gap: Spacing.two, paddingVertical: Spacing.one },
  sectionHead: { marginTop: Spacing.three },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  group: { gap: Spacing.one, marginTop: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  note: { minHeight: 100, textAlignVertical: 'top' },
  delete: { alignItems: 'center', paddingVertical: Spacing.three, marginTop: Spacing.three },
  deleteText: { color: '#EF4444' },
});
