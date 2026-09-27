import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Tint used for the border/fill; defaults to the theme accent. */
  color?: string;
  small?: boolean;
};

/** Pill used for filters, pickers and status badges. */
export function Chip({ label, selected, onPress, color, small }: Props) {
  const theme = useTheme();
  const tint = color ?? theme.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={small ? 6 : 0}
      style={({ pressed }) => [
        styles.chip,
        small && styles.small,
        { borderColor: selected ? tint : theme.backgroundSelected, backgroundColor: selected ? tint + '26' : 'transparent' },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, small && styles.labelSmall, { color: selected ? tint : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  small: { paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontSize: 14, fontWeight: '600' },
  labelSmall: { fontSize: 12 },
  pressed: { opacity: 0.6 },
});
