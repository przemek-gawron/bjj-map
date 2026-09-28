import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of the iOS tab bar above the home-indicator inset. */
const IOS_TAB_BAR = 50;

/**
 * Space the tab bar takes over a tab screen's content. Only iOS's native tab bar
 * floats over the content; on Android and web the content already ends above it.
 */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios' ? insets.bottom + IOS_TAB_BAR : 0;
}
