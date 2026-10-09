import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HeaderButtonPadding, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import type { Status, TechniqueType } from '@/data/types';
import { useConfirmDiscard } from '@/hooks/use-confirm-discard';
import { useStatusColors } from '@/hooks/use-status-colors';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';
import { useT } from '@/i18n';

const TYPES: TechniqueType[] = ['submission', 'sweep', 'escape', 'pass', 'takedown', 'transition'];
const STATUSES: Status[] = ['seen', 'drilling', 'works'];

/** Add a technique, or edit one when opened with `?id=`. */
export default function TechniqueFormScreen() {
  const { id, from: fromParam } = useLocalSearchParams<{ id?: string; from?: string }>();
  const theme = useTheme();
  const statusColor = useStatusColors();
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
  const allowLeave = useConfirmDiscard({ name, type, from, to, status, videoUrl, notes });

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
    allowLeave();
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    confirm(tr.techniques.deleteTitle, tr.techniques.deleteMessage(existing.name), tr.common.delete, () => {
      removeTechnique(existing.id);
      allowLeave();
      // back past the (now deleted) technique's detail screen
      router.dismissAll();
    });
  };

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: existing ? tr.techniques.editTitle : tr.techniques.newTitle,
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
        <Field label={tr.techniques.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={tr.techniques.namePlaceholder}
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            autoFocus={!existing}
          />
        </Field>

        <Field label={tr.techniques.type}>
          <View style={styles.chips}>
            {TYPES.map((t) => (
              <Chip key={t} label={tr.typeSingular[t]} selected={type === t} onPress={() => setType(t)} />
            ))}
          </View>
        </Field>

        <Field label={tr.techniques.from}>
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
          <Field label={tr.techniques.to}>
            <View style={styles.chips}>
              {positions
                .filter((p) => p.id !== from)
                .map((p) => (
                  <Chip key={p.id} small label={p.name} selected={to === p.id} onPress={() => setTo(p.id)} />
                ))}
            </View>
          </Field>
        )}

        <Field label={tr.techniques.status}>
          <View style={styles.chips}>
            {STATUSES.map((s) => (
              <Chip key={s} label={tr.status[s]} color={statusColor[s]} selected={status === s} onPress={() => setStatus(s)} />
            ))}
          </View>
        </Field>

        <Field label={tr.techniques.video}>
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

        <Field label={tr.techniques.notesOptional}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={tr.techniques.notesPlaceholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[inputStyle, styles.notes]}
          />
        </Field>

        {existing && (
          <Pressable onPress={remove} accessibilityRole="button" style={({ pressed }) => [styles.delete, pressed && { opacity: 0.6 }]}>
            <ThemedText type="smallBold" style={styles.deleteText}>
              {tr.techniques.deleteButton}
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
  headerButton: { paddingHorizontal: HeaderButtonPadding },
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six },
  field: { gap: Spacing.two, marginBottom: Spacing.four },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  delete: { alignItems: 'center', paddingVertical: Spacing.three },
  deleteText: { color: '#EF4444' },
});
