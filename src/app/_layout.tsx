import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage, useT } from '@/i18n';

/**
 * Tabs live in the (tabs) group. Technique screens sit on the root stack so they open
 * on top of whichever tab you came from (map, plan, list) and "back" returns there.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const tr = useT();
  const language = useLanguage();

  // starter map names follow the app language, once the saved data has loaded
  useEffect(() => {
    const localize = () => useStore.getState().localizeSeed(language);
    if (useStore.persist.hasHydrated()) localize();
    return useStore.persist.onFinishHydration(localize);
  }, [language]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTintColor: theme.accent,
            headerStyle: { backgroundColor: theme.background },
            headerTitleStyle: { color: theme.text },
            headerBackTitle: tr.common.back,
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="technique/[id]" options={{ title: '' }} />
          <Stack.Screen name="technique/form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ title: tr.settings.title }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
