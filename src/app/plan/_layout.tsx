import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function PlanLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: theme.accent,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pick" options={{ presentation: 'modal', title: 'Plan na tydzień' }} />
    </Stack>
  );
}
