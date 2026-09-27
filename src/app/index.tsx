import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { MapCanvas } from '@/components/map/map-canvas';
import { PositionSheet } from '@/components/map/position-sheet';
import { Screen } from '@/components/screen';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { GROUP_LABEL, TYPE_LABEL } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Position, PositionGroup, Technique, TechniqueType } from '@/data/types';

const TYPES: TechniqueType[] = ['submission', 'sweep', 'escape', 'pass', 'takedown', 'transition'];
const GROUPS: PositionGroup[] = ['standing', 'closed_guard', 'open_guard', 'half_guard', 'side_control', 'mount', 'back'];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);

  const [typeFilter, setTypeFilter] = useState<TechniqueType | null>(null);
  const [groupFilter, setGroupFilter] = useState<PositionGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  // on iOS the native tab bar floats over the content
  const bottom = Platform.OS === 'web' ? Spacing.two : insets.bottom + BottomTabInset;

  return (
    <Screen title="Mapa" scroll={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {TYPES.map((type) => (
          <Chip key={type} small label={TYPE_LABEL[type]} selected={typeFilter === type} onPress={() => setTypeFilter(typeFilter === type ? null : type)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.chips}>
        {GROUPS.map((group) => (
          <Chip
            key={group}
            small
            label={GROUP_LABEL[group]}
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
        controlsBottom={selected ? bottom + 260 : bottom}
      />

      {selected && <PositionSheet position={selected} bottom={bottom} onClose={() => setSelectedId(null)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexGrow: 0, marginBottom: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.three },
});
