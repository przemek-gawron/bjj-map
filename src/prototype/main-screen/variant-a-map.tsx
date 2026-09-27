// PROTOTYPE — Variant A: graph map. Positions = nodes, techniques = arrows. Tap a node → bottom sheet.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Marker, Path } from 'react-native-svg';

import { NEXT_STATUS, positions, STATUS_COLOR, TYPE_LABEL, type Position } from './data';
import { StatusChip, VideoLink } from './shared';
import type { VariantProps } from './types';

export const name = 'Mapa (graf)';

const NODE_W = 170;
const NODE_H = 52;
const CANVAS_W = 720;
const CANVAS_H = 720;

const center = (p: Position) => ({ x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 });

export function VariantA({ techniques, setStatus }: VariantProps) {
  const [selected, setSelected] = useState<string | null>('cg');
  const selectedPos = positions.find((p) => p.id === selected);
  const edges = techniques.filter((t) => t.to);

  // offset parallel edges (same from→to) so they don't overlap
  const pairIndex: Record<string, number> = {};
  const edgeGeom = edges.map((t) => {
    const key = t.from + '>' + t.to;
    const i = (pairIndex[key] = (pairIndex[key] ?? -1) + 1);
    const a = center(positions.find((p) => p.id === t.from)!);
    const b = center(positions.find((p) => p.id === t.to)!);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = 40 + i * 50;
    const cx = mx - (dy / len) * bend;
    const cy = my + (dx / len) * bend;
    // label sits at the curve midpoint (t = 0.5 on a quadratic bezier)
    const lx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x;
    const ly = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
    return { t, d: `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`, lx, ly };
  });

  return (
    <View style={styles.root}>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Moja mapa</Text>
        <Text style={styles.legendHint}>lewo = jestem na dole · prawo = jestem na górze · dotknij pozycji</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 320 }}>
        <ScrollView horizontal contentContainerStyle={{ width: CANVAS_W, height: CANVAS_H }}>
          <Svg width={CANVAS_W} height={CANVAS_H} style={StyleSheet.absoluteFill}>
            <Defs>
              <Marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <Path d="M 0 0 L 10 5 L 0 10 z" fill="#6B7280" />
              </Marker>
            </Defs>
            {edgeGeom.map(({ t, d }) => (
              <Path
                key={t.id}
                d={d}
                stroke={STATUS_COLOR[t.status]}
                strokeWidth={selected && (t.from === selected || t.to === selected) ? 3 : 1.5}
                strokeDasharray={t.status === 'seen' ? '6 4' : undefined}
                fill="none"
                opacity={selected && t.from !== selected && t.to !== selected ? 0.25 : 1}
                markerEnd="url(#arrow)"
              />
            ))}
          </Svg>

          {edgeGeom.map(({ t, lx, ly }) => (
            <View key={t.id} pointerEvents="none" style={[styles.edgeLabel, { left: lx - 60, top: ly - 10 }]}>
              <Text numberOfLines={1} style={[styles.edgeLabelText, { color: STATUS_COLOR[t.status] }]}>
                {t.name}
              </Text>
            </View>
          ))}

          {positions.map((p) => {
            const subs = techniques.filter((t) => t.from === p.id && !t.to);
            const active = p.id === selected;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelected(active ? null : p.id)}
                style={[
                  styles.node,
                  { left: p.x, top: p.y },
                  p.side === 'top' && styles.nodeTop,
                  p.side === 'bottom' && styles.nodeBottom,
                  active && styles.nodeActive,
                ]}>
                <Text style={[styles.nodeText, active && { color: '#FFFFFF' }]}>{p.name}</Text>
                {subs.length > 0 && (
                  <View style={styles.subsRow}>
                    {subs.map((s) => (
                      <View key={s.id} style={[styles.subDot, { backgroundColor: STATUS_COLOR[s.status] }]} />
                    ))}
                    <Text style={styles.subsText}>🔒 {subs.length}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </ScrollView>

      {selectedPos && (
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{selectedPos.name}</Text>
          <ScrollView>
            {techniques.filter((t) => t.from === selectedPos.id).length === 0 && (
              <Text style={styles.empty}>Brak technik z tej pozycji. Dodaj po następnym treningu.</Text>
            )}
            {techniques
              .filter((t) => t.from === selectedPos.id)
              .map((t) => (
                <View key={t.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{t.name}</Text>
                    <Text style={styles.rowMeta}>
                      {TYPE_LABEL[t.type]} {t.to ? '→ ' + positions.find((p) => p.id === t.to)?.name : '· kończenie'}
                    </Text>
                  </View>
                  <VideoLink technique={t} />
                  <StatusChip status={t.status} small onPress={() => setStatus(t.id, NEXT_STATUS[t.status])} />
                </View>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAF9' },
  legend: { padding: 16, paddingBottom: 8 },
  legendTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  legendHint: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  node: {
    position: 'absolute',
    width: NODE_W,
    minHeight: NODE_H,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    padding: 8,
    justifyContent: 'center',
  },
  nodeTop: { borderColor: '#3B82F6' },
  nodeBottom: { borderColor: '#8B5CF6' },
  nodeActive: { backgroundColor: '#111827' },
  nodeText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  subsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  subDot: { width: 8, height: 8, borderRadius: 4 },
  subsText: { fontSize: 11, color: '#6B7280', marginLeft: 4 },
  edgeLabel: { position: 'absolute', width: 120, alignItems: 'center' },
  edgeLabelText: { fontSize: 10, fontWeight: '700', backgroundColor: '#FAFAF9', paddingHorizontal: 3 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 110,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: '#111827' },
  empty: { color: '#6B7280' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB' },
  rowName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowMeta: { fontSize: 12, color: '#6B7280' },
});
