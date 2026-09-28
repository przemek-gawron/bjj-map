import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = { onPress: () => void; accessibilityLabel: string };

/** Round accent "+" button for screen headers. The plus is drawn, since a "+" glyph never sits centred. */
export function AddButton({ onPress, accessibilityLabel }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
      <View style={[styles.horizontal, { backgroundColor: theme.onAccent }]} />
      <View style={[styles.vertical, { backgroundColor: theme.onAccent }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  horizontal: { position: 'absolute', width: 16, height: 2.5, borderRadius: 1.25 },
  vertical: { position: 'absolute', width: 2.5, height: 16, borderRadius: 1.25 },
  pressed: { opacity: 0.7 },
});
