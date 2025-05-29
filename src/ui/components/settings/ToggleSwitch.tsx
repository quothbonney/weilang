import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme';

interface Props {
  value: boolean;
  onChange: (val: boolean) => void;
}

export const ToggleSwitch: React.FC<Props> = ({ value, onChange }) => {
  const { theme } = useTheme();

  const containerStyle = {
    width: 48,
    height: 28,
    borderRadius: theme.borderRadius.full,
    padding: theme.layout.xs,
    backgroundColor: value
      ? theme.colors.interactive.primary
      : theme.colors.border.secondary,
  } as const;

  const thumbStyle = {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.primary,
    marginLeft: value ? 20 : 0,
  } as const;

  return (
    <Pressable onPress={() => onChange(!value)} style={containerStyle}>
      <View style={thumbStyle} />
    </Pressable>
  );
};

export default ToggleSwitch;
