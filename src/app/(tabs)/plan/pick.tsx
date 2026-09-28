import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { toDateKey, weekStartOf } from '@/data/dates';
import { STATUS_COLOR } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Technique } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

/** Toggles techniques in this week's plan; changes apply immediately. */
export default function PlanPickScreen() {
  const theme = useTheme();
  const tr = useT();
  const plan = useStore((s) => s.plan);
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const togglePlanned = useStore((s) => s.togglePlanned);
  const [query, setQuery] = useState('');

  const planned = plan.weekStart === weekStartOf(toDateKey()) ? plan.techniqueIds : [];
  const q = query.trim().toLowerCase();
  const matches = (t: Technique) => !q || t.name.toLowerCase().includes(q);
  const drilling = techniques.filter((t) => t.status === 'drilling' && matches(t));

  const chip = (t: Technique) => (
    <Chip key={t.id} label={t.name} selected={planned.includes(t.id)} onPress={() => togglePlanned(t.id)} />
  );

  return (
    <ThemedView style={styles.root}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
              <ThemedText type="smallBold" themeColor="accent">
                {tr.plan.done}
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
        <ThemedText type="small" themeColor="textSecondary">
          {tr.plan.picked(planned.length)}
        </ThemedText>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={tr.plan.search}
          placeholderTextColor={theme.textSecondary}
          autoCorrect={false}
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        />

        {drilling.length > 0 && (
          <View style={styles.group}>
            <ThemedText type="smallBold" style={{ color: STATUS_COLOR.drilling }}>
              {tr.plan.drillingNow}
            </ThemedText>
            <View style={styles.chips}>{drilling.map(chip)}</View>
          </View>
        )}

        {positions.map((p) => {
          const list = techniques.filter((t) => t.from === p.id && matches(t));
          if (list.length === 0) return null;
          return (
            <View key={p.id} style={styles.group}>
              <ThemedText type="small" themeColor="textSecondary">
                {p.name}
              </ThemedText>
              <View style={styles.chips}>{list.map(chip)}</View>
            </View>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // web headers have no side padding of their own
  headerButton: { paddingHorizontal: Platform.OS === 'web' ? Spacing.three : 0 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  group: { gap: Spacing.one, marginTop: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
