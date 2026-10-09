import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HeaderButtonPadding, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useConfirmDiscard } from '@/hooks/use-confirm-discard';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

/** Rename a position and edit its description. */
export default function PositionFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const tr = useT();
  const position = useStore((s) => s.positions.find((p) => p.id === id));
  const updatePosition = useStore((s) => s.updatePosition);

  const [name, setName] = useState(position?.name ?? '');
  const [notes, setNotes] = useState(position?.notes ?? '');
  const allowLeave = useConfirmDiscard({ name, notes });

  const canSave = !!position && name.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    updatePosition(position.id, { name: name.trim(), notes: notes.trim() || undefined });
    allowLeave();
    router.back();
  };

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          title: tr.map.positionTitle,
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
        <View style={styles.field}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {tr.map.positionName}
          </ThemedText>
          <TextInput value={name} onChangeText={setName} style={inputStyle} />
        </View>
        <View style={styles.field}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {tr.map.positionNotes}
          </ThemedText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={tr.map.positionNotesPlaceholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            autoFocus={!position?.notes}
            style={[inputStyle, styles.notes]}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerButton: { paddingHorizontal: HeaderButtonPadding },
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six },
  field: { gap: Spacing.two, marginBottom: Spacing.four },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  notes: { minHeight: 160, textAlignVertical: 'top' },
});
