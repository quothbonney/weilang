import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme, useThemedStyles, ColorScheme } from '../../theme';
import { Text } from './Text';
import { Card } from './Card';
import { Sun, Moon, Smartphone } from 'lucide-react-native';

interface ThemeSelectorProps {
  title?: string;
  description?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  title = "Theme",
  description = "Choose your preferred theme or follow system settings",
}) => {
  const { theme, colorScheme, setColorScheme, isDark } = useTheme();

  const styles = useThemedStyles((theme) => ({
    header: {
      marginBottom: theme.layout.md,
    },
    title: {
      marginBottom: theme.layout.xs,
    },
    optionsContainer: {
      gap: theme.layout.sm,
    },
    optionButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      padding: theme.layout.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
    },
    optionButtonDefault: {
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.surface.primary,
    },
    optionButtonSelected: {
      borderColor: theme.colors.interactive.primary,
      backgroundColor: theme.colors.surface.secondary,
    },
    iconContainer: {
      width: theme.dimensions.iconSize.lg,
      height: theme.dimensions.iconSize.lg,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: theme.layout.md,
    },
    iconContainerDefault: {
      backgroundColor: theme.colors.surface.secondary,
    },
    iconContainerSelected: {
      backgroundColor: theme.colors.interactive.primary,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      marginBottom: theme.layout.xs / 2,
    },
    selectedIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.interactive.primary,
    },
    currentThemeContainer: {
      marginTop: theme.layout.md,
      padding: theme.layout.sm,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.md,
    },
  }));

  const themeOptions = [
    {
      key: 'light' as ColorScheme | 'auto',
      label: 'Light',
      description: 'Always use light theme',
      icon: Sun,
    },
    {
      key: 'dark' as ColorScheme | 'auto',
      label: 'Dark',
      description: 'Always use dark theme',
      icon: Moon,
    },
    {
      key: 'auto' as ColorScheme | 'auto',
      label: 'Auto',
      description: 'Follow system settings',
      icon: Smartphone,
    },
  ];

  // Get current preference (not just effective color scheme)
  const [currentPreference, setCurrentPreference] = React.useState<ColorScheme | 'auto'>('auto');

  React.useEffect(() => {
    // This is a simplified way to track preference - in real implementation
    // we'd get this from the theme provider context
    setCurrentPreference(colorScheme as ColorScheme);
  }, [colorScheme]);

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="h6" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodySmall" color="secondary">
          {description}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = colorScheme === option.key || 
            (option.key === 'auto' && currentPreference === 'auto');

          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionButton,
                isSelected ? styles.optionButtonSelected : styles.optionButtonDefault
              ]}
              onPress={() => setColorScheme(option.key)}
            >
              <View
                style={[
                  styles.iconContainer,
                  isSelected ? styles.iconContainerSelected : styles.iconContainerDefault
                ]}
              >
                <Icon 
                  size={theme.dimensions.iconSize.sm} 
                  color={isSelected ? theme.colors.text.inverse : theme.colors.text.secondary} 
                />
              </View>

              <View style={styles.optionContent}>
                <Text 
                  variant="body" 
                  style={[
                    styles.optionLabel,
                    {
                      fontWeight: isSelected ? '600' : '500',
                      color: isSelected ? theme.colors.interactive.primary : theme.colors.text.primary,
                    }
                  ]}
                >
                  {option.label}
                </Text>
                <Text variant="caption" color="secondary">
                  {option.description}
                </Text>
              </View>

              {isSelected && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.currentThemeContainer}>
        <Text variant="caption" color="secondary">
          Current theme: {isDark ? 'Dark' : 'Light'}
        </Text>
      </View>
    </Card>
  );
};

export default ThemeSelector; 