import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PositionIllustration } from '@/components/position-illustration';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { drillsForPosition } from '@/data/drills';
import { useStore } from '@/data/store';
import type { Position, Technique } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { deletePositionPhoto, pickPositionPhoto } from '@/utils/pick-photo';
import { useT } from '@/i18n';

type Props = {
  position: Position;
  bottom: number;
  /** Tallest the sheet may get: the map area above `bottom`. */
  maxHeight: number;
  onClose: () => void;
  /** Reports the sheet's height so the map can keep its controls above it. */
  onHeight: (height: number) => void;
};

type Snap = 'collapsed' | 'half' | 'full';
/** Collapsed: just the handle and a one-line header, so the map stays visible. */
const PEEK = 64;

/**
 * Bottom sheet for a map position. Drag the handle (or header) down to collapse it to a
 * one-line bar, up to open it half or almost full height; tapping the handle toggles, and
 * tapping the collapsed bar opens it again. The chosen size stays when another tile is
 * picked, so a collapsed sheet lets you browse the map tile by tile.
 */
export function PositionSheet({ position, bottom, maxHeight, onClose, onHeight }: Props) {
  const theme = useTheme();
  const tr = useT();
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const allDrills = useStore((s) => s.drills);
  const setStatus = useStore((s) => s.setStatus);
  const setPositionPhoto = useStore((s) => s.setPositionPhoto);

  const from = techniques.filter((t) => t.from === position.id);
  const into = techniques.filter((t) => t.to === position.id);
  const drills = drillsForPosition(position.id, allDrills, techniques);
  const nameOf = (id: string | null) => positions.find((p) => p.id === id)?.name;

  const [snap, setSnap] = useState<Snap>('half');
  const snaps = useMemo(
    () => ({ collapsed: PEEK, half: Math.max(PEEK, Math.round(maxHeight * 0.5)), full: Math.max(PEEK, maxHeight - 8) }),
    [maxHeight]
  );
  const height = useSharedValue(snaps.half);
  const dragStart = useSharedValue(0);

  useEffect(() => {
    height.set(withTiming(snaps[snap], { duration: 220 }));
    onHeight(snaps[snap]);
  }, [snap, snaps, height, onHeight]);

  // dragging works anywhere on the header; taps are left to the buttons in it (a tap
  // gesture over the whole header would swallow "Edit" and "Add photo")
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .onStart(() => dragStart.set(height.get()))
        .onUpdate((e) => height.set(Math.min(snaps.full, Math.max(PEEK, dragStart.get() - e.translationY))))
        .onEnd((e) => {
          // a flick carries on in its direction; otherwise the nearest size wins
          const projected = height.get() - e.velocityY * 0.2;
          const next = (Object.keys(snaps) as Snap[]).reduce((a, b) => (Math.abs(snaps[b] - projected) < Math.abs(snaps[a] - projected) ? b : a));
          setSnap(next);
          height.set(withTiming(snaps[next], { duration: 220 }));
        }),
    [snaps, height, dragStart]
  );
  const toggle = () => setSnap((cur) => (cur === 'collapsed' ? 'half' : 'collapsed'));

  const sizeStyle = useAnimatedStyle(() => ({ height: height.get() }));
  const side = position.side === 'top' ? tr.map.sideTop : position.side === 'bottom' ? tr.map.sideBottom : tr.map.sideNeutral;

  const changePhoto = async () => {
    const uri = await pickPositionPhoto(position.id);
    if (!uri) return;
    if (position.photoUri) deletePositionPhoto(position.photoUri);
    setPositionPhoto(position.id, uri);
  };
  const removePhoto = () => {
    if (!position.photoUri) return;
    deletePositionPhoto(position.photoUri);
    setPositionPhoto(position.id, undefined);
  };

  const row = (t: Technique, meta: string) => (
    <Pressable
      key={t.id}
      onPress={() => router.push({ pathname: '/technique/[id]', params: { id: t.id } })}
      style={({ pressed }) => [styles.row, { borderColor: theme.backgroundSelected }, pressed && styles.pressed]}>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{t.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {meta}
        </ThemedText>
      </View>
      <StatusChip small status={t.status} onChange={(next) => setStatus(t.id, next)} />
    </Pressable>
  );

  return (
    // border keeps the sheet visible in dark mode, where the shadow disappears
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      style={[
        styles.sheet,
        sizeStyle,
        { bottom, shadowColor: '#000', borderColor: theme.backgroundSelected, backgroundColor: theme.background },
      ]}>
      <GestureDetector gesture={pan}>
        <View>
          <Pressable
            onPress={toggle}
            style={styles.handleArea}
            accessibilityRole="button"
            accessibilityLabel={snap === 'collapsed' ? tr.map.expandSheet : tr.map.collapseSheet}>
            <View style={[styles.handle, { backgroundColor: theme.backgroundSelected }]} />
          </Pressable>
          {snap === 'collapsed' ? (
            <View style={styles.bar}>
              <Pressable onPress={toggle} accessibilityRole="button" accessibilityHint={tr.map.expandSheet} style={styles.barTitle}>
                <ThemedText type="smallBold" numberOfLines={1} style={styles.flex}>
                  {position.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {tr.map.fromHere(from.length)}
                </ThemedText>
              </Pressable>
              <Pressable onPress={onClose} hitSlop={12} accessibilityLabel={tr.map.close}>
                <ThemedText themeColor="textSecondary" style={styles.close}>
                  ✕
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.head}>
              <PositionIllustration position={position} width={96} height={67} />
              <View style={styles.flex}>
                <ThemedText type="smallBold" style={styles.title}>
                  {position.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {tr.group[position.group]} · {side}
                </ThemedText>
                <View style={styles.photoActions}>
                  <Pressable onPress={() => router.push({ pathname: '/position/form', params: { id: position.id } })} hitSlop={6}>
                    <ThemedText type="small" themeColor="accent">
                      {position.notes ? tr.map.editPosition : tr.map.addNotes}
                    </ThemedText>
                  </Pressable>
                  <Pressable onPress={changePhoto} hitSlop={6}>
                    <ThemedText type="small" themeColor="accent">
                      {position.photoUri ? tr.map.changePhoto : tr.map.addPhoto}
                    </ThemedText>
                  </Pressable>
                  {position.photoUri && (
                    <Pressable onPress={removePhoto} hitSlop={6}>
                      <ThemedText type="small" themeColor="textSecondary">
                        {tr.map.removePhoto}
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              </View>
              <Pressable onPress={onClose} hitSlop={12} accessibilityLabel={tr.map.close}>
                <ThemedText themeColor="textSecondary" style={styles.close}>
                  ✕
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </GestureDetector>

      {snap !== 'collapsed' && (
        <ScrollView style={styles.list}>
          {position.notes && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.notes}>
              {position.notes}
            </ThemedText>
          )}
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
            {tr.map.fromHere(from.length)}
          </ThemedText>
          {from.map((t) => row(t, t.to ? `${tr.type[t.type]} → ${nameOf(t.to)}` : tr.type[t.type]))}
          <Pressable
            onPress={() => router.push({ pathname: '/technique/form', params: { from: position.id } })}
            style={styles.add}>
            <ThemedText type="smallBold" themeColor="accent">
              {tr.map.addFromHere}
            </ThemedText>
          </Pressable>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
            {tr.map.drills(drills.length)}
          </ThemedText>
          {drills.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => router.push({ pathname: '/drill/[id]', params: { id: d.id } })}
              style={({ pressed }) => [styles.row, { borderColor: theme.backgroundSelected }, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.flex}>
                {d.name}
              </ThemedText>
              {d.dose && (
                <ThemedText type="small" themeColor="accent">
                  {d.dose}
                </ThemedText>
              )}
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push({ pathname: '/drill/form', params: { position: position.id } })}
            style={styles.add}>
            <ThemedText type="smallBold" themeColor="accent">
              {tr.map.addDrill}
            </ThemedText>
          </Pressable>

          {into.length > 0 && (
            <>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
                {tr.map.howToGetHere(into.length)}
              </ThemedText>
              {into.map((t) => row(t, tr.map.fromPosition(nameOf(t.from) ?? '')))}
            </>
          )}
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    overflow: 'hidden',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  handleArea: { alignItems: 'center', paddingTop: 8, paddingBottom: 10 },
  handle: { width: 40, height: 5, borderRadius: 3 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  barTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  head: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  title: { fontSize: 18 },
  photoActions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.three, marginTop: Spacing.one },
  notes: { marginBottom: Spacing.one },
  close: { fontSize: 18 },
  list: { flex: 1, marginTop: Spacing.two },
  section: { marginTop: Spacing.two, marginBottom: Spacing.one, fontSize: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  add: { paddingVertical: Spacing.two },
  pressed: { opacity: 0.6 },
});
