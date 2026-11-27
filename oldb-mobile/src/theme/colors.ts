/**
 * OLDB brand palette — cream / forest literary identity.
 * Independent from the web app's dark-only theme.
 */

export const palette = {
  forest: '#294638',
  deepForest: '#21392E',
  cream: '#F4F0E6',
  warmIvory: '#FAF6EB',
  antiqueGold: '#A18B50',
  darkBrown: '#302A22',
  mutedTaupe: '#82745E',
  sage: '#71876A',
  warmBorder: '#D8D3C5',
  white: '#FFFFFF',
  danger: '#8B3A3A',
} as const;

export type ColorSchemeName = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryContrast: string;
  accent: string;
  progress: string;
  tabBar: string;
  tabInactive: string;
  danger: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: palette.cream,
  surface: palette.warmIvory,
  surfaceElevated: palette.white,
  border: palette.warmBorder,
  text: palette.darkBrown,
  textSecondary: palette.mutedTaupe,
  textMuted: '#9A8E7A',
  primary: palette.forest,
  primaryContrast: palette.cream,
  accent: palette.antiqueGold,
  progress: palette.sage,
  tabBar: palette.warmIvory,
  tabInactive: palette.mutedTaupe,
  danger: palette.danger,
  overlay: 'rgba(48, 42, 34, 0.45)',
};

export const darkColors: ThemeColors = {
  background: palette.deepForest,
  surface: palette.forest,
  surfaceElevated: '#2E4A3C',
  border: '#3A5548',
  text: palette.cream,
  textSecondary: '#C9C0AE',
  textMuted: '#A89F8C',
  primary: palette.antiqueGold,
  primaryContrast: palette.deepForest,
  accent: palette.antiqueGold,
  progress: palette.sage,
  tabBar: palette.forest,
  tabInactive: '#A89F8C',
  danger: '#D98989',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

export function getThemeColors(scheme: ColorSchemeName): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}
