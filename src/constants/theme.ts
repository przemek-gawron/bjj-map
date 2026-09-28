/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1E1B4B',
    background: '#F7F5FF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DAD2F7',
    textSecondary: '#6B6893',
    accent: '#6D28D9',
    /** Text and icons drawn on the accent color. */
    onAccent: '#FFFFFF',
  },
  dark: {
    text: '#F5F3FF',
    background: '#0F0B1F',
    backgroundElement: '#1B1631',
    backgroundSelected: '#2A2347',
    textSecondary: '#B4AED6',
    accent: '#8B5CF6',
    onAccent: '#FFFFFF',
  },
} as const;

type Gradient = readonly [string, string];

/**
 * Optional gradients per scheme: a glow behind tab screen headers and the fill of
 * the round add buttons. null keeps the flat colors above.
 */
export const Gradients: Record<keyof typeof Colors, { header: Gradient; button: Gradient } | null> = {
  light: { header: ['#DDD3FF', '#F7F5FF'], button: ['#7C3AED', '#2563EB'] },
  dark: { header: ['#2E1065', '#0F0B1F'], button: ['#8B5CF6', '#3B82F6'] },
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 640;
