import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { tidyLayout } from '@/components/map/geometry';
import { MapCanvas } from '@/components/map/map-canvas';
import { PositionSheet } from '@/components/map/position-sheet';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import type { Position, PositionGroup, Technique, TechniqueType } from '@/data/types';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

/** Past this many techniques "My game" dims arrows until a tile is picked, like "Everything" always does. */
const FOCUS_FROM = 12;

const TYPES: TechniqueType[] = ['submission', 'sweep', 'escape', 'pass', 'takedown', 'transition'];
const GROUPS: PositionGroup[] = [
  'standing',
  'closed_guard',
  'open_guard',
  'half_guard',
  'turtle',
  'side_control',
  'knee_on_belly',
  'north_south',
  'mount',
  'back',
];

export default function MapScreen() {
  const theme = useTheme();
  const tr = useT();
  const allPositions = useStore((s) => s.positions);
  const allTechniques = useStore((s) => s.techniques);

  // "My game": only what you're drilling or already hitting, and the positions it connects,
  // laid out compactly. Everything you've merely seen waits behind "All".
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const mine = scope === 'mine';
  const myTechniques = allTechniques.filter((t) => t.status !== 'seen');
  const myIds = new Set(myTechniques.flatMap((t) => (t.to ? [t.from, t.to] : [t.from])));
  const myPositions = allPositions.filter((p) => myIds.has(p.id));
  const myLayout = tidyLayout(myPositions);
  const positions = mine ? myPositions.map((p) => ({ ...p, layout: myLayout[p.id] })) : allPositions;
  const techniques = mine ? myTechniques : allTechniques;
  const focusMode = !mine || myTechniques.length > FOCUS_FROM;

  const [typeFilter, setTypeFilter] = useState<TechniqueType | null>(null);
  const [groupFilter, setGroupFilter] = useState<PositionGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [areaHeight, setAreaHeight] = useState(0);

  const groupOf = (id: string) => positions.find((p) => p.id === id)?.group;
  const selected = positions.find((p) => p.id === selectedId);

  // group filter = techniques *starting* in that group ("co mogę zrobić z gardy")
  const isTechniqueActive = (t: Technique) =>
    (!typeFilter || t.type === typeFilter) &&
    (!groupFilter || groupOf(t.from) === groupFilter) &&
    (!selectedId || t.from === selectedId || t.to === selectedId);
  const filtering = !!typeFilter || !!groupFilter || !!selectedId;
  const isPositionActive = (p: Position) =>
    !filtering ||
    p.id === selectedId ||
    (!!groupFilter && !typeFilter && !selectedId && p.group === groupFilter) ||
    techniques.some((t) => isTechniqueActive(t) && (t.from === p.id || t.to === p.id));

  const bottom = useTabBarInset() + Spacing.two;

  return (
    <Screen
      title={tr.map.title}
      scroll={false}
      action={
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={tr.settings.title}
          style={({ pressed }) => [styles.settings, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} tintColor={theme.text} size={22} />
        </Pressable>
      }>
      <View style={styles.scope}>
        <Segmented
          options={[
            { value: 'mine', label: tr.map.scopeMine(myTechniques.length) },
            { value: 'all', label: tr.map.scopeAll(allTechniques.length) },
          ]}
          value={scope}
          onChange={(next) => {
            setScope(next);
            setSelectedId(null);
          }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {TYPES.map((type) => (
          <Chip key={type} small label={tr.type[type]} selected={typeFilter === type} onPress={() => setTypeFilter(typeFilter === type ? null : type)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {GROUPS.filter((g) => positions.some((p) => p.group === g)).map((group) => (
          <Chip
            key={group}
            small
            label={tr.group[group]}
            selected={groupFilter === group}
            onPress={() => setGroupFilter(groupFilter === group ? null : group)}
          />
        ))}
      </ScrollView>

      <View style={styles.area} onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}>
        <MapCanvas
          // a fresh view per scope: the two maps have different sizes
          key={scope}
          draggable={!mine}
          positions={positions}
          techniques={techniques}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
          isPositionActive={isPositionActive}
          isTechniqueActive={isTechniqueActive}
          controlsBottom={selected ? bottom + sheetHeight : bottom}
          focused={filtering || !focusMode}
        />
        {focusMode && !filtering && (
          <View pointerEvents="none" style={[styles.hintWrap, { bottom: bottom + 12 }]}>
            <ThemedText type="small" style={[styles.hint, { backgroundColor: theme.backgroundElement }]}>
              {tr.map.focusHint}
            </ThemedText>
          </View>
        )}

        {mine && myTechniques.length === 0 && (
          <View style={styles.emptyWrap} pointerEvents="none">
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText type="smallBold">{tr.map.mineEmptyTitle}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {tr.map.mineEmptyText}
              </ThemedText>
            </ThemedView>
          </View>
        )}

        {selected && areaHeight > 0 && (
          <PositionSheet
            position={selected}
            bottom={bottom}
            maxHeight={areaHeight - bottom}
            onClose={() => setSelectedId(null)}
            onHeight={setSheetHeight}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  scope: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three, marginBottom: Spacing.two },
  emptyWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', padding: Spacing.four },
  empty: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one },
  // bottom left, clear of the zoom controls on the right
  hintWrap: { position: 'absolute', left: 12, right: 64, alignItems: 'flex-start' },
  hint: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', fontSize: 13 },
  filters: { flexGrow: 0, marginBottom: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.three },
  settings: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
