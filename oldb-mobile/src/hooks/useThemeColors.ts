import { useColorScheme } from 'react-native';

import { ColorSchemeName, ThemeColors, getThemeColors } from '@/src/theme';

export function useThemeColors(): ThemeColors {
  const scheme = (useColorScheme() ?? 'light') as ColorSchemeName;
  return getThemeColors(scheme);
}
