import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme, ColorScheme } from '../../theme';
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
      <View style={{ marginBottom: theme.layout.md }}>
        <Text variant="h6" style={{ marginBottom: theme.layout.xs }}>
          {title}
        </Text>
        <Text variant="bodySmall" color="secondary">
          {description}
        </Text>
      </View>

      <View style={{ gap: theme.layout.sm }}>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = colorScheme === option.key || 
            (option.key === 'auto' && currentPreference === 'auto');

          return (
            <TouchableOpacity
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: theme.layout.md,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 2,
                borderColor: isSelected 
                  ? theme.colors.interactive.primary 
                  : theme.colors.border.primary,
                backgroundColor: isSelected 
                  ? `${theme.colors.interactive.primary}10` 
                  : theme.colors.surface.primary,
              }}
              onPress={() => setColorScheme(option.key)}
            >
              <View
                style={{
                  width: theme.dimensions.iconSize.lg,
                  height: theme.dimensions.iconSize.lg,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: isSelected 
                    ? theme.colors.interactive.primary 
                    : theme.colors.surface.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.layout.md,
                }}
              >
                <Icon 
                  size={theme.dimensions.iconSize.sm} 
                  color={isSelected ? theme.colors.text.inverse : theme.colors.text.secondary} 
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text 
                  variant="body" 
                  style={{ 
                    fontWeight: isSelected ? '600' : '500',
                    color: isSelected ? theme.colors.interactive.primary : theme.colors.text.primary,
                    marginBottom: theme.layout.xs / 2,
                  }}
                >
                  {option.label}
                </Text>
                <Text variant="caption" color="secondary">
                  {option.description}
                </Text>
              </View>

              {isSelected && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.colors.interactive.primary,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={{
          marginTop: theme.layout.md,
          padding: theme.layout.sm,
          backgroundColor: theme.colors.surface.secondary,
          borderRadius: theme.borderRadius.md,
        }}
      >
        <Text variant="caption" color="secondary">
          Current theme: {isDark ? 'Dark' : 'Light'}
        </Text>
      </View>
    </Card>
  );
};

export default ThemeSelector; 