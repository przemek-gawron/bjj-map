import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  bars: { label: string; value: number }[];
  format?: (value: number) => string;
  height?: number;
};

/** Vertical bars with the value above and the label below each bar. */
export function BarChart({ bars, format = String, height = 110 }: Props) {
  const theme = useTheme();
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <View style={styles.root}>
      {bars.map((b, i) => (
        <View key={i} style={styles.column}>
          <View style={[styles.track, { height }]}>
            <Text style={[styles.value, { color: b.value ? theme.text : theme.textSecondary }]}>{b.value ? format(b.value) : ''}</Text>
            <View
              style={[
                styles.bar,
                { height: Math.max(b.value ? 3 : 0, (b.value / max) * (height - 16)), backgroundColor: theme.accent },
              ]}
            />
          </View>
          <Text numberOfLines={1} style={[styles.label, { color: theme.textSecondary }]}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', gap: 4 },
  column: { flex: 1, alignItems: 'center', gap: 4 },
  track: { width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%', maxWidth: 28, borderRadius: 4 },
  value: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  label: { fontSize: 10 },
});
