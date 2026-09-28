import { SymbolView } from 'expo-symbols';
import { type ReactNode, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
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
 * On web, where swiping with a mouse isn't obvious, hovering the row also
 * shows a trash button beside it.
 */
export function SwipeToDelete({ children, onDelete, label, style }: Props) {
  const tr = useT();
  const text = label ?? tr.common.delete;
  const [hovered, setHovered] = useState(false);
  const web = Platform.OS === 'web';

  const swipeable = (
    <ReanimatedSwipeable
      friction={1.5}
      rightThreshold={ACTION_WIDTH / 2}
      overshootRight={false}
      // on web the margins go on the hover row instead; the card keeps its rounded clip
      containerStyle={web ? [styles.flex, { borderRadius: StyleSheet.flatten(style)?.borderRadius }] : style}
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
  );

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(180)} layout={LinearTransition.duration(220)}>
      {web ? (
        <View
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          style={[styles.hoverRow, style, { borderRadius: undefined }]}>
          {swipeable}
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={text}
            style={({ pressed }) => [styles.trash, { opacity: hovered ? (pressed ? 0.6 : 1) : 0 }]}>
            <SymbolView name={{ web: 'delete' }} tintColor="#EF4444" size={20} />
          </Pressable>
        </View>
      ) : (
        swipeable
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hoverRow: { flexDirection: 'row', alignItems: 'center' },
  trash: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  action: { width: ACTION_WIDTH, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  label: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  pressed: { opacity: 0.8 },
});
