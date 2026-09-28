import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/utils/confirm';
import { deletePositionPhoto } from '@/utils/pick-photo';

export default function SettingsScreen() {
  const resetAll = useStore((s) => s.resetAll);

  const deleteAll = () =>
    confirm(
      'Usunąć wszystkie dane?',
      'Znikną treningi, plan, notatki, zdjęcia i Twoje techniki. Mapa wróci do stanu początkowego. Tego nie da się cofnąć.',
      'Usuń wszystko',
      () => {
        for (const p of useStore.getState().positions) if (p.photoUri) deletePositionPhoto(p.photoUri);
        resetAll();
        router.back();
      }
    );

  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="O aplikacji">
          <ThemedText type="smallBold" style={styles.appName}>
            BJJ Map
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Twoja mapa BJJ: pozycje, techniki między nimi i to, co już działa u Ciebie w sparingu. Planuj, co ćwiczyć w tym
            tygodniu, i zapisuj treningi w dzienniku.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Wersja {Constants.expoConfig?.version ?? '–'}
          </ThemedText>
        </Section>

        <Section title="Konto">
          <Row label="Wyloguj" disabled />
          <ThemedText type="small" themeColor="textSecondary">
            Konta jeszcze nie ma. Dane są zapisane tylko na tym urządzeniu.
          </ThemedText>
        </Section>

        <Section title="Dane">
          <Row label="Usuń wszystkie dane" destructive onPress={deleteAll} />
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        {children}
      </ThemedView>
    </View>
  );
}

function Row({ label, onPress, destructive, disabled }: { label: string; onPress?: () => void; destructive?: boolean; disabled?: boolean }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}>
      <ThemedText type="smallBold" style={{ color: destructive ? '#EF4444' : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.four },
  section: { gap: Spacing.two },
  sectionTitle: { textTransform: 'uppercase', fontSize: 12 },
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.two },
  appName: { fontSize: 17 },
  row: { paddingVertical: Spacing.one },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
});
