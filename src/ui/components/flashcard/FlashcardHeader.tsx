import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Settings, Target, EyeOff, Shuffle } from 'lucide-react-native';
import { ReviewMode } from '../../../domain/entities';
import { useThemedStyles, useTheme } from '../../theme';
import { Text } from '../themed';

interface FlashcardHeaderProps {
  reviewMode: ReviewMode;
  currentSession: {
    batchIndex: number;
    reviewed: number;
  };
  flashcardSettings: {
    showPinyin: boolean;
    deckFlipped: boolean;
  };
  onOpenModeSelector: () => void;
  onOpenSettings: () => void;
}

export const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  reviewMode,
  currentSession,
  flashcardSettings,
  onOpenModeSelector,
  onOpenSettings,
}) => {
  const { theme } = useTheme();
  
  const styles = useThemedStyles((theme) => ({
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: theme.layout.md,
      backgroundColor: theme.colors.surface.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    sessionInfo: {
      flex: 1,
    },
    headerControls: {
      flexDirection: 'row' as const,
      gap: theme.layout.sm,
    },
    settingsIndicator: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.layout.xs,
      paddingHorizontal: theme.layout.sm,
    },
    headerButton: {
      padding: theme.layout.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface.secondary,
    },
  }));

  return (
    <View style={styles.header}>
      <View style={styles.sessionInfo}>
        <Text variant="body" style={{ fontWeight: 'bold' }}>
          {reviewMode.replace('-', ' ').toUpperCase()}
        </Text>
        <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
          Batch {currentSession.batchIndex + 1} • {currentSession.reviewed} reviewed
        </Text>
      </View>
      
      <View style={styles.headerControls}>
        <View style={styles.settingsIndicator}>
          {!flashcardSettings.showPinyin && (
            <EyeOff size={theme.dimensions.iconSize.sm} color={theme.colors.text.secondary} />
          )}
          {flashcardSettings.deckFlipped && (
            <Shuffle size={theme.dimensions.iconSize.sm} color={theme.colors.chinese.accent} />
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onOpenModeSelector}
        >
          <Target size={theme.dimensions.iconSize.md} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onOpenSettings}
        >
          <Settings size={theme.dimensions.iconSize.md} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 