import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

export default function PlanLayout() {
  const theme = useTheme();
  const tr = useT();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: theme.accent,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pick" options={{ presentation: 'modal', title: tr.plan.pickTitle }} />
    </Stack>
  );
}
