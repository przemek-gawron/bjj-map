import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/chip';
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
const GROUPS: PositionGroup[] = ['standing', 'closed_guard', 'open_guard', 'half_guard', 'side_control', 'mount', 'back'];

export default function MapScreen() {
  const theme = useTheme();
  const tr = useT();
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);

  const [typeFilter, setTypeFilter] = useState<TechniqueType | null>(null);
  const [groupFilter, setGroupFilter] = useState<PositionGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {TYPES.map((type) => (
          <Chip key={type} small label={tr.type[type]} selected={typeFilter === type} onPress={() => setTypeFilter(typeFilter === type ? null : type)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {GROUPS.map((group) => (
          <Chip
            key={group}
            small
            label={tr.group[group]}
            selected={groupFilter === group}
            onPress={() => setGroupFilter(groupFilter === group ? null : group)}
          />
        ))}
      </ScrollView>

      <MapCanvas
        positions={positions}
        techniques={techniques}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
        isPositionActive={isPositionActive}
        isTechniqueActive={isTechniqueActive}
        controlsBottom={selected ? bottom + sheetHeight : bottom}
      />

      {selected && <PositionSheet position={selected} bottom={bottom} onClose={() => setSelectedId(null)} onHeight={setSheetHeight} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexGrow: 0, marginBottom: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.three },
  settings: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
