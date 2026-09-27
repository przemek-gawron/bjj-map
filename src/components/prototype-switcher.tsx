// PROTOTYPE — floating variant switcher for UI prototypes. Dev-only (hidden when !__DEV__).
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomTabInset } from '@/constants/theme';

type Props = {
  variants: { key: string; name: string }[];
  current: string;
  state?: string; // one-line summary of the relevant state, re-rendered on every switch
};

export function PrototypeSwitcher({ variants, current, state }: Props) {
  const idx = Math.max(0, variants.findIndex((v) => v.key === current));
  const go = (delta: number) => {
    const next = variants[(idx + delta + variants.length) % variants.length];
    router.setParams({ variant: next.key });
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!__DEV__) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={styles.bar}>
        <Pressable onPress={() => go(-1)} hitSlop={10} style={styles.arrow}>
          <Text style={styles.arrowText}>←</Text>
        </Pressable>
        <View style={styles.labelBox}>
          <Text style={styles.label}>
            {variants[idx].key} — {variants[idx].name}
          </Text>
          {state && <Text style={styles.state}>{state}</Text>}
        </View>
        <Pressable onPress={() => go(1)} hitSlop={10} style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: BottomTabInset + 16, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF00AA',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  arrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF33', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  labelBox: { paddingHorizontal: 14, alignItems: 'center' },
  label: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  state: { color: '#FFE4F5', fontSize: 11, marginTop: 1 },
});
