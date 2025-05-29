# WeiLang Theming System

A comprehensive, centralized theming system for the WeiLang app that supports light/dark modes and consistent styling across all components.

## Features

- 🎨 **Comprehensive Design System**: Colors, typography, spacing, and layout tokens
- 🌙 **Dark Mode Support**: Automatic system detection with manual override
- 📱 **Platform Adaptive**: Optimized for iOS, Android, and Web
- 🇨🇳 **Chinese Typography**: Special support for Chinese characters and pinyin
- 🎯 **Type Safe**: Full TypeScript support with IntelliSense
- 🔧 **Easy to Use**: Simple hooks and components for rapid development

## Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
// app/_layout.tsx
import { ThemeProvider } from '../src/ui/theme';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Use themed components

```tsx
import { Text, Button, Card, Screen } from '../src/ui/components/themed';

function MyScreen() {
  return (
    <Screen scrollable>
      <Card>
        <Text variant="h3">Hello World</Text>
        <Text variant="body" color="secondary">
          This text automatically adapts to light/dark mode
        </Text>
        <Button title="Click me" variant="primary" />
      </Card>
    </Screen>
  );
}
```

### 3. Access theme in custom components

```tsx
import { useTheme, useThemedStyles } from '../src/ui/theme';

function CustomComponent() {
  const { theme, isDark } = useTheme();
  
  const styles = useThemedStyles((theme, helpers) => ({
    container: {
      ...helpers.card,
      marginTop: theme.layout.lg,
    },
    customText: {
      ...theme.typography.h4,
      color: theme.colors.text.primary,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.customText}>Custom styled component</Text>
    </View>
  );
}
```

## Core Concepts

### Colors

The color system provides semantic colors that automatically adapt to light/dark modes:

```tsx
const { colors } = useTheme();

// Text colors
colors.text.primary     // Main text color
colors.text.secondary   // Subdued text
colors.text.chinese     // Chinese character color
colors.text.pinyin      // Pinyin color

// Background colors
colors.background.primary   // Main screen background
colors.surface.primary      // Card/surface background
colors.surface.elevated     // Elevated surface background

// Interactive colors
colors.interactive.primary  // Primary buttons
colors.interactive.secondary // Secondary buttons

// Status colors
colors.status.success       // Success states
colors.status.error         // Error states
colors.status.warning       // Warning states
```

### Typography

Pre-defined typography scales for consistent text styling:

```tsx
<Text variant="h1">Large Heading</Text>
<Text variant="h6">Small Heading</Text>
<Text variant="body">Body text</Text>
<Text variant="caption">Small caption</Text>
<Text variant="chineseCharacter">中文</Text>
<Text variant="pinyin">zhōng wén</Text>
```

### Spacing & Layout

Consistent spacing using a 4px base unit:

```tsx
const { layout, spacing } = useTheme();

// Semantic spacing
layout.screenPadding    // 20px - Standard screen padding
layout.cardPadding      // 16px - Card padding
layout.sectionGap       // 24px - Gap between sections

// Numeric spacing (4px increments)
spacing[1]              // 4px
spacing[4]              // 16px
spacing[8]              // 32px
```

## Themed Components

### Text Component

```tsx
<Text 
  variant="h3"                    // Typography variant
  color="primary"                 // Text color
  style={{ marginTop: 10 }}       // Additional styles
>
  Content
</Text>
```

**Variants**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body`, `bodyLarge`, `bodySmall`, `caption`, `label`, `overline`, `chineseCharacter`, `chineseLarge`, `pinyin`, `button`

**Colors**: `primary`, `secondary`, `tertiary`, `inverse`, `disabled`, `chinese`, `pinyin`

### Button Component

```tsx
<Button
  title="Click me"
  variant="primary"               // Button style
  size="medium"                   // Button size
  onPress={() => {}}
  leftIcon={<Icon />}             // Optional left icon
  loading={false}                 // Loading state
/>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`
**Sizes**: `small`, `medium`, `large`

### Card Component

```tsx
<Card 
  variant="elevated"              // Card style
  padding="large"                 // Internal padding
>
  <Text>Card content</Text>
</Card>
```

**Variants**: `default`, `elevated`
**Padding**: `none`, `small`, `medium`, `large`

### Screen Component

```tsx
<Screen 
  scrollable={true}               // Enable scrolling
  safeArea={true}                 // Safe area handling
  padding={true}                  // Screen padding
>
  <Text>Screen content</Text>
</Screen>
```

### ThemeSelector Component

Add theme switching to your settings:

```tsx
import { ThemeSelector } from '../src/ui/components/themed';

<ThemeSelector 
  title="App Theme"
  description="Choose your preferred appearance"
/>
```

## Hooks

### useTheme()

Access the complete theme and control functions:

```tsx
const { 
  theme,          // Complete theme object
  colorScheme,    // Current color scheme ('light' | 'dark')
  isDark,         // Boolean for dark mode
  setColorScheme, // Change theme
  styles,         // Pre-built style helpers
  toggleTheme,    // Toggle between light/dark
} = useTheme();
```

### useThemedStyles()

Create theme-aware styles:

```tsx
const styles = useThemedStyles((theme, helpers) => ({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.layout.screenPadding,
  },
  button: helpers.button,  // Use pre-built styles
}));
```

### useColors(), useLayout(), useTypography()

Access specific parts of the theme:

```tsx
const colors = useColors();
const { spacing, layout } = useLayout();
const typography = useTypography();
```

## Migration Guide

### From StyleSheet to Themed Components

**Before:**
```tsx
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
  },
});

<Text style={styles.title}>Title</Text>
<TouchableOpacity style={styles.button}>
  <Text>Button</Text>
</TouchableOpacity>
```

**After:**
```tsx
<Text variant="h3">Title</Text>
<Button title="Button" variant="primary" />
```

### From Hardcoded Colors to Theme Colors

**Before:**
```tsx
<View style={{ backgroundColor: '#ffffff' }}>
  <Text style={{ color: '#1f2937' }}>Hello</Text>
</View>
```

**After:**
```tsx
const { colors } = useTheme();

<View style={{ backgroundColor: colors.surface.primary }}>
  <Text style={{ color: colors.text.primary }}>Hello</Text>
</View>

// Or better yet:
<Card>
  <Text>Hello</Text>
</Card>
```

### From className to Theme Components

**Before:**
```tsx
<View className="bg-white p-4 rounded-lg shadow-sm">
  <Text className="text-lg font-semibold text-gray-900">Title</Text>
</View>
```

**After:**
```tsx
<Card>
  <Text variant="h5">Title</Text>
</Card>
```

## Extending the Theme

### Adding Custom Colors

```tsx
// src/ui/theme/colors.ts
export const customColors = {
  myBrand: '#ff6b6b',
  myAccent: '#4ecdc4',
};

// Use in components
const { theme } = useTheme();
// Add to your theme configuration
```

### Custom Typography Variants

```tsx
// src/ui/theme/typography.ts
export const customTypography = {
  myHeading: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
};
```

### Adding Style Helpers

```tsx
// src/ui/theme/theme.ts
export const createStyle = (theme: Theme) => ({
  // ... existing styles
  myCustomCard: {
    backgroundColor: theme.colors.surface.primary,
    padding: theme.layout.lg,
    borderRadius: theme.borderRadius.xl,
    // ... custom styling
  },
});
```

## Best Practices

1. **Use themed components** instead of raw React Native components when possible
2. **Access theme values** instead of hardcoding colors, spacing, or typography
3. **Use semantic color names** (e.g., `text.primary`) instead of specific colors
4. **Test both light and dark modes** during development
5. **Use the spacing scale** for consistent layout
6. **Leverage TypeScript** for better development experience

## Troubleshooting

### Theme not updating
Make sure your component is wrapped in `ThemeProvider` and you're using the theme hooks.

### Colors not changing in dark mode
Ensure you're using theme colors (`theme.colors.text.primary`) instead of hardcoded colors (`'#000000'`).

### TypeScript errors
Import types from the theme package: `import type { Theme, ColorScheme } from '../src/ui/theme'`

## Examples

See the `app/` directory for real implementation examples of how existing components have been converted to use the theming system. 