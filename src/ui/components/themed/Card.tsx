import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedCardProps extends Omit<ViewProps, 'style'> {
  variant?: 'default' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewProps['style'];
}

export const Card: React.FC<ThemedCardProps> = ({
  variant = 'default',
  padding = 'medium',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.md,
    };

    const variantStyles = {
      default: {
        ...baseStyle,
        borderWidth: 1,
        borderColor: theme.colors.border.subtle,
      },
      elevated: {
        ...baseStyle,
        backgroundColor: theme.colors.surface.elevated,
        ...theme.shadows.sm,
        borderRadius: theme.borderRadius.lg,
      },
    };

    const paddingStyles = {
      none: {},
      small: { padding: theme.layout.cardPadding },
      medium: { padding: theme.layout.cardPadding },
      large: { padding: theme.layout.cardPaddingLarge },
    };

    return {
      ...variantStyles[variant],
      ...paddingStyles[padding],
    };
  };

  const cardStyle = getCardStyle();

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

export default Card; 