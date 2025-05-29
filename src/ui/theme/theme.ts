import { lightTheme, darkTheme, ThemeColors, ColorScheme } from './colors';
import { typography, TypographyScale } from './typography';
import { spacing, layout, borderRadius, shadows, dimensions } from './spacing';

// Complete theme interface
export interface Theme {
  colors: ThemeColors;
  typography: TypographyScale;
  spacing: typeof spacing;
  layout: typeof layout;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows.light | typeof shadows.dark;
  dimensions: typeof dimensions;
  colorScheme: ColorScheme;
}

// Create theme objects
export const createTheme = (colorScheme: ColorScheme): Theme => ({
  colors: colorScheme === 'light' ? lightTheme : darkTheme,
  typography,
  spacing,
  layout,
  borderRadius,
  shadows: colorScheme === 'light' ? shadows.light : shadows.dark,
  dimensions,
  colorScheme,
});

// Default themes
export const themes = {
  light: createTheme('light'),
  dark: createTheme('dark'),
} as const;

// Helper functions for theme-aware styling
export const createStyle = (theme: Theme) => ({
  // Common style patterns
  card: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.layout.cardPadding,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  
  cardElevated: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.layout.cardPaddingLarge,
    ...theme.shadows.sm,
  },
  
  button: {
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.layout.buttonPadding,
    paddingVertical: theme.layout.buttonPadding,
    height: theme.dimensions.buttonHeight.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  buttonSecondary: {
    backgroundColor: theme.colors.interactive.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.layout.buttonPadding,
    paddingVertical: theme.layout.buttonPadding,
    height: theme.dimensions.buttonHeight.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  
  input: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.layout.inputPadding,
    paddingVertical: theme.layout.inputPadding,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    color: theme.colors.text.primary,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    height: theme.dimensions.inputHeight.md,
  },
  
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.layout.screenPadding,
  },
  
  section: {
    marginBottom: theme.layout.sectionGap,
  },
  
  // Text styles
  text: {
    h1: {
      ...theme.typography.h1,
      color: theme.colors.text.primary,
    },
    h2: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
    },
    h3: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
    },
    h4: {
      ...theme.typography.h4,
      color: theme.colors.text.primary,
    },
    h5: {
      ...theme.typography.h5,
      color: theme.colors.text.primary,
    },
    h6: {
      ...theme.typography.h6,
      color: theme.colors.text.primary,
    },
    body: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
    },
    bodyLarge: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text.primary,
    },
    bodySmall: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    },
    caption: {
      ...theme.typography.caption,
      color: theme.colors.text.tertiary,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.text.primary,
    },
    overline: {
      ...theme.typography.overline,
      color: theme.colors.text.secondary,
    },
    chinese: {
      ...theme.typography.chineseCharacter,
      color: theme.colors.text.chinese,
    },
    chineseLarge: {
      ...theme.typography.chineseCharacterLarge,
      color: theme.colors.text.chinese,
    },
    pinyin: {
      ...theme.typography.pinyin,
      color: theme.colors.text.pinyin,
    },
    buttonText: {
      ...theme.typography.button,
      color: theme.colors.text.inverse,
    },
    buttonTextSecondary: {
      ...theme.typography.button,
      color: theme.colors.text.primary,
    },
  },
  
  // Status styles
  status: {
    success: {
      backgroundColor: theme.colors.status.successBackground,
      borderColor: theme.colors.status.successBorder,
      color: theme.colors.status.success,
    },
    error: {
      backgroundColor: theme.colors.status.errorBackground,
      borderColor: theme.colors.status.errorBorder,
      color: theme.colors.status.error,
    },
    warning: {
      backgroundColor: theme.colors.status.warningBackground,
      borderColor: theme.colors.status.warningBorder,
      color: theme.colors.status.warning,
    },
    info: {
      backgroundColor: theme.colors.status.infoBackground,
      borderColor: theme.colors.status.infoBorder,
      color: theme.colors.status.info,
    },
  },
});

export type StyleHelpers = ReturnType<typeof createStyle>;

// Export default theme
export const defaultTheme = themes.light; 