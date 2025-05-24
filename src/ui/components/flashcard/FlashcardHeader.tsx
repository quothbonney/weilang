import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings, Target, EyeOff, Shuffle } from 'lucide-react-native';
import { ReviewMode } from '../../../domain/entities';

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
  return (
    <View style={styles.header}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionMode}>
          {reviewMode.replace('-', ' ').toUpperCase()}
        </Text>
        <Text style={styles.sessionStats}>
          Batch {currentSession.batchIndex + 1} • {currentSession.reviewed} reviewed
        </Text>
      </View>
      
      <View style={styles.headerControls}>
        <View style={styles.settingsIndicator}>
          {!flashcardSettings.showPinyin && (
            <EyeOff size={16} color="#6b7280" />
          )}
          {flashcardSettings.deckFlipped && (
            <Shuffle size={16} color="#8b5cf6" />
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onOpenModeSelector}
        >
          <Target size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onOpenSettings}
        >
          <Settings size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionMode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sessionStats: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
}); 