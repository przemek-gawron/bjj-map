import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useT } from '@/i18n';

type Props = {
  children: ReactNode;
  onDelete: () => void;
  /** Label of the revealed button; defaults to "Delete". */
  label?: string;
  /** Outer container, e.g. margins and the rounded corners of a card. */
  style?: StyleProp<ViewStyle>;
};

const ACTION_WIDTH = 96;

/**
 * Swipe the row left to reveal a delete button. Children need an opaque
 * background, otherwise the button shows through before the swipe.
 * Rows fade in and out, and the rows below slide into the freed space.
 */
export function SwipeToDelete({ children, onDelete, label, style }: Props) {
  const tr = useT();
  const text = label ?? tr.common.delete;

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(180)} layout={LinearTransition.duration(220)}>
      <ReanimatedSwipeable
        friction={1.5}
        rightThreshold={ACTION_WIDTH / 2}
        overshootRight={false}
        containerStyle={style}
        renderRightActions={(_progress, _translation, swipeable) => (
          <Pressable
            onPress={() => {
              swipeable.close();
              onDelete();
            }}
            accessibilityRole="button"
            accessibilityLabel={text}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <Text style={styles.label}>{text}</Text>
          </Pressable>
        )}>
        {children}
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  action: { width: ACTION_WIDTH, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  label: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  pressed: { opacity: 0.8 },
});
