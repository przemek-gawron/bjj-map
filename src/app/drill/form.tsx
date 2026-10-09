import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HeaderButtonPadding, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useConfirmDiscard } from '@/hooks/use-confirm-discard';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';
import { useT } from '@/i18n';

/** Add a drill, or edit one when opened with `?id=`. `?position=` / `?technique=` preselect a link. */
export default function DrillFormScreen() {
  const { id, position, technique } = useLocalSearchParams<{ id?: string; position?: string; technique?: string }>();
  const theme = useTheme();
  const tr = useT();
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const existing = useStore((s) => s.drills.find((d) => d.id === id));
  const addDrill = useStore((s) => s.addDrill);
  const updateDrill = useStore((s) => s.updateDrill);
  const removeDrill = useStore((s) => s.removeDrill);

  const [name, setName] = useState(existing?.name ?? '');
  const [dose, setDose] = useState(existing?.dose ?? '');
  const [positionIds, setPositionIds] = useState<string[]>(existing?.positionIds ?? (position ? [position] : []));
  const [techniqueIds, setTechniqueIds] = useState<string[]>(existing?.techniqueIds ?? (technique ? [technique] : []));
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const allowLeave = useConfirmDiscard({ name, dose, positionIds, techniqueIds, videoUrl, notes });

  const canSave = name.trim().length > 0;
  const toggle = (ids: string[], x: string) => (ids.includes(x) ? ids.filter((i) => i !== x) : [...ids, x]);

  const save = () => {
    if (!canSave) return;
    const url = videoUrl.trim();
    const data = {
      name: name.trim(),
      dose: dose.trim() || undefined,
      positionIds,
      techniqueIds,
      videoUrl: url ? (/^https?:\/\//.test(url) ? url : `https://${url}`) : undefined,
      notes: notes.trim() || undefined,
    };
    if (existing) updateDrill(existing.id, data);
    else addDrill(data);
    allowLeave();
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    confirm(tr.drills.deleteTitle, tr.drills.deleteMessage(existing.name), tr.common.delete, () => {
      removeDrill(existing.id);
      allowLeave();
      // back past the (now deleted) drill's detail screen
      router.dismissAll();
    });
  };

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: existing ? tr.drills.editTitle : tr.drills.newTitle,
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
        <Field label={tr.drills.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={tr.drills.namePlaceholder}
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            autoFocus={!existing}
          />
        </Field>

        <Field label={tr.drills.dose}>
          <TextInput
            value={dose}
            onChangeText={setDose}
            placeholder={tr.drills.dosePlaceholder}
            placeholderTextColor={theme.textSecondary}
            autoCorrect={false}
            style={inputStyle}
          />
        </Field>

        <Field label={tr.drills.positions}>
          <View style={styles.chips}>
            {positions.map((p) => (
              <Chip
                key={p.id}
                small
                label={p.name}
                selected={positionIds.includes(p.id)}
                onPress={() => setPositionIds(toggle(positionIds, p.id))}
              />
            ))}
          </View>
        </Field>

        <Field label={tr.drills.techniques}>
          {positions.map((p) => {
            const list = techniques.filter((t) => t.from === p.id);
            if (list.length === 0) return null;
            return (
              <View key={p.id} style={styles.group}>
                <ThemedText type="small" themeColor="textSecondary">
                  {p.name}
                </ThemedText>
                <View style={styles.chips}>
                  {list.map((t) => (
                    <Chip
                      key={t.id}
                      small
                      label={t.name}
                      selected={techniqueIds.includes(t.id)}
                      onPress={() => setTechniqueIds(toggle(techniqueIds, t.id))}
                    />
                  ))}
                </View>
              </View>
            );
          })}
          <ThemedText type="small" themeColor="textSecondary">
            {tr.drills.linksHint}
          </ThemedText>
        </Field>

        <Field label={tr.drills.video}>
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

        <Field label={tr.drills.notesOptional}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={tr.drills.notesPlaceholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[inputStyle, styles.notes]}
          />
        </Field>

        {existing && (
          <Pressable onPress={remove} accessibilityRole="button" style={({ pressed }) => [styles.delete, pressed && { opacity: 0.6 }]}>
            <ThemedText type="smallBold" style={styles.deleteText}>
              {tr.drills.deleteButton}
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
  group: { gap: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  delete: { alignItems: 'center', paddingVertical: Spacing.three },
  deleteText: { color: '#EF4444' },
});
