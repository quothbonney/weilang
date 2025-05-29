import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme, TypographyVariant } from '../../theme';

interface ThemedTextProps extends Omit<RNTextProps, 'style'> {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'disabled' | 'chinese' | 'pinyin';
  style?: RNTextProps['style'];
}

export const Text: React.FC<ThemedTextProps> = ({
  variant = 'body',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return theme.colors.text.primary;
      case 'secondary':
        return theme.colors.text.secondary;
      case 'tertiary':
        return theme.colors.text.tertiary;
      case 'inverse':
        return theme.colors.text.inverse;
      case 'disabled':
        return theme.colors.text.disabled;
      case 'chinese':
        return theme.colors.text.chinese;
      case 'pinyin':
        return theme.colors.text.pinyin;
      default:
        return theme.colors.text.primary;
    }
  };

  const textStyle = {
    ...theme.typography[variant],
    color: getTextColor(),
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

export default Text; 