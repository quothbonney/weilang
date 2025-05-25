import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<Props> = ({ title, description, children }) => (
  <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 mb-2">{title}</Text>
    {description ? (
      <Text className="text-sm text-gray-600 mb-3">{description}</Text>
    ) : null}
    {children}
  </View>
);

export default SettingsSection;
