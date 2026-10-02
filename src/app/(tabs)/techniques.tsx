import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig, LinearTransition } from 'react-native-reanimated';

import { AddButton } from '@/components/add-button';
import { Chip } from '@/components/chip';
import { DrillList } from '@/components/drill-list';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { StatusChip } from '@/components/status-chip';
import { SwipeToDelete } from '@/components/swipe-to-delete';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { relativeDay } from '@/data/dates';
import { STATUS_COLOR } from '@/data/labels';
import { trainingStats } from '@/data/stats';
import { useStore } from '@/data/store';
import type { Status, TechniqueType } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';
import { useT } from '@/i18n';

const STATUSES: Status[] = ['works', 'drilling', 'seen'];
const TYPES: TechniqueType[] = ['submission', 'sweep', 'escape', 'pass', 'takedown', 'transition'];
const SIDE_COLOR = { top: '#3B82F6', bottom: '#8B5CF6', neutral: '#9CA3AF' };

export default function TechniquesScreen() {
  const theme = useTheme();
  const tr = useT();
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const sessions = useStore((s) => s.sessions);
  const setStatus = useStore((s) => s.setStatus);
  const removeTechnique = useStore((s) => s.removeTechnique);

  const [view, setView] = useState<'techniques' | 'drills'>('techniques');
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [typeFilter, setTypeFilter] = useState<TechniqueType | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => trainingStats(sessions), [sessions]);
  const filtering = !!statusFilter || !!typeFilter;
  const visible = techniques.filter((t) => (!statusFilter || t.status === statusFilter) && (!typeFilter || t.type === typeFilter));
  const counts = STATUSES.map((s) => ({ status: s, n: techniques.filter((t) => t.status === s).length }));

  return (
    <Screen
      title={tr.techniques.title}
      action={
        view === 'drills' ? (
          <AddButton onPress={() => router.push('/drill/form')} accessibilityLabel={tr.drills.add} />
        ) : (
          <AddButton onPress={() => router.push('/technique/form')} accessibilityLabel={tr.techniques.add} />
        )
      }>
      <Segmented
        options={[
          { value: 'techniques', label: tr.techniques.title },
          { value: 'drills', label: tr.drills.title },
        ]}
        value={view}
        onChange={setView}
      />

      {view === 'drills' ? (
        <Animated.View key="drills" entering={FadeIn.duration(200)}>
          <DrillList />
        </Animated.View>
      ) : (
        <Animated.View key="techniques" entering={FadeIn.duration(200)}>
          <View style={styles.progress}>
            {counts.map(({ status, n }) => (
              <View key={status} style={{ flex: n, backgroundColor: STATUS_COLOR[status] }} />
            ))}
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.summary}>
            {tr.techniques.worksSummary(counts[0].n, techniques.length)}
          </ThemedText>

          <View style={styles.chips}>
            {counts.map(({ status, n }) => (
              <Chip
                key={status}
                label={`${tr.status[status]} · ${n}`}
                color={STATUS_COLOR[status]}
                selected={statusFilter === status}
                onPress={() => setStatusFilter(statusFilter === status ? null : status)}
              />
            ))}
          </View>
          <View style={styles.chips}>
            {TYPES.map((type) => (
              <Chip
                key={type}
                small
                label={tr.type[type]}
                selected={typeFilter === type}
                onPress={() => setTypeFilter(typeFilter === type ? null : type)}
              />
            ))}
          </View>

          {/* a filter swaps in the new list with one fade: dozens of rows fading out while the rest
              slid into place left cards too tall, with gaps between them, on iOS */}
          <Animated.View key={`${statusFilter}-${typeFilter}`} entering={FadeIn.duration(200)}>
            <LayoutAnimationConfig skipEntering skipExiting>
              {positions.map((p) => {
                const list = visible.filter((t) => t.from === p.id);
                if (filtering && list.length === 0) return null;
                const all = techniques.filter((t) => t.from === p.id);
                const open = filtering || !collapsed[p.id];

                return (
                  <Animated.View
                    key={p.id}
                    layout={LinearTransition.duration(220)}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(180)}
                    style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                    <Pressable style={styles.cardHead} onPress={() => setCollapsed({ ...collapsed, [p.id]: !collapsed[p.id] })}>
                      <View style={[styles.sideBar, { backgroundColor: SIDE_COLOR[p.side] }]} />
                      <View style={styles.flex}>
                        <ThemedText type="smallBold" style={styles.positionName}>
                          {p.name}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {tr.techniques.positionSummary(all.length, all.filter((t) => t.status === 'works').length)}
                        </ThemedText>
                      </View>
                      <ThemedText themeColor="textSecondary">{open ? '▾' : '▸'}</ThemedText>
                    </Pressable>

                    {open &&
                      list.map((t) => {
                        const s = stats.get(t.id);
                        return (
                          <SwipeToDelete
                            key={t.id}
                            onDelete={() =>
                              confirm(tr.techniques.deleteTitle, tr.techniques.deleteMessage(t.name), tr.common.delete, () => removeTechnique(t.id))
                            }
                            style={[styles.rowContainer, { borderColor: theme.backgroundSelected }]}>
                            <Pressable
                              onPress={() => router.push({ pathname: '/technique/[id]', params: { id: t.id } })}
                              // opaque (also when pressed), so the delete button stays hidden until swiped
                              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement }]}>
                              <View style={styles.flex}>
                                <ThemedText type="smallBold">{t.name}</ThemedText>
                                <ThemedText type="small" themeColor="textSecondary">
                                  {tr.typeSingular[t.type]}
                                  {t.to ? ' → ' + positions.find((x) => x.id === t.to)?.name : ''}
                                  {s ? ` · ${s.count}× · ${relativeDay(s.lastDate!)}` : ` · ${tr.techniques.notTrained}`}
                                </ThemedText>
                              </View>
                              <StatusChip small status={t.status} onChange={(next) => setStatus(t.id, next)} />
                            </Pressable>
                          </SwipeToDelete>
                        );
                      })}
                    {open && all.length === 0 && (
                      <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                        {tr.techniques.noneFromPosition}
                      </ThemedText>
                    )}
                  </Animated.View>
                );
              })}

              {filtering && visible.length === 0 && (
                <ThemedText themeColor="textSecondary" style={styles.empty}>
                  {tr.techniques.noneForFilters}
                </ThemedText>
              )}
            </LayoutAnimationConfig>
          </Animated.View>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progress: { flexDirection: 'row', height: 8, marginTop: Spacing.three, borderRadius: 4, overflow: 'hidden' },
  summary: { marginTop: Spacing.two, marginBottom: Spacing.three },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  card: { borderRadius: 14, marginTop: Spacing.two, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: 14 },
  sideBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  positionName: { fontSize: 17 },
  rowContainer: { borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: 14, paddingVertical: 10 },
  empty: { paddingHorizontal: 14, paddingBottom: 14 },
});
