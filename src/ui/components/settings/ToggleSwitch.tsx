import React from 'react';
import { Pressable, View } from 'react-native';

interface Props {
  value: boolean;
  onChange: (val: boolean) => void;
}

export const ToggleSwitch: React.FC<Props> = ({ value, onChange }) => (
  <Pressable
    onPress={() => onChange(!value)}
    className={`w-12 h-7 rounded-full p-1 ${value ? 'bg-blue-500' : 'bg-gray-300'}`}
  >
    <View className={`w-5 h-5 rounded-full bg-white ${value ? 'ml-auto' : ''}`} />
  </Pressable>
);

export default ToggleSwitch;
