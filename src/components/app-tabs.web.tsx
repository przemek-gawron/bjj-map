import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';

// Web: plain bottom bar mirroring the native tabs.
export default function AppTabs() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Mapa</TabButton>
          </TabTrigger>
          <TabTrigger name="techniques" href="/techniques" asChild>
            <TabButton>Techniki</TabButton>
          </TabTrigger>
          <TabTrigger name="plan" href="/plan" asChild>
            <TabButton>Plan</TabButton>
          </TabTrigger>
          <TabTrigger name="journal" href="/journal" asChild>
            <TabButton>Dziennik</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <ThemedView type={isFocused ? 'backgroundSelected' : 'backgroundElement'} style={styles.buttonView}>
        <ThemedText type="smallBold" themeColor={isFocused ? 'accent' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <ThemedView {...props} style={styles.listContainer}>
      <ThemedView type="backgroundElement" style={styles.inner}>
        {props.children}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
  slot: { flex: 1 },
  listContainer: { padding: Spacing.two, alignItems: 'center' },
  inner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  button: { flex: 1 },
  buttonView: { alignItems: 'center', paddingVertical: Spacing.two, borderRadius: Spacing.three },
  pressed: { opacity: 0.7 },
});
