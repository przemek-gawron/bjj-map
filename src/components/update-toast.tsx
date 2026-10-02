import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { currentLanguage, useT } from '@/i18n';

/** Id of the last update the app ran, to tell a fresh over-the-air update apart. */
const LAST_UPDATE_KEY = 'bjj-map-last-update';
const INSTALLED_VISIBLE_MS = 4000;

type Toast = { kind: 'installed'; at: Date | null } | { kind: 'ready' };

/**
 * Over-the-air update notices (native only, and not in development, where Expo Go hands every
 * reload a fresh update id):
 * "updated" on the first launch of a new update, and "new version ready — restart"
 * once one has downloaded in the background, instead of waiting for the next cold start.
 */
export function UpdateToast() {
  const theme = useTheme();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const { isUpdatePending } = Updates.useUpdates();
  const [installed, setInstalled] = useState<Toast | null>(null);
  const [readyDismissed, setReadyDismissed] = useState(false);
  // a downloaded update outranks the "updated" notice and stays until dismissed
  const toast: Toast | null = isUpdatePending && !readyDismissed ? { kind: 'ready' } : installed;
  const dismiss = () => (toast?.kind === 'ready' ? setReadyDismissed(true) : setInstalled(null));

  useEffect(() => {
    if (!Updates.isEnabled || __DEV__) return;
    const current = Updates.isEmbeddedLaunch ? 'embedded' : (Updates.updateId ?? 'embedded');
    AsyncStorage.getItem(LAST_UPDATE_KEY)
      .then((last) => {
        if (current !== 'embedded' && last !== current) setInstalled({ kind: 'installed', at: Updates.createdAt });
        return AsyncStorage.setItem(LAST_UPDATE_KEY, current);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!installed) return;
    const timer = setTimeout(() => setInstalled(null), INSTALLED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [installed]);

  if (!toast) return null;

  const when = toast.kind === 'installed' && toast.at ? toast.at.toLocaleString(currentLanguage() === 'pl' ? 'pl-PL' : 'en-GB', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : null;

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + 8 }]}>
      <Pressable
        onPress={dismiss}
        accessibilityRole="alert"
        style={[styles.toast, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{toast.kind === 'ready' ? tr.updates.ready : tr.updates.installed}</ThemedText>
          {when && (
            <ThemedText type="small" themeColor="textSecondary">
              {tr.updates.version(when)}
            </ThemedText>
          )}
        </View>
        {toast.kind === 'ready' && (
          <Pressable
            onPress={() => Updates.reloadAsync().catch(() => {})}
            hitSlop={8}
            accessibilityRole="button"
            style={[styles.action, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {tr.updates.restart}
            </ThemedText>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  action: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
});
