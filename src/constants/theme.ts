/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F2A2E',
    background: '#F2FAF9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#CFE9E5',
    textSecondary: '#4B6B70',
    accent: '#0F766E',
    /** Text and icons drawn on the accent color. */
    onAccent: '#FFFFFF',
  },
  dark: {
    text: '#E6FFFA',
    background: '#071A1D',
    backgroundElement: '#0F2A2E',
    backgroundSelected: '#1A3D42',
    textSecondary: '#94B8BC',
    accent: '#2DD4BF',
    onAccent: '#042F2E',
  },
} as const;

type Gradient = readonly [string, string];

/**
 * Optional gradients per scheme: a glow behind tab screen headers and the fill of
 * the round add buttons. null keeps the flat colors above.
 */
export const Gradients: Record<keyof typeof Colors, { header: Gradient; button: Gradient } | null> = {
  light: { header: ['#BFEFE6', '#F2FAF9'], button: ['#14B8A6', '#0EA5E9'] },
  dark: { header: ['#0B3B40', '#071A1D'], button: ['#14B8A6', '#0284C7'] },
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
