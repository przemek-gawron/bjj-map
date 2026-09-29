import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { groupSummaries } from './groups';

import { PositionIllustration } from '@/components/position-illustration';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { STATUS_COLOR } from '@/data/labels';
import type { Position, PositionGroup, Technique } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

type Props = {
  positions: Position[];
  techniques: Technique[];
  onOpen: (group: PositionGroup) => void;
  bottom: number;
};

/** The map's top level: a card per position group with its numbers and where it leads. */
export function GroupBoard({ positions, techniques, onOpen, bottom }: Props) {
  const theme = useTheme();
  const tr = useT();
  const groups = groupSummaries(positions, techniques);

  return (
    <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: bottom + Spacing.three }]}>
      {groups.map((s, i) => (
        <Animated.View key={s.group} entering={FadeIn.duration(200).delay(i * 30)} style={styles.cell}>
          <Pressable
            onPress={() => onOpen(s.group)}
            accessibilityRole="button"
            accessibilityLabel={tr.group[s.group]}
            style={({ pressed }) => [styles.card, { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement }]}>
            <View style={styles.head}>
              <PositionIllustration position={s.positions[0]} width={56} height={39} />
              <View style={styles.flex}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {tr.group[s.group]}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
                  {tr.map.groupMeta(s.positions.length, s.techniques)}
                </ThemedText>
              </View>
            </View>

            {s.techniques > 0 && (
              <View style={[styles.progress, { backgroundColor: theme.backgroundSelected }]}>
                <View style={{ flex: s.works, backgroundColor: STATUS_COLOR.works }} />
                <View style={{ flex: s.techniques - s.works }} />
              </View>
            )}

            <View style={styles.leads}>
              {s.leadsTo.slice(0, 3).map((l) => (
                <ThemedText key={l.group} type="small" themeColor="textSecondary" numberOfLines={1} style={styles.lead}>
                  → {tr.group[l.group]} · {l.count}
                </ThemedText>
              ))}
              {s.submissions > 0 && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.lead}>
                  🔒 {tr.map.groupSubmissions(s.submissions)}
                </ThemedText>
              )}
            </View>
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grid: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.three - 4,
  },
  cell: { width: '50%', padding: 4 },
  card: { borderRadius: 14, padding: Spacing.two + 2, gap: Spacing.two, minHeight: 150 },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  meta: { fontSize: 12 },
  progress: { flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden' },
  leads: { gap: 2 },
  lead: { fontSize: 12 },
});
