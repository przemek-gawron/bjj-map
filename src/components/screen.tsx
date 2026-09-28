import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';

type Props = {
  title: string;
  /** Rendered to the right of the title, e.g. an add button. */
  action?: ReactNode;
  children?: ReactNode;
  /** false for screens that manage their own scrolling (e.g. the map canvas). */
  scroll?: boolean;
};

/** Tab screen shell: safe area, large title, content capped at MaxContentWidth for web. */
export function Screen({ title, action, children, scroll = true }: Props) {
  const bottom = useTabBarInset() + Spacing.six;

  const header = (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      {action}
    </View>
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.root}>
        {scroll ? (
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]}>
            {header}
            {children}
          </ScrollView>
        ) : (
          <View style={styles.root}>
            <View style={[styles.content, styles.fixedHeader]}>{header}</View>
            {children}
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
  },
  fixedHeader: { paddingBottom: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  title: { flexShrink: 1 },
});
