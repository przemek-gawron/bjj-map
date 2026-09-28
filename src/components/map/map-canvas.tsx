import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, type GestureType } from 'react-native-gesture-handler';
import Animated, { type SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Marker, Path } from 'react-native-svg';

import { buildEdges, canvasBounds, NODE_H, NODE_W, tidyLayout } from './geometry';

import { PositionIllustration } from '@/components/position-illustration';
import { STATUS_COLOR } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Position, Status, Technique } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;
const SIDE_COLOR = { top: '#3B82F6', bottom: '#8B5CF6', neutral: '#9CA3AF' };
const STATUSES: Status[] = ['seen', 'drilling', 'works'];

type Props = {
  positions: Position[];
  techniques: Technique[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isPositionActive: (p: Position) => boolean;
  isTechniqueActive: (t: Technique) => boolean;
  /** Space kept free at the bottom (tab bar / sheet) for the zoom controls. */
  controlsBottom: number;
};

type Drag = { id: string; x: number; y: number };

export function MapCanvas({ positions, techniques, selectedId, onSelect, isPositionActive, isTechniqueActive, controlsBottom }: Props) {
  const theme = useTheme();
  const tr = useT();
  const [drag, setDrag] = useState<Drag | null>(null);
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  // the node being dragged renders from local state; everything else from the store
  const layout = useMemo(() => {
    const l: Record<string, { x: number; y: number }> = {};
    for (const p of positions) l[p.id] = drag?.id === p.id ? { x: drag.x, y: drag.y } : p.layout;
    return l;
  }, [positions, drag]);
  const edges = useMemo(() => buildEdges(techniques, layout), [techniques, layout]);
  const bounds = canvasBounds(layout);
  const svgKey =
    edges.map((e) => `${isTechniqueActive(e.technique) ? 1 : 0}${e.technique.status[0]}`).join('') +
    selectedId +
    positions.map((p) => `${Math.round(layout[p.id].x)},${Math.round(layout[p.id].y)}`).join(';');

  // ---- viewport transform (UI thread) ----
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const start = useSharedValue({ x: 0, y: 0, s: 1, fx: 0, fy: 0 });

  const canvasPan = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onStart(() => {
          start.set({ x: tx.get(), y: ty.get(), s: scale.get(), fx: 0, fy: 0 });
        })
        .onUpdate((e) => {
          tx.set(start.get().x + e.translationX);
          ty.set(start.get().y + e.translationY);
        }),
    [tx, ty, scale, start]
  );
  const canvasPinch = useMemo(
    () =>
      Gesture.Pinch()
        .onStart((e) => {
          start.set({ x: tx.get(), y: ty.get(), s: scale.get(), fx: e.focalX, fy: e.focalY });
        })
        .onUpdate((e) => {
          const s0 = start.get();
          const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s0.s * e.scale));
          // keep the pinch focal point fixed on screen
          tx.set(s0.fx - (s0.fx - s0.x) * (s / s0.s));
          ty.set(s0.fy - (s0.fy - s0.y) * (s / s0.s));
          scale.set(s);
        }),
    [tx, ty, scale, start]
  );
  // double tap zooms in 2× around the tapped point; at full zoom it zooms back out
  const canvasDoubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .onEnd((e) => {
          const s0 = scale.get();
          const s = s0 >= MAX_SCALE * 0.95 ? Math.max(MIN_SCALE, s0 / 4) : Math.min(MAX_SCALE, s0 * 2);
          const k = s / s0;
          tx.set(withTiming(e.x - (e.x - tx.get()) * k));
          ty.set(withTiming(e.y - (e.y - ty.get()) * k));
          scale.set(withTiming(s));
        }),
    [tx, ty, scale]
  );
  const canvasGesture = useMemo(
    () => Gesture.Simultaneous(canvasPan, canvasPinch, canvasDoubleTap),
    [canvasPan, canvasPinch, canvasDoubleTap]
  );

  const transform = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: scale.get() }],
  }));

  const fit = (vp = viewport, animate = true, b = bounds) => {
    if (!vp) return;
    const s = Math.min(1, Math.max(MIN_SCALE, Math.min(vp.width / b.width, (vp.height - controlsBottom) / b.height)));
    const set = (v: SharedValue<number>, to: number) => v.set(animate ? withTiming(to) : to);
    set(scale, s);
    set(tx, (vp.width - b.width * s) / 2 - b.x * s);
    set(ty, -b.y * s);
  };

  const tidy = () =>
    confirm(tr.map.tidyTitle, tr.map.tidyMessage, tr.map.tidyConfirm, () => {
      const next = tidyLayout(positions);
      useStore.getState().setLayouts(next);
      fit(viewport, true, canvasBounds(next));
    });

  const zoomBy = (k: number) => {
    if (!viewport) return;
    const s0 = scale.get();
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s0 * k));
    const cx = viewport.width / 2;
    const cy = viewport.height / 2;
    tx.set(withTiming(cx - (cx - tx.get()) * (s / s0)));
    ty.set(withTiming(cy - (cy - ty.get()) * (s / s0)));
    scale.set(withTiming(s));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const vp = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
    if (!viewport) fit(vp, false);
    setViewport(vp);
  };

  return (
    <View style={styles.root} onLayout={onLayout}>
      <GestureDetector gesture={canvasGesture}>
        <View style={styles.root} collapsable={false}>
          {/* canvas coordinates start at this view's top-left; nodes dragged up or left go negative and overflow it */}
          <Animated.View
            style={[
              { width: Math.max(1, bounds.x + bounds.width), height: Math.max(1, bounds.y + bounds.height) },
              styles.origin,
              transform,
            ]}>
            <Svg
              // react-native-svg (iOS, new arch) doesn't reliably redraw changed children — neither styling
              // nor path geometry — so remount it whenever either changes (including every drag frame)
              key={svgKey}
              width={bounds.width}
              height={bounds.height}
              viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
              style={[styles.svg, { left: bounds.x, top: bounds.y }]}>
              <Defs>
                {STATUSES.map((s) => (
                  <Marker key={s} id={`arrow-${s}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <Path d="M 0 0 L 10 5 L 0 10 z" fill={STATUS_COLOR[s]} />
                  </Marker>
                ))}
              </Defs>
              {edges.map(({ technique: t, d }) => {
                const active = isTechniqueActive(t);
                const touchesSelected = t.from === selectedId || t.to === selectedId;
                return (
                  <Path
                    key={t.id}
                    d={d}
                    stroke={STATUS_COLOR[t.status]}
                    strokeWidth={touchesSelected ? 3.5 : 2}
                    strokeDasharray={t.status === 'seen' ? '7 5' : undefined}
                    fill="none"
                    strokeOpacity={active ? 1 : 0.12}
                    // inactive edges drop the arrowhead: markers ignore the path's stroke opacity
                    markerEnd={active ? `url(#arrow-${t.status})` : undefined}
                  />
                );
              })}
            </Svg>

            {edges.map(({ technique: t, label }) => (
              <EdgeLabel key={t.id} technique={t} x={label.x} y={label.y} active={isTechniqueActive(t)} />
            ))}

            {positions.map((p) => (
              <MapNode
                key={p.id}
                position={p}
                x={layout[p.id].x}
                y={layout[p.id].y}
                active={isPositionActive(p)}
                selected={p.id === selectedId}
                submissions={techniques.filter((t) => t.from === p.id && !t.to)}
                isTechniqueActive={isTechniqueActive}
                scale={scale}
                canvasGesture={canvasPan}
                onSelect={onSelect}
                onDrag={setDrag}
              />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={[styles.controls, { bottom: controlsBottom + 12 }]}>
        {[
          { label: '+', a11y: tr.map.zoomIn, onPress: () => zoomBy(1.3) },
          { label: '−', a11y: tr.map.zoomOut, onPress: () => zoomBy(1 / 1.3) },
          { label: '⤢', a11y: tr.map.fit, onPress: () => fit() },
          { label: '▦', a11y: tr.map.tidy, onPress: tidy },
        ].map((b) => (
          <Pressable
            key={b.label}
            onPress={b.onPress}
            accessibilityLabel={b.a11y}
            style={({ pressed }) => [styles.control, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}>
            <Text style={[styles.controlText, { color: theme.text }]}>{b.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Fades with the filters instead of snapping between visible and dimmed. */
function useFade(active: boolean, dimmed: number) {
  return useAnimatedStyle(() => ({ opacity: withTiming(active ? 1 : dimmed, { duration: 200 }) }), [active, dimmed]);
}

function EdgeLabel({ technique: t, x, y, active }: { technique: Technique; x: number; y: number; active: boolean }) {
  const theme = useTheme();
  const fade = useFade(active, 0.15);

  return (
    <Animated.View pointerEvents="none" style={[styles.edgeLabel, { left: x - 70, top: y - 8 }, fade]}>
      <Text numberOfLines={1} style={[styles.edgeLabelText, { color: STATUS_COLOR[t.status], backgroundColor: theme.background }]}>
        {t.name}
      </Text>
    </Animated.View>
  );
}

type NodeProps = {
  position: Position;
  x: number;
  y: number;
  active: boolean;
  selected: boolean;
  submissions: Technique[];
  isTechniqueActive: (t: Technique) => boolean;
  scale: SharedValue<number>;
  canvasGesture: GestureType;
  onSelect: (id: string) => void;
  onDrag: (drag: Drag | null) => void;
};

function MapNode({ position, x, y, active, selected, submissions, isTechniqueActive, scale, canvasGesture, onSelect, onDrag }: NodeProps) {
  const theme = useTheme();
  const { id } = position;
  const origin = useSharedValue({ x: 0, y: 0 });
  const fade = useFade(active, 0.3);

  const gesture = useMemo(() => {
    const at = (e: { translationX: number; translationY: number }) => {
      const s = scale.get();
      return {
        x: origin.get().x + e.translationX / s,
        y: origin.get().y + e.translationY / s,
      };
    };
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(4)
      .blocksExternalGesture(canvasGesture)
      .onStart(() => {
        // read from the store, not props, so this gesture never needs re-creating mid-drag
        const layout = useStore.getState().positions.find((p) => p.id === id)?.layout;
        if (layout) origin.set(layout);
      })
      .onUpdate((e) => onDrag({ id, ...at(e) }))
      .onEnd((e) => {
        useStore.getState().movePosition(id, at(e));
        onDrag(null);
      })
      .onFinalize(() => onDrag(null));
    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd(() => onSelect(id));
    return Gesture.Exclusive(pan, tap);
  }, [id, origin, scale, canvasGesture, onSelect, onDrag]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={position.name}
        style={[
          styles.node,
          {
            left: x,
            top: y,
            borderColor: selected ? theme.accent : SIDE_COLOR[position.side],
            backgroundColor: selected ? theme.backgroundSelected : theme.background,
          },
          selected && styles.nodeSelected,
          fade,
        ]}>
        <PositionIllustration position={position} width={64} height={45} />
        <View style={styles.nodeBody}>
          <Text numberOfLines={2} style={[styles.nodeName, { color: theme.text }]}>
            {position.name}
          </Text>
          {submissions.length > 0 && (
            <View style={styles.subs}>
              {submissions.map((t) => (
                <View
                  key={t.id}
                  style={[styles.subDot, { backgroundColor: STATUS_COLOR[t.status], opacity: isTechniqueActive(t) ? 1 : 0.25 }]}
                />
              ))}
              <Text style={[styles.subsText, { color: theme.textSecondary }]}>🔒 {submissions.length}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  origin: { transformOrigin: 'left top' },
  svg: { position: 'absolute' },
  node: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
    borderRadius: 14,
    borderWidth: 2,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeSelected: { borderWidth: 3 },
  nodeBody: { flex: 1, gap: 4 },
  nodeName: { fontSize: 13, fontWeight: '700' },
  subs: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  subDot: { width: 8, height: 8, borderRadius: 4 },
  subsText: { fontSize: 11, marginLeft: 2 },
  edgeLabel: { position: 'absolute', width: 140, alignItems: 'center' },
  edgeLabelText: { fontSize: 11, fontWeight: '700', paddingHorizontal: 4, borderRadius: 4, overflow: 'hidden' },
  controls: { position: 'absolute', right: 12, gap: 8 },
  control: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  controlText: { fontSize: 20, fontWeight: '600' },
  pressed: { opacity: 0.6 },
});
