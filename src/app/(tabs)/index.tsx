import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { tidyLayout } from '@/components/map/geometry';
import { GroupBoard } from '@/components/map/group-board';
import { MapCanvas } from '@/components/map/map-canvas';
import { PositionSheet } from '@/components/map/position-sheet';
import { Screen } from '@/components/screen';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import type { Position, PositionGroup, Technique, TechniqueType } from '@/data/types';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

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

  const [typeFilter, setTypeFilter] = useState<TechniqueType | null>(null);
  const [groupFilter, setGroupFilter] = useState<PositionGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [areaHeight, setAreaHeight] = useState(0);

  // Two levels. Without a group: a board of group cards, no arrows at all. With a group:
  // its positions plus the ones its techniques lead to or come from, laid out on their
  // own — never the whole map at once.
  const groupOf = (id: string) => allPositions.find((p) => p.id === id)?.group;
  const inGroup = (t: Technique) => groupOf(t.from) === groupFilter || (!!t.to && groupOf(t.to) === groupFilter);
  const groupTechniques = allTechniques.filter(inGroup);
  const groupIds = new Set(groupTechniques.flatMap((t) => (t.to ? [t.from, t.to] : [t.from])));
  const groupPositions = allPositions.filter((p) => p.group === groupFilter || groupIds.has(p.id));
  const groupLayout = tidyLayout(groupPositions);
  const positions = groupPositions.map((p) => ({ ...p, layout: groupLayout[p.id] }));
  const techniques = groupTechniques;

  const selected = positions.find((p) => p.id === selectedId);
  const isTechniqueActive = (t: Technique) =>
    (!typeFilter || t.type === typeFilter) && (!selectedId || t.from === selectedId || t.to === selectedId);
  const filtering = !!typeFilter || !!selectedId;
  const isPositionActive = (p: Position) =>
    !filtering ||
    p.id === selectedId ||
    techniques.some((t) => isTechniqueActive(t) && (t.from === p.id || t.to === p.id));
  const openGroup = (g: PositionGroup | null) => {
    setGroupFilter(g);
    setSelectedId(null);
  };

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
      {groupFilter && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
          {TYPES.map((type) => (
            <Chip key={type} small label={tr.type[type]} selected={typeFilter === type} onPress={() => setTypeFilter(typeFilter === type ? null : type)} />
          ))}
        </ScrollView>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {groupFilter && <Chip small label={tr.map.allGroups} onPress={() => openGroup(null)} />}
        {GROUPS.filter((g) => allPositions.some((p) => p.group === g)).map((group) => (
          <Chip key={group} small label={tr.group[group]} selected={groupFilter === group} onPress={() => openGroup(group)} />
        ))}
      </ScrollView>

      <View style={styles.area} onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}>
        {groupFilter ? (
          <MapCanvas
            // a fresh view per group: each has its own size
            key={groupFilter}
            draggable={false}
            positions={positions}
            techniques={techniques}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
            isPositionActive={isPositionActive}
            isTechniqueActive={isTechniqueActive}
            controlsBottom={selected ? bottom + sheetHeight : bottom}
          />
        ) : (
          <GroupBoard positions={allPositions} techniques={allTechniques} onOpen={openGroup} bottom={bottom} />
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
  filters: { flexGrow: 0, marginBottom: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.three },
  settings: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
