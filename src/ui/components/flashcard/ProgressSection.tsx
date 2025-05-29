import React from 'react';
import { View, Text } from 'react-native';
import { Word } from '../../../domain/entities';
import { useFlashcardStyles, useTheme } from '../../theme';

interface ProgressSectionProps {
  currentCard: Word;
  currentSession: {
    reviewed: number;
    currentBatch: Word[];
    queue: Word[];
  };
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  currentCard,
  currentSession,
}) => {
  const styles = useFlashcardStyles();
  const { theme } = useTheme();
  
  const getCardTypeLabel = (card: Word): string => {
    if (card.learningStep > 0) return "Learning";
    if (card.status === "new") return "New";
    return "Review";
  };

  const getCardTypeColor = (card: Word): string => {
    if (card.learningStep > 0) return styles.cardTypeColors.learning;
    if (card.status === "new") return styles.cardTypeColors.new;
    return styles.cardTypeColors.review;
  };

  const totalCards =
    currentSession.reviewed +
    currentSession.currentBatch.length +
    currentSession.queue.length;
  const progressPercentage =
    totalCards === 0 ? 0 : (currentSession.reviewed / totalCards) * 100;

  return (
    <View style={styles.progressSection}>
      <View style={styles.cardTypeIndicator}>
        <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(currentCard) }]}>
          <Text style={styles.cardTypeText}>{getCardTypeLabel(currentCard)}</Text>
        </View>
        {currentCard.learningStep > 0 && (
          <Text style={styles.learningStepText}>Step {currentCard.learningStep + 1}</Text>
        )}
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
    </View>
  );
}; 