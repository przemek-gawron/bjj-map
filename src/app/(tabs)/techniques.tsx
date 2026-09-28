import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddButton } from '@/components/add-button';
import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { relativeDay } from '@/data/dates';
import { STATUS_COLOR, STATUS_LABEL, TYPE_LABEL } from '@/data/labels';
import { trainingStats } from '@/data/stats';
import { useStore } from '@/data/store';
import type { Status, TechniqueType } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

const STATUSES: Status[] = ['works', 'drilling', 'seen'];
const TYPES: TechniqueType[] = ['submission', 'sweep', 'escape', 'pass', 'takedown', 'transition'];
const SIDE_COLOR = { top: '#3B82F6', bottom: '#8B5CF6', neutral: '#9CA3AF' };

export default function TechniquesScreen() {
  const theme = useTheme();
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const sessions = useStore((s) => s.sessions);
  const setStatus = useStore((s) => s.setStatus);

  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [typeFilter, setTypeFilter] = useState<TechniqueType | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => trainingStats(sessions), [sessions]);
  const filtering = !!statusFilter || !!typeFilter;
  const visible = techniques.filter((t) => (!statusFilter || t.status === statusFilter) && (!typeFilter || t.type === typeFilter));
  const counts = STATUSES.map((s) => ({ status: s, n: techniques.filter((t) => t.status === s).length }));

  return (
    <Screen
      title="Techniki"
      action={
        <AddButton onPress={() => router.push('/technique/form')} accessibilityLabel="Dodaj technikę" />
      }>
      <View style={styles.progress}>
        {counts.map(({ status, n }) => (
          <View key={status} style={{ flex: n, backgroundColor: STATUS_COLOR[status] }} />
        ))}
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.summary}>
        {counts[0].n} z {techniques.length} technik działa w sparingu
      </ThemedText>

      <View style={styles.chips}>
        {counts.map(({ status, n }) => (
          <Chip
            key={status}
            label={`${STATUS_LABEL[status]} · ${n}`}
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
            label={TYPE_LABEL[type]}
            selected={typeFilter === type}
            onPress={() => setTypeFilter(typeFilter === type ? null : type)}
          />
        ))}
      </View>

      {positions.map((p) => {
        const list = visible.filter((t) => t.from === p.id);
        if (filtering && list.length === 0) return null;
        const all = techniques.filter((t) => t.from === p.id);
        const open = filtering || !collapsed[p.id];

        return (
          <ThemedView key={p.id} type="backgroundElement" style={styles.card}>
            <Pressable style={styles.cardHead} onPress={() => setCollapsed({ ...collapsed, [p.id]: !collapsed[p.id] })}>
              <View style={[styles.sideBar, { backgroundColor: SIDE_COLOR[p.side] }]} />
              <View style={styles.flex}>
                <ThemedText type="smallBold" style={styles.positionName}>
                  {p.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {all.length} technik · {all.filter((t) => t.status === 'works').length} działa
                </ThemedText>
              </View>
              <ThemedText themeColor="textSecondary">{open ? '▾' : '▸'}</ThemedText>
            </Pressable>

            {open &&
              list.map((t) => {
                const s = stats.get(t.id);
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => router.push({ pathname: '/technique/[id]', params: { id: t.id } })}
                    style={({ pressed }) => [styles.row, { borderColor: theme.backgroundSelected }, pressed && styles.pressed]}>
                      <View style={styles.flex}>
                        <ThemedText type="smallBold">{t.name}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {TYPE_LABEL[t.type]}
                          {t.to ? ' → ' + positions.find((x) => x.id === t.to)?.name : ''}
                          {s ? ` · ${s.count}× · ${relativeDay(s.lastDate!)}` : ' · nie trenowane'}
                        </ThemedText>
                      </View>
                    <StatusChip small status={t.status} onChange={(next) => setStatus(t.id, next)} />
                  </Pressable>
                );
              })}
            {open && all.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                Brak technik z tej pozycji.
              </ThemedText>
            )}
          </ThemedView>
        );
      })}

      {filtering && visible.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Brak technik dla tych filtrów.
        </ThemedText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progress: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  summary: { marginTop: Spacing.two, marginBottom: Spacing.three },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  card: { borderRadius: 14, marginTop: Spacing.two, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: 14 },
  sideBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  positionName: { fontSize: 17 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pressed: { opacity: 0.6 },
  empty: { paddingHorizontal: 14, paddingBottom: 14 },
});
