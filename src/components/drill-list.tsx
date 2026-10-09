import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SwipeToDelete } from '@/components/swipe-to-delete';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { relativeDay } from '@/data/dates';
import { searchMatcher } from '@/data/search';
import { drillIdsOf, trainingStats } from '@/data/stats';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';
import { useT } from '@/i18n';

/** All drills with search; tap opens a drill, swipe deletes it. */
export function DrillList() {
  const theme = useTheme();
  const tr = useT();
  const drills = useStore((s) => s.drills);
  const positions = useStore((s) => s.positions);
  const sessions = useStore((s) => s.sessions);
  const removeDrill = useStore((s) => s.removeDrill);
  const [query, setQuery] = useState('');

  const stats = useMemo(() => trainingStats(sessions, drillIdsOf), [sessions]);
  const matches = searchMatcher(query);
  const visible = drills.filter((d) => matches(d.name));

  const where = (positionIds: string[]) => {
    const names = positions.filter((p) => positionIds.includes(p.id)).map((p) => p.name);
    if (names.length === 0) return tr.drills.noLinks;
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ');
  };

  return (
    <View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.summary}>
        {tr.drills.summary(drills.length)}
      </ThemedText>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={tr.drills.search}
        placeholderTextColor={theme.textSecondary}
        autoCorrect={false}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
      />

      {visible.map((d) => {
        const s = stats.get(d.id);
        return (
          <SwipeToDelete
            key={d.id}
            onDelete={() => confirm(tr.drills.deleteTitle, tr.drills.deleteMessage(d.name), tr.common.delete, () => removeDrill(d.id))}
            style={styles.swipeable}>
            <Pressable
              onPress={() => router.push({ pathname: '/drill/[id]', params: { id: d.id } })}
              // opaque (also when pressed), so the delete button stays hidden until swiped
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement }]}>
              <View style={styles.head}>
                <ThemedText type="smallBold" style={styles.flex}>
                  {d.name}
                </ThemedText>
                {d.dose && (
                  <ThemedText type="small" themeColor="accent">
                    {d.dose}
                  </ThemedText>
                )}
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {where(d.positionIds)} · {s ? `${s.count}× · ${relativeDay(s.lastDate!)}` : tr.drills.notDone}
              </ThemedText>
            </Pressable>
          </SwipeToDelete>
        );
      })}

      {visible.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          {query.trim() ? tr.drills.noneForSearch : tr.drills.empty}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { marginTop: Spacing.three, marginBottom: Spacing.two },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: Spacing.one },
  swipeable: { borderRadius: 14, marginTop: Spacing.two },
  row: { paddingHorizontal: 14, paddingVertical: 12, gap: 2 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  empty: { marginTop: Spacing.three },
});
