import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';

interface ThemedButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: TouchableOpacityProps['style'];
}

export const Button: React.FC<ThemedButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
    };

    const sizeStyles = {
      small: {
        height: theme.dimensions.buttonHeight.sm,
        paddingHorizontal: theme.layout.buttonPadding,
      },
      medium: {
        height: theme.dimensions.buttonHeight.md,
        paddingHorizontal: theme.layout.buttonPadding,
      },
      large: {
        height: theme.dimensions.buttonHeight.lg,
        paddingHorizontal: theme.layout.buttonPaddingLarge,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled 
          ? theme.colors.interactive.disabled 
          : theme.colors.interactive.primary,
        borderColor: disabled 
          ? theme.colors.interactive.disabled 
          : theme.colors.interactive.primary,
      },
      secondary: {
        backgroundColor: disabled 
          ? theme.colors.interactive.disabled 
          : theme.colors.interactive.secondary,
        borderColor: disabled 
          ? theme.colors.interactive.disabled 
          : theme.colors.border.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: disabled 
          ? theme.colors.interactive.disabled 
          : theme.colors.interactive.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.interactive.disabledText;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.text.inverse;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return theme.colors.text.primary;
      default:
        return theme.colors.text.primary;
    }
  };

  const getTextVariant = () => {
    switch (size) {
      case 'small':
        return 'buttonSmall' as const;
      case 'large':
        return 'buttonLarge' as const;
      default:
        return 'button' as const;
    }
  };

  const buttonStyle = getButtonStyle();
  const textColor = getTextColor();
  const textVariant = getTextVariant();

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={textColor} 
          style={{ marginRight: theme.layout.buttonGap }} 
        />
      )}
      
      {leftIcon && !loading && (
        <View style={{ marginRight: theme.layout.buttonGap }}>
          {leftIcon}
        </View>
      )}
      
      <Text 
        variant={textVariant} 
        style={{ color: textColor }}
      >
        {title}
      </Text>
      
      {rightIcon && (
        <View style={{ marginLeft: theme.layout.buttonGap }}>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button; 