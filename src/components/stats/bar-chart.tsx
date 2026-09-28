import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
            <Bar height={Math.max(b.value ? 3 : 0, (b.value / max) * (height - 16))} color={theme.accent} />
          </View>
          <Text numberOfLines={1} style={[styles.label, { color: theme.textSecondary }]}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Grows from the baseline to its height, and animates between heights when the data changes. */
function Bar({ height, color }: { height: number; color: string }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.set(withTiming(height, { duration: 450 }));
  }, [h, height]);
  const style = useAnimatedStyle(() => ({ height: h.get() }));

  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', gap: 4 },
  column: { flex: 1, alignItems: 'center', gap: 4 },
  track: { width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%', maxWidth: 28, borderRadius: 4 },
  value: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  label: { fontSize: 10 },
});
