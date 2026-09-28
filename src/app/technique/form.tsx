import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { STATUS_COLOR } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Status, TechniqueType } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';
import { useT } from '@/i18n';

const TYPES: TechniqueType[] = ['submission', 'sweep', 'escape', 'pass', 'takedown', 'transition'];
const STATUSES: Status[] = ['seen', 'drilling', 'works'];

/** Add a technique, or edit one when opened with `?id=`. */
export default function TechniqueFormScreen() {
  const { id, from: fromParam } = useLocalSearchParams<{ id?: string; from?: string }>();
  const theme = useTheme();
  const tr = useT();
  const positions = useStore((s) => s.positions);
  const existing = useStore((s) => s.techniques.find((t) => t.id === id));
  const addTechnique = useStore((s) => s.addTechnique);
  const updateTechnique = useStore((s) => s.updateTechnique);
  const removeTechnique = useStore((s) => s.removeTechnique);

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<TechniqueType>(existing?.type ?? 'submission');
  const [from, setFrom] = useState(existing?.from ?? fromParam ?? '');
  const [to, setTo] = useState<string | null>(existing?.to ?? null);
  const [status, setStatus] = useState<Status>(existing?.status ?? 'seen');
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const isSubmission = type === 'submission';
  const canSave = name.trim().length > 0 && from !== '' && (isSubmission || to !== null);

  const save = () => {
    if (!canSave) return;
    const url = videoUrl.trim();
    const data = {
      name: name.trim(),
      type,
      from,
      to: isSubmission ? null : to,
      status,
      videoUrl: url ? (/^https?:\/\//.test(url) ? url : `https://${url}`) : undefined,
      notes: notes.trim() || undefined,
    };
    if (existing) updateTechnique(existing.id, data);
    else addTechnique(data);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    confirm('Usunąć technikę?', `„${existing.name}” zniknie też z dziennika i planu.`, 'Usuń', () => {
      removeTechnique(existing.id);
      // back past the (now deleted) technique's detail screen
      router.dismissAll();
    });
  };

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: existing ? 'Edytuj technikę' : 'Nowa technika',
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets>
        <Field label="Nazwa">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="np. Armbar z gardy"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            autoFocus={!existing}
          />
        </Field>

        <Field label="Typ">
          <View style={styles.chips}>
            {TYPES.map((t) => (
              <Chip key={t} label={tr.type[t]} selected={type === t} onPress={() => setType(t)} />
            ))}
          </View>
        </Field>

        <Field label="Z pozycji">
          <View style={styles.chips}>
            {positions.map((p) => (
              <Chip key={p.id} small label={p.name} selected={from === p.id} onPress={() => {
                  setFrom(p.id);
                  if (to === p.id) setTo(null);
                }} />
            ))}
          </View>
        </Field>

        {!isSubmission && (
          <Field label="Kończy się w pozycji">
            <View style={styles.chips}>
              {positions
                .filter((p) => p.id !== from)
                .map((p) => (
                  <Chip key={p.id} small label={p.name} selected={to === p.id} onPress={() => setTo(p.id)} />
                ))}
            </View>
          </Field>
        )}

        <Field label="Status">
          <View style={styles.chips}>
            {STATUSES.map((s) => (
              <Chip key={s} label={tr.status[s]} color={STATUS_COLOR[s]} selected={status === s} onPress={() => setStatus(s)} />
            ))}
          </View>
        </Field>

        <Field label="Link do wideo (opcjonalnie)">
          <TextInput
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://youtube.com/…"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={inputStyle}
          />
        </Field>

        <Field label="Notatki (opcjonalnie)">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Detale, na co uważać…"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[inputStyle, styles.notes]}
          />
        </Field>

        {existing && (
          <Pressable onPress={remove} style={({ pressed }) => [styles.delete, pressed && { opacity: 0.6 }]}>
            <ThemedText type="smallBold" style={styles.deleteText}>
              Usuń technikę
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // web headers have no side padding of their own
  headerButton: { paddingHorizontal: Platform.OS === 'web' ? Spacing.three : 0 },
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six },
  field: { gap: Spacing.two, marginBottom: Spacing.four },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  delete: { alignItems: 'center', paddingVertical: Spacing.three },
  deleteText: { color: '#EF4444' },
});
