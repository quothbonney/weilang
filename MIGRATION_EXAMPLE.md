# Theming System Migration Example

This demonstrates the dramatic improvement when migrating from hardcoded StyleSheet values to the centralized theming system.

## ❌ BEFORE: Hardcoded StyleSheet (Bad)

```tsx
// ReviewButtons.tsx - OLD WAY
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const ReviewButtons = ({ onReview, isReviewing }) => {
  const qualityButtons = [
    { quality: "again", label: "Again", color: "#ef4444" }, // ❌ Hardcoded red
    { quality: "hard", label: "Hard", color: "#f59e0b" },   // ❌ Hardcoded orange
    { quality: "good", label: "Good", color: "#10b981" },   // ❌ Hardcoded green
    { quality: "easy", label: "Easy", color: "#3b82f6" },   // ❌ Hardcoded blue
  ];

  return (
    <View style={styles.reviewButtons}>
      {qualityButtons.map(({ quality, label, color }) => (
        <TouchableOpacity 
          key={quality}
          style={[styles.reviewButton, { backgroundColor: color }]}
          onPress={() => onReview(quality)}
        >
          <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ❌ 50+ lines of hardcoded values that break in dark mode
const styles = StyleSheet.create({
  reviewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,                    // ❌ Hardcoded spacing
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 16,       // ❌ Hardcoded padding
    borderRadius: 12,          // ❌ Hardcoded radius
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,             // ❌ Hardcoded height
  },
  buttonText: {
    color: 'white',            // ❌ Hardcoded color
    fontWeight: '600',         // ❌ Hardcoded weight  
    fontSize: 14,              // ❌ Hardcoded size
  },
});
```

**Problems with this approach:**
- ❌ **No dark mode support** - hardcoded colors break
- ❌ **Inconsistent spacing** - random numbers everywhere
- ❌ **Maintenance nightmare** - need to change each file individually
- ❌ **No design system** - inconsistent sizing and typography
- ❌ **Platform issues** - no platform-specific optimizations

## ✅ AFTER: Theming System (Good)

```tsx
// ReviewButtons.tsx - NEW WAY
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemedStyles, useTheme } from '../../theme';
import { Text } from '../themed/Text';

export const ReviewButtons = ({ onReview, isReviewing }) => {
  const { theme } = useTheme();
  
  // ✅ Semantic color mapping using theme
  const buttonColors = {
    again: theme.colors.status.error,     // ✅ Semantic, dark-mode aware
    hard: theme.colors.status.warning,    // ✅ Consistent with design system
    good: theme.colors.status.success,    // ✅ Accessible contrast ratios
    easy: theme.colors.interactive.primary, // ✅ Brand consistent
  };

  // ✅ Theme-aware styles - automatically adapt to light/dark mode
  const styles = useThemedStyles((theme) => ({
    reviewButtons: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      gap: theme.layout.sm,               // ✅ Consistent spacing scale
    },
    reviewButton: {
      flex: 1,
      paddingVertical: theme.layout.md,   // ✅ Design system spacing
      borderRadius: theme.borderRadius.lg, // ✅ Consistent radius scale
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: theme.dimensions.buttonHeight.xl, // ✅ Touch target compliance
    },
  }));

  const qualityButtons = [
    { quality: "again", label: "Again", colorKey: "again" },
    { quality: "hard", label: "Hard", colorKey: "hard" },
    { quality: "good", label: "Good", colorKey: "good" },
    { quality: "easy", label: "Easy", colorKey: "easy" },
  ];

  return (
    <View style={styles.reviewButtons}>
      {qualityButtons.map(({ quality, label, colorKey }) => (
        <TouchableOpacity 
          key={quality}
          style={[styles.reviewButton, { backgroundColor: buttonColors[colorKey] }]}
          onPress={() => onReview(quality)}
        >
          {/* ✅ Themed component with proper typography */}
          <Text variant="label" color="inverse">{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ✅ NO StyleSheet needed - everything comes from theme!
```

**Benefits of the new approach:**
- ✅ **Automatic dark mode** - colors adapt instantly
- ✅ **Consistent design** - spacing and sizing from design system
- ✅ **Easy maintenance** - change theme once, updates everywhere
- ✅ **Type safety** - IntelliSense for all theme values
- ✅ **Platform optimized** - fonts and spacing adapt automatically
- ✅ **Accessibility** - proper contrast ratios and touch targets
- ✅ **Much less code** - no huge StyleSheet blocks

## Impact Across the Codebase

### Dashboard Screen
**Before:** 495 lines of StyleSheet with hardcoded values
```tsx
const styles = StyleSheet.create({
  container: { backgroundColor: '#ffffff' },      // ❌ Breaks in dark mode
  title: { fontSize: 28, color: '#1f2937' },      // ❌ Hardcoded
  statCard: { backgroundColor: '#f8fafc' },       // ❌ Hardcoded
  // ... 490 more lines of hardcoded values
});
```

**After:** Clean, theme-aware components
```tsx
<Screen scrollable>
  <Card variant="elevated">
    <Text variant="h3">Welcome Jack!</Text>
    <Text variant="body" color="secondary">Ready to learn Chinese?</Text>
  </Card>
</Screen>
```

### Translation Components  
**Before:** 485+ lines of hardcoded styling
**After:** Theme-aware components that adapt automatically

### Settings Screen
**Before:** Multiple StyleSheet blocks with hardcoded colors
**After:** 
```tsx
<Screen scrollable>
  <Card>
    <Text variant="h5">Theme Settings</Text>
    <ThemeSelector />  {/* ✅ Built-in theme switching */}
  </Card>
</Screen>
```

## Global Benefits

1. **Change button styles globally:**
   ```tsx
   // In theme.ts - affects ALL buttons instantly
   button: {
     borderRadius: theme.borderRadius.xl, // Changed from lg to xl
   }
   ```

2. **Instant dark mode everywhere:**
   ```tsx
   // User switches device to dark mode
   // ✅ ALL components automatically adapt
   ```

3. **Consistent spacing:**
   ```tsx
   // Before: gap: 8, padding: 16, margin: 12 (random)
   // After: gap: theme.layout.sm, padding: theme.layout.md (consistent)
   ```

4. **Platform optimization:**
   ```tsx
   // iOS gets -apple-system font
   // Android gets Roboto
   // Web gets web-optimized fonts
   // Chinese text gets proper CJK fonts
   ```

## Migration Strategy

1. **Start with high-impact components** (Text, Button, Card)
2. **Replace hardcoded colors** with theme colors
3. **Use themed components** instead of custom styling
4. **Leverage the style helpers** for complex components
5. **Test in both light and dark modes**

The theming system eliminates the hardcoded styling nightmare and provides enterprise-grade design consistency with minimal effort. 