import { Image } from 'expo-image';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Position, PositionGroup } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

/**
 * Schematic side-view of a position: two stick figures on a mat line.
 * Each group draws a "top" and a "bottom" figure (for standing: left/right);
 * the one matching the position's side is "me" and gets the accent color.
 */

type Figure = { head: [number, number]; lines: string };
type Drawing = { top: Figure; bottom: Figure };

// viewBox 0 0 100 70, mat at y = 64. `lines` is an SVG path of limbs/torso.
const DRAWINGS: Record<PositionGroup, Drawing> = {
  standing: {
    bottom: { head: [34, 12], lines: 'M34 19 L34 41 M34 41 L27 63 M34 41 L41 63 M34 25 L47 33' },
    top: { head: [66, 12], lines: 'M66 19 L66 41 M66 41 L59 63 M66 41 L73 63 M66 25 L53 33' },
  },
  closed_guard: {
    bottom: { head: [12, 57], lines: 'M18 58 L48 58 M48 58 L60 42 L70 48 M48 58 L58 46 L70 52' },
    top: { head: [70, 20], lines: 'M70 27 L66 48 M66 48 L60 63 L76 63 M70 32 L56 44' },
  },
  open_guard: {
    bottom: { head: [12, 57], lines: 'M18 58 L46 58 M46 58 L54 44 L64 42 M46 58 L58 52 L66 50' },
    top: { head: [78, 12], lines: 'M78 19 L76 42 M76 42 L68 63 M76 42 L86 63 M77 26 L64 38' },
  },
  half_guard: {
    bottom: { head: [12, 58], lines: 'M18 59 L46 59 M46 59 L66 62 M46 59 L60 52 L74 56' },
    top: { head: [26, 42], lines: 'M32 44 L60 50 M60 50 L68 58 L86 60 M60 50 L80 48 L90 58 M36 46 L28 56' },
  },
  side_control: {
    bottom: { head: [12, 58], lines: 'M18 59 L58 59 M58 59 L84 60 M58 59 L80 54' },
    top: { head: [34, 44], lines: 'M40 44 L56 36 M56 36 L64 58 M56 36 L72 50 L70 60 M42 46 L36 56' },
  },
  mount: {
    bottom: { head: [12, 58], lines: 'M18 59 L58 59 M58 59 L84 60 M58 59 L80 55' },
    top: { head: [46, 14], lines: 'M46 21 L48 46 M48 46 L36 58 M48 46 L60 58 M47 28 L34 38 M47 28 L60 36' },
  },
  back: {
    bottom: { head: [60, 22], lines: 'M60 29 L58 52 M58 52 L84 58 M59 36 L72 44' },
    top: { head: [44, 18], lines: 'M44 25 L42 52 M42 52 L66 56 M42 52 L62 48 M44 31 L62 32 M44 34 L60 40' },
  },
};

type Props = { position: Pick<Position, 'group' | 'side' | 'photoUri'>; width: number; height: number };

export function PositionIllustration({ position, width, height }: Props) {
  const theme = useTheme();

  if (position.photoUri) {
    return <Image source={{ uri: position.photoUri }} style={{ width, height, borderRadius: 8 }} contentFit="cover" />;
  }

  const drawing = DRAWINGS[position.group];
  const meIsTop = position.side === 'top' || position.side === 'neutral';
  const figures: [Figure, string][] = [
    [drawing.bottom, meIsTop ? theme.textSecondary : theme.accent],
    [drawing.top, meIsTop ? theme.accent : theme.textSecondary],
  ];

  return (
    <Svg width={width} height={height} viewBox="0 0 100 70">
      <Line x1={4} y1={65} x2={96} y2={65} stroke={theme.backgroundSelected} strokeWidth={2} strokeLinecap="round" />
      {figures.map(([f, color], i) => (
        <Path key={i} d={f.lines} stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
      {figures.map(([f, color], i) => (
        <Circle key={i} cx={f.head[0]} cy={f.head[1]} r={6} fill={color} />
      ))}
    </Svg>
  );
}
