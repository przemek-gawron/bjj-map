import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

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
  onClose: () => void;
  /** Reports the sheet's height so the map can keep its controls above it. */
  onHeight: (height: number) => void;
};

export function PositionSheet({ position, bottom, onClose, onHeight }: Props) {
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
      onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
      style={[styles.sheet, { bottom, shadowColor: '#000', borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}>
      <View style={styles.head}>
        <PositionIllustration position={position} width={96} height={67} />
        <View style={styles.flex}>
          <ThemedText type="smallBold" style={styles.title}>
            {position.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {tr.group[position.group]} · {position.side === 'top' ? tr.map.sideTop : position.side === 'bottom' ? tr.map.sideBottom : tr.map.sideNeutral}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    maxHeight: '55%',
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  head: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  title: { fontSize: 18 },
  photoActions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.three, marginTop: Spacing.one },
  notes: { marginBottom: Spacing.one },
  close: { fontSize: 18 },
  list: { marginTop: Spacing.two },
  section: { marginTop: Spacing.two, marginBottom: Spacing.one, fontSize: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  add: { paddingVertical: Spacing.two },
  pressed: { opacity: 0.6 },
});
