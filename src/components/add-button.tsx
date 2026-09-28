import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { useGradients, useTheme } from '@/hooks/use-theme';

type Props = { onPress: () => void; accessibilityLabel: string };

/** Round accent "+" button for screen headers. The plus is drawn, since a "+" glyph never sits centred. */
export function AddButton({ onPress, accessibilityLabel }: Props) {
  const theme = useTheme();
  const gradients = useGradients();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
      {gradients && <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      <View style={[styles.horizontal, { backgroundColor: theme.onAccent }]} />
      <View style={[styles.vertical, { backgroundColor: theme.onAccent }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  horizontal: { position: 'absolute', width: 16, height: 2.5, borderRadius: 1.25 },
  vertical: { position: 'absolute', width: 2.5, height: 16, borderRadius: 1.25 },
  pressed: { opacity: 0.7 },
});
