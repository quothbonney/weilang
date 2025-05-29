import React from 'react';
import { Card, Text } from '../themed';
import { useTheme } from '../../theme';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<Props> = ({ title, description, children }) => {
  const { theme } = useTheme();

  return (
    <Card style={{ marginBottom: theme.layout.sectionGap }}>
      <Text variant="h5" style={{ marginBottom: theme.layout.cardGap }}>
        {title}
      </Text>
      {description ? (
        <Text color="secondary" style={{ marginBottom: theme.layout.md }}>
          {description}
        </Text>
      ) : null}
      {children}
    </Card>
  );
};

export default SettingsSection;
