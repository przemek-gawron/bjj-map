import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { MapCanvas } from '@/components/map/map-canvas';
import { neighborhood } from '@/components/map/neighborhood';
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
  const [sheetHeight, setSheetHeight] = useState(0);
  const [areaHeight, setAreaHeight] = useState(0);

  // One position at a time: it sits in the middle, where you come from above it, where
  // its techniques lead below. Tapping a neighbour walks there; "back" retraces the steps.
  const [path, setPath] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(true);
  const centerId = [...path].reverse().find((id) => allPositions.some((p) => p.id === id)) ?? allPositions[0]?.id;
  const { positions, techniques } = centerId ? neighborhood(centerId, allPositions, allTechniques) : { positions: [], techniques: [] };
  const center = positions.find((p) => p.id === centerId);
  const selected = sheetOpen ? center : undefined;
  const walkTo = (id: string) => {
    if (id === centerId) return setSheetOpen(true);
    setPath([...path, id]);
    setSheetOpen(true);
  };
  const goBack = () => setPath(path.slice(0, -1));
  const groupFilter = center?.group ?? null;

  const isTechniqueActive = (t: Technique) => !typeFilter || t.type === typeFilter;
  const isPositionActive = (p: Position) =>
    !typeFilter || p.id === centerId || techniques.some((t) => isTechniqueActive(t) && (t.from === p.id || t.to === p.id));

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {TYPES.map((type) => (
          <Chip key={type} small label={tr.type[type]} selected={typeFilter === type} onPress={() => setTypeFilter(typeFilter === type ? null : type)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {path.length > 0 && <Chip small label={tr.map.back} onPress={goBack} />}
        {GROUPS.filter((g) => allPositions.some((p) => p.group === g)).map((group) => (
          <Chip
            key={group}
            small
            label={tr.group[group]}
            selected={groupFilter === group}
            // jump to the group's first position
            onPress={() => walkTo(allPositions.find((p) => p.group === group)!.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.area} onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}>
        <MapCanvas
          // a fresh view per centre: every neighbourhood has its own size
          key={centerId}
          draggable={false}
          fitOnStart
          positions={positions}
          techniques={techniques}
          selectedId={centerId ?? null}
          onSelect={walkTo}
          isPositionActive={isPositionActive}
          isTechniqueActive={isTechniqueActive}
          controlsBottom={selected ? bottom + sheetHeight : bottom}
        />

        {selected && areaHeight > 0 && (
          <PositionSheet
            position={selected}
            bottom={bottom}
            maxHeight={areaHeight - bottom}
            onClose={() => setSheetOpen(false)}
            onHeight={setSheetHeight}
            // collapsed, so the neighbours below stay visible; drag it up for the details
            initialSnap="collapsed"
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
