import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HeaderButtonPadding, MaxContentWidth, Spacing } from '@/constants/theme';
import { toDateKey, weekStartOf } from '@/data/dates';
import { STATUS_COLOR } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Technique } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

/** Toggles techniques and drills in this week's plan; changes apply immediately. */
export default function PlanPickScreen() {
  const theme = useTheme();
  const tr = useT();
  const plan = useStore((s) => s.plan);
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const drills = useStore((s) => s.drills);
  const togglePlanned = useStore((s) => s.togglePlanned);
  const togglePlannedDrill = useStore((s) => s.togglePlannedDrill);
  const [query, setQuery] = useState('');

  const isCurrent = plan.weekStart === weekStartOf(toDateKey());
  const planned = isCurrent ? plan.techniqueIds : [];
  const plannedDrills = isCurrent ? (plan.drillIds ?? []) : [];
  const q = query.trim().toLowerCase();
  const matches = (t: Technique) => !q || t.name.toLowerCase().includes(q);
  const drilling = techniques.filter((t) => t.status === 'drilling' && matches(t));
  const visibleDrills = drills.filter((d) => !q || d.name.toLowerCase().includes(q));

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
          {tr.plan.picked(planned.length + plannedDrills.length)}
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

        {visibleDrills.length > 0 && (
          <View style={styles.group}>
            <ThemedText type="smallBold" themeColor="accent">
              {tr.plan.drills}
            </ThemedText>
            <View style={styles.chips}>
              {visibleDrills.map((d) => (
                <Chip key={d.id} label={d.name} selected={plannedDrills.includes(d.id)} onPress={() => togglePlannedDrill(d.id)} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerButton: { paddingHorizontal: HeaderButtonPadding },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  group: { gap: Spacing.one, marginTop: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
