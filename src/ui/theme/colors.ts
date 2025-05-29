export const colors = {
  // Base palette
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Brand colors
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Chinese learning specific colors
  chinese: {
    accent: '#8b5cf6', // Purple for language learning
    pinyin: '#f59e0b', // Amber for pinyin
    character: '#1f2937', // Dark gray for characters
    translation: '#10b981', // Emerald for translations
  },
} as const;

// Light theme color mappings
export const lightTheme = {
  // Backgrounds
  background: {
    primary: colors.white,
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
    elevated: colors.white,
    overlay: `${colors.black}1A`, // 10% opacity
  },
  
  // Surfaces
  surface: {
    primary: colors.white,
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
    elevated: colors.white,
    overlay: colors.gray[900],
  },
  
  // Text
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[500],
    inverse: colors.white,
    disabled: colors.gray[400],
    chinese: colors.chinese.character,
    pinyin: colors.chinese.pinyin,
  },
  
  // Borders
  border: {
    primary: colors.gray[200],
    secondary: colors.gray[300],
    strong: colors.gray[400],
    subtle: colors.gray[100],
  },
  
  // Interactive elements
  interactive: {
    primary: colors.brand[500],
    primaryHover: colors.brand[600],
    primaryActive: colors.brand[700],
    secondary: colors.gray[100],
    secondaryHover: colors.gray[200],
    secondaryActive: colors.gray[300],
    disabled: colors.gray[200],
    disabledText: colors.gray[400],
  },
  
  // Status colors
  status: {
    success: colors.success[500],
    successBackground: colors.success[50],
    successBorder: colors.success[200],
    error: colors.error[500],
    errorBackground: colors.error[50],
    errorBorder: colors.error[200],
    warning: colors.warning[500],
    warningBackground: colors.warning[50],
    warningBorder: colors.warning[200],
    info: colors.info[500],
    infoBackground: colors.info[50],
    infoBorder: colors.info[200],
  },
  
  // Shadow
  shadow: {
    color: colors.black,
    opacity: '0A', // 4% opacity for light shadows
  },
} as const;

// Dark theme color mappings
export const darkTheme = {
  // Backgrounds
  background: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700],
    elevated: colors.gray[800],
    overlay: `${colors.black}4D`, // 30% opacity
  },
  
  // Surfaces
  surface: {
    primary: colors.gray[800],
    secondary: colors.gray[700],
    tertiary: colors.gray[600],
    elevated: colors.gray[700],
    overlay: colors.gray[950],
  },
  
  // Text
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    tertiary: colors.gray[400],
    inverse: colors.gray[900],
    disabled: colors.gray[500],
    chinese: colors.gray[50],
    pinyin: colors.warning[400],
  },
  
  // Borders
  border: {
    primary: colors.gray[700],
    secondary: colors.gray[600],
    strong: colors.gray[500],
    subtle: colors.gray[800],
  },
  
  // Interactive elements
  interactive: {
    primary: colors.brand[400],
    primaryHover: colors.brand[300],
    primaryActive: colors.brand[200],
    secondary: colors.gray[700],
    secondaryHover: colors.gray[600],
    secondaryActive: colors.gray[500],
    disabled: colors.gray[700],
    disabledText: colors.gray[500],
  },
  
  // Status colors
  status: {
    success: colors.success[400],
    successBackground: `${colors.success[500]}1A`, // 10% opacity
    successBorder: colors.success[700],
    error: colors.error[400],
    errorBackground: `${colors.error[500]}1A`, // 10% opacity
    errorBorder: colors.error[700],
    warning: colors.warning[400],
    warningBackground: `${colors.warning[500]}1A`, // 10% opacity
    warningBorder: colors.warning[700],
    info: colors.info[400],
    infoBackground: `${colors.info[500]}1A`, // 10% opacity
    infoBorder: colors.info[700],
  },
  
  // Shadow
  shadow: {
    color: colors.black,
    opacity: '40', // 25% opacity for darker shadows
  },
} as const;

export type ThemeColors = {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
    chinese: string;
    pinyin: string;
  };
  border: {
    primary: string;
    secondary: string;
    strong: string;
    subtle: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
    disabled: string;
    disabledText: string;
  };
  status: {
    success: string;
    successBackground: string;
    successBorder: string;
    error: string;
    errorBackground: string;
    errorBorder: string;
    warning: string;
    warningBackground: string;
    warningBorder: string;
    info: string;
    infoBackground: string;
    infoBorder: string;
  };
  shadow: {
    color: string;
    opacity: string;
  };
};
export type ColorScheme = 'light' | 'dark'; 