import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PositionIllustration } from '@/components/position-illustration';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import type { Position, Technique } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { deletePositionPhoto, pickPositionPhoto } from '@/utils/pick-photo';
import { useT } from '@/i18n';

type Props = { position: Position; bottom: number; onClose: () => void };

export function PositionSheet({ position, bottom, onClose }: Props) {
  const theme = useTheme();
  const tr = useT();
  const positions = useStore((s) => s.positions);
  const techniques = useStore((s) => s.techniques);
  const setStatus = useStore((s) => s.setStatus);
  const setPositionPhoto = useStore((s) => s.setPositionPhoto);

  const from = techniques.filter((t) => t.from === position.id);
  const into = techniques.filter((t) => t.to === position.id);
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
    <ThemedView style={[styles.sheet, { bottom, shadowColor: '#000', borderColor: theme.backgroundSelected }]}>
      <View style={styles.head}>
        <PositionIllustration position={position} width={96} height={67} />
        <View style={styles.flex}>
          <ThemedText type="smallBold" style={styles.title}>
            {position.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {tr.group[position.group]} · {position.side === 'top' ? 'jesteś na górze' : position.side === 'bottom' ? 'jesteś na dole' : 'neutralna'}
          </ThemedText>
          <View style={styles.photoActions}>
            <Pressable onPress={changePhoto} hitSlop={6}>
              <ThemedText type="small" themeColor="accent">
                {position.photoUri ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
              </ThemedText>
            </Pressable>
            {position.photoUri && (
              <Pressable onPress={removePhoto} hitSlop={6}>
                <ThemedText type="small" themeColor="textSecondary">
                  Usuń zdjęcie
                </ThemedText>
              </Pressable>
            )}
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Zamknij">
          <ThemedText themeColor="textSecondary" style={styles.close}>
            ✕
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView style={styles.list}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
          Z tej pozycji · {from.length}
        </ThemedText>
        {from.map((t) => row(t, `${tr.type[t.type]} ${t.to ? '→ ' + nameOf(t.to) : '· kończenie'}`))}
        <Pressable
          onPress={() => router.push({ pathname: '/technique/form', params: { from: position.id } })}
          style={styles.add}>
          <ThemedText type="smallBold" themeColor="accent">
            + Dodaj technikę z tej pozycji
          </ThemedText>
        </Pressable>

        {into.length > 0 && (
          <>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
              Jak tu trafić · {into.length}
            </ThemedText>
            {into.map((t) => row(t, `z ${nameOf(t.from)}`))}
          </>
        )}
      </ScrollView>
    </ThemedView>
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
  photoActions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.one },
  close: { fontSize: 18 },
  list: { marginTop: Spacing.two },
  section: { marginTop: Spacing.two, marginBottom: Spacing.one, fontSize: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  add: { paddingVertical: Spacing.two },
  pressed: { opacity: 0.6 },
});
