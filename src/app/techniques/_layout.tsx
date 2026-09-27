import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function TechniquesLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: theme.accent,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
        headerBackTitle: 'Techniki',
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
      <Stack.Screen name="form" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
