import { Platform } from 'react-native';

// Base font scale
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

// Font weights
export const fontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// Line heights (relative to font size)
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Platform-specific font families
export const fontFamilies = {
  system: Platform.select({
    ios: '-apple-system',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
  chinese: Platform.select({
    ios: 'PingFang SC',
    android: 'Noto Sans CJK SC',
    web: '"PingFang SC", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
    default: 'System',
  }),
} as const;

// Typography scale with semantic names
export const typography = {
  // Headers
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    fontFamily: fontFamilies.system,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    fontFamily: fontFamilies.system,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  h6: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  
  // Body text
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  
  // Chinese-specific typography
  chineseCharacter: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes['2xl'] * lineHeights.normal,
    fontFamily: fontFamilies.chinese,
  },
  chineseCharacterLarge: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    fontFamily: fontFamilies.chinese,
  },
  pinyin: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  
  // UI elements
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
    fontFamily: fontFamilies.system,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.tight,
    fontFamily: fontFamilies.system,
  },
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.tight,
    fontFamily: fontFamilies.system,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontFamily: fontFamilies.system,
  },
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontFamily: fontFamilies.system,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
} as const;

export type TypographyScale = typeof typography;
export type TypographyVariant = keyof TypographyScale; 