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

  const cardStyle = {
    marginBottom: theme.layout.sectionGap,
    backgroundColor: theme.colors.surface.secondary,
  } as const;

  return (
    <Card style={cardStyle}>
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
