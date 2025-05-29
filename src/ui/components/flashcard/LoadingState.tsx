import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFlashcardStyles, useTheme } from '../../theme';
import { Text } from '../themed';

export const LoadingState: React.FC = () => {
  const styles = useFlashcardStyles();
  const { theme } = useTheme();
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
      <Text variant="body" color="secondary" style={{ marginTop: theme.layout.lg }}>
        Loading review session...
      </Text>
    </View>
  );
}; 