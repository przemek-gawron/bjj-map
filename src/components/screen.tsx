import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  children?: ReactNode;
  /** false for screens that manage their own scrolling (e.g. the map canvas). */
  scroll?: boolean;
};

/** Tab screen shell: safe area, large title, content capped at MaxContentWidth for web. */
export function Screen({ title, children, scroll = true }: Props) {
  const header = (
    <ThemedText type="title" style={styles.title}>
      {title}
    </ThemedText>
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.root}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content}>
            {header}
            {children}
          </ScrollView>
        ) : (
          <View style={styles.root}>
            <View style={styles.content}>{header}</View>
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
    paddingBottom: Spacing.six,
  },
  title: { marginBottom: Spacing.three },
});
