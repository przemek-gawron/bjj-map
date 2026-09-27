// PROTOTYPE — Variant B: position list (accordion). Progress on top, filter by status, techniques grouped by type.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NEXT_STATUS, positions, STATUS_COLOR, STATUS_LABEL, TYPE_LABEL, type Status, type TechniqueType } from './data';
import { StatusChip, VideoLink } from './shared';
import type { VariantProps } from './types';

export const name = 'Lista pozycji';

const TYPE_ORDER: TechniqueType[] = ['submission', 'sweep', 'pass', 'escape', 'transition'];

export function VariantB({ techniques, setStatus }: VariantProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({ cg: true });
  const [filter, setFilter] = useState<Status | null>(null);

  const counts = (['works', 'drilling', 'seen'] as Status[]).map((s) => ({ s, n: techniques.filter((t) => t.status === s).length }));
  const total = techniques.length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Moje techniki</Text>

      <View style={styles.progress}>
        {counts.map(({ s, n }) => (
          <View key={s} style={{ flex: n, backgroundColor: STATUS_COLOR[s] }} />
        ))}
      </View>
      <View style={styles.filters}>
        {counts.map(({ s, n }) => (
          <Pressable
            key={s}
            onPress={() => setFilter(filter === s ? null : s)}
            style={[styles.filter, filter === s && { backgroundColor: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] }]}>
            <Text style={[styles.filterText, filter === s && { color: '#FFFFFF' }]}>
              {STATUS_LABEL[s]} · {n}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sub}>{counts[0].n} z {total} technik działa w sparingu</Text>

      {positions.map((p) => {
        const list = techniques.filter((t) => t.from === p.id && (!filter || t.status === filter));
        if (filter && list.length === 0) return null;
        const all = techniques.filter((t) => t.from === p.id);
        const works = all.filter((t) => t.status === 'works').length;
        const isOpen = open[p.id] || !!filter;
        return (
          <View key={p.id} style={styles.card}>
            <Pressable style={styles.cardHead} onPress={() => setOpen({ ...open, [p.id]: !open[p.id] })}>
              <View style={[styles.sideBar, { backgroundColor: p.side === 'top' ? '#3B82F6' : p.side === 'bottom' ? '#8B5CF6' : '#9CA3AF' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.posName}>{p.name}</Text>
                <Text style={styles.posMeta}>
                  {all.length} technik · {works} działa
                </Text>
              </View>
              <Text style={styles.chevron}>{isOpen ? '▾' : '▸'}</Text>
            </Pressable>

            {isOpen &&
              TYPE_ORDER.map((type) => {
                const group = list.filter((t) => t.type === type);
                if (!group.length) return null;
                return (
                  <View key={type} style={styles.group}>
                    <Text style={styles.groupLabel}>{TYPE_LABEL[type]}</Text>
                    {group.map((t) => (
                      <View key={t.id} style={styles.row}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.techName}>{t.name}</Text>
                          {t.to && <Text style={styles.techMeta}>→ {positions.find((x) => x.id === t.to)?.name}</Text>}
                        </View>
                        <VideoLink technique={t} />
                        <StatusChip status={t.status} small onPress={() => setStatus(t.id, NEXT_STATUS[t.status])} />
                      </View>
                    ))}
                  </View>
                );
              })}
            {isOpen && all.length === 0 && <Text style={styles.empty}>Nic jeszcze. + Dodaj technikę</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 140, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  progress: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filter: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFFFFF' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  sub: { color: '#6B7280', marginTop: 8, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  sideBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  posName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  posMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  chevron: { fontSize: 18, color: '#9CA3AF' },
  group: { paddingHorizontal: 14, paddingBottom: 10 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB' },
  techName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  techMeta: { fontSize: 12, color: '#6B7280' },
  empty: { paddingHorizontal: 14, paddingBottom: 14, color: '#6B7280' },
});
