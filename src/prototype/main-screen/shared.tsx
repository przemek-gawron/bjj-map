// PROTOTYPE — tiny bits reused across variants (status chip, video link). Layout is NOT shared.
import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { STATUS_COLOR, STATUS_LABEL, type Status, type Technique } from './data';

export function StatusChip({ status, onPress, small }: { status: Status; onPress?: () => void; small?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, small && styles.chipSmall, { backgroundColor: STATUS_COLOR[status] + '26', borderColor: STATUS_COLOR[status] }]}>
      <Text style={[styles.chipText, small && styles.chipTextSmall, { color: STATUS_COLOR[status] }]}>
        {STATUS_LABEL[status]}
      </Text>
    </Pressable>
  );
}

export function VideoLink({ technique }: { technique: Technique }) {
  if (!technique.video) return null;
  return (
    <Pressable onPress={() => Linking.openURL(technique.video!.url)}>
      <Text style={styles.video}>▶ wideo</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  chipSmall: { paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextSmall: { fontSize: 11 },
  video: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
});
