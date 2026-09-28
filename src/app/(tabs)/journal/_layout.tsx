import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function JournalLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTintColor: theme.accent,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="entry" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
