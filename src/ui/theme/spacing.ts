// Base spacing unit (4px)
const SPACING_UNIT = 4;

// Spacing scale
export const spacing = {
  0: 0,
  1: SPACING_UNIT * 1,     // 4px
  2: SPACING_UNIT * 2,     // 8px
  3: SPACING_UNIT * 3,     // 12px
  4: SPACING_UNIT * 4,     // 16px
  5: SPACING_UNIT * 5,     // 20px
  6: SPACING_UNIT * 6,     // 24px
  7: SPACING_UNIT * 7,     // 28px
  8: SPACING_UNIT * 8,     // 32px
  10: SPACING_UNIT * 10,   // 40px
  12: SPACING_UNIT * 12,   // 48px
  16: SPACING_UNIT * 16,   // 64px
  20: SPACING_UNIT * 20,   // 80px
  24: SPACING_UNIT * 24,   // 96px
  32: SPACING_UNIT * 32,   // 128px
} as const;

// Semantic spacing aliases
export const layout = {
  // Common padding/margin values
  xs: spacing[1],          // 4px
  sm: spacing[2],          // 8px
  md: spacing[4],          // 16px
  lg: spacing[6],          // 24px
  xl: spacing[8],          // 32px
  '2xl': spacing[12],      // 48px
  
  // Screen padding
  screenPadding: spacing[5],  // 20px
  screenPaddingLarge: spacing[6], // 24px
  
  // Card spacing
  cardPadding: spacing[4],    // 16px
  cardPaddingLarge: spacing[5], // 20px
  cardGap: spacing[3],        // 12px
  
  // Button spacing
  buttonPadding: spacing[3],  // 12px
  buttonPaddingLarge: spacing[4], // 16px
  buttonGap: spacing[2],      // 8px
  
  // Input spacing
  inputPadding: spacing[3],   // 12px
  inputGap: spacing[2],       // 8px
  
  // Section spacing
  sectionGap: spacing[6],     // 24px
  sectionGapLarge: spacing[8], // 32px
  
  // List item spacing
  listItemPadding: spacing[4], // 16px
  listItemGap: spacing[1],     // 4px
} as const;

// Border radius values
export const borderRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  '2xl': 10,
  full: 9999,
} as const;

// Shadow configurations
export const shadows = {
  // Light theme shadows
  light: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Dark theme shadows (more pronounced)
  dark: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;

// Component dimensions
export const dimensions = {
  // Button heights
  buttonHeight: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },
  
  // Input heights
  inputHeight: {
    sm: 32,
    md: 40,
    lg: 48,
  },
  
  // Icon sizes
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
  
  // Avatar sizes
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    '2xl': 64,
  },
  
  // Header heights
  headerHeight: 60,
  statusBarHeight: 44, // Approximate for safe area
  
  // Card dimensions
  cardMinHeight: 120,
  cardMaxWidth: 400,
  
  // Touch targets (minimum recommended size)
  touchTarget: 44,
} as const;

export type SpacingScale = typeof spacing;
export type LayoutScale = typeof layout;
export type BorderRadiusScale = typeof borderRadius;
export type ShadowScale = typeof shadows;
export type DimensionScale = typeof dimensions; 