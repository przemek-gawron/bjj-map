import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Two-or-more-way switch, e.g. list / stats. */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.backgroundElement }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.option, selected && { backgroundColor: theme.background }]}>
            <Text style={[styles.label, { color: selected ? theme.text : theme.textSecondary }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', borderRadius: 10, padding: 2 },
  option: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 8 },
  label: { fontSize: 14, fontWeight: '600' },
});
