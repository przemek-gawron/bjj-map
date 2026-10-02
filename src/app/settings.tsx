import Constants from 'expo-constants';
import { type ReactNode, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { type AppearanceSetting, type LanguageSetting, useSettings } from '@/data/settings';
import { useLanguage, useT } from '@/i18n';
import { confirm } from '@/utils/confirm';
import { deletePositionPhoto } from '@/utils/pick-photo';

export default function SettingsScreen() {
  const tr = useT();
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);
  const appearance = useSettings((s) => s.appearance);
  const setAppearance = useSettings((s) => s.setAppearance);
  const resetAll = useStore((s) => s.resetAll);
  const loadLibrary = useStore((s) => s.loadLibrary);
  const currentLanguage = useLanguage();
  const [libraryResult, setLibraryResult] = useState<string | null>(null);

  // adds data and deletes nothing, so the confirm button isn't red
  const load = () =>
    confirm(
      tr.settings.loadLibraryTitle,
      tr.settings.loadLibraryMessage,
      tr.settings.loadLibraryConfirm,
      () => {
        const added = loadLibrary(currentLanguage);
        const any = added.positions + added.techniques + added.drills > 0;
        setLibraryResult(any ? tr.settings.libraryLoaded(added.positions, added.techniques, added.drills) : tr.settings.libraryUpToDate);
      },
      false
    );

  const deleteAll = () =>
    confirm(tr.settings.deleteAllTitle, tr.settings.deleteAllMessage, tr.settings.deleteAllConfirm, () => {
      for (const p of useStore.getState().positions) if (p.photoUri) deletePositionPhoto(p.photoUri);
      resetAll();
      router.back();
    });

  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title={tr.settings.appearance}>
          <Segmented<AppearanceSetting>
            options={[
              { value: 'dark', label: tr.settings.appearanceDark },
              { value: 'light', label: tr.settings.appearanceLight },
              { value: 'system', label: tr.settings.appearanceSystem },
            ]}
            value={appearance}
            onChange={setAppearance}
          />
        </Section>

        <Section title={tr.settings.language}>
          <Segmented<LanguageSetting>
            options={[
              { value: 'system', label: tr.settings.languageSystem },
              { value: 'pl', label: 'Polski' },
              { value: 'en', label: 'English' },
            ]}
            value={language}
            onChange={setLanguage}
          />
        </Section>

        <Section title={tr.settings.about}>
          <ThemedText type="smallBold" style={styles.appName}>
            BJJ Map
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {tr.settings.aboutText}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {tr.settings.version(Constants.expoConfig?.version ?? '–')}
          </ThemedText>
        </Section>

        <Section title={tr.settings.account}>
          <ThemedText type="small" themeColor="textSecondary">
            {tr.settings.noAccount}
          </ThemedText>
        </Section>

        <Section title={tr.settings.data}>
          <Row label={tr.settings.loadLibrary} onPress={load} />
          <ThemedText type="small" themeColor={libraryResult ? 'accent' : 'textSecondary'}>
            {libraryResult ?? tr.settings.loadLibraryHint}
          </ThemedText>
          <Row label={tr.settings.deleteAll} destructive onPress={deleteAll} />
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

function Row({ label, onPress, destructive }: { label: string; onPress: () => void; destructive?: boolean }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
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
});
