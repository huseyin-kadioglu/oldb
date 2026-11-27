import { TextStyle } from 'react-native';

export const fonts = {
  /** Editorial headings — classic serif feel */
  display: 'Georgia',
  /** Functional UI */
  body: 'System',
} as const;

export const typography = {
  brand: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 1.2,
  } satisfies TextStyle,
  screenTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.3,
  } satisfies TextStyle,
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '600',
  } satisfies TextStyle,
  bookTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '600',
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } satisfies TextStyle,
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } satisfies TextStyle,
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } satisfies TextStyle,
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  button: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
  } satisfies TextStyle,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  cover: 4,
} as const;
