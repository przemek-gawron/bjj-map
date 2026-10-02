import { isRunningInExpoGo } from 'expo';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Appearance, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UpdateToast } from '@/components/update-toast';
import { useSettings } from '@/data/settings';
import { useStore } from '@/data/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage, useT } from '@/i18n';

// keep the splash up until the saved map and settings have loaded, so the first frame
// already has the right theme and data, and hold it a moment so it doesn't just blink
SplashScreen.preventAutoHideAsync().catch(() => {});
// Expo Go can't customise the splash and only warns, with a banner over the tab bar
if (!isRunningInExpoGo()) SplashScreen.setOptions({ duration: 300, fade: true });
const LAUNCHED_AT = Date.now();
const SPLASH_MIN_MS = 600;
/** Hide anyway if storage never answers. */
const SPLASH_MAX_MS = 3000;

/**
 * Tabs live in the (tabs) group. Technique and drill screens sit on the root stack so they open
 * on top of whichever tab you came from (map, plan, list) and "back" returns there.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const tr = useT();
  const language = useLanguage();
  const appearance = useSettings((s) => s.appearance);

  // native chrome (status bar, alerts, keyboard, tab bar) follows the chosen appearance too;
  // react-native-web has no setColorScheme, and web has no native chrome to recolor
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
  }, [appearance]);

  // starter map names follow the app language, once the saved data has loaded
  useEffect(() => {
    const localize = () => useStore.getState().localizeSeed(language);
    if (useStore.persist.hasHydrated()) localize();
    return useStore.persist.onFinishHydration(localize);
  }, [language]);

  useEffect(() => {
    const stores = [useStore.persist, useSettings.persist];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const hideWhenLoaded = () => {
      if (!stores.every((store) => store.hasHydrated())) return;
      clearTimeout(timer);
      timer = setTimeout(SplashScreen.hide, Math.max(0, SPLASH_MIN_MS - (Date.now() - LAUNCHED_AT)));
    };
    hideWhenLoaded();
    const unsubscribe = stores.map((store) => store.onFinishHydration(hideWhenLoaded));
    const fallback = setTimeout(SplashScreen.hide, SPLASH_MAX_MS);
    return () => {
      unsubscribe.forEach((off) => off());
      clearTimeout(timer);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            // Android left-aligns titles, which jams them against a "Cancel" button
            headerTitleAlign: 'center',
            headerTintColor: theme.accent,
            headerStyle: { backgroundColor: theme.background },
            headerTitleStyle: { color: theme.text },
            headerBackTitle: tr.common.back,
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="technique/[id]" options={{ title: '' }} />
          <Stack.Screen name="technique/form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="drill/[id]" options={{ title: '' }} />
          <Stack.Screen name="drill/form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="position/form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ title: tr.settings.title }} />
        </Stack>
        {/* expo-updates has nothing to report on web */}
        {Platform.OS !== 'web' && <UpdateToast />}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
