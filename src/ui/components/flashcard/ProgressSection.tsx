import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Word } from '../../../domain/entities';

interface ProgressSectionProps {
  currentCard: Word;
  currentSession: {
    reviewed: number;
    currentBatch: Word[];
  };
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  currentCard,
  currentSession,
}) => {
  const getCardTypeLabel = (card: Word): string => {
    if (card.learningStep > 0) return "Learning";
    if (card.status === "new") return "New";
    return "Review";
  };

  const getCardTypeColor = (card: Word): string => {
    if (card.learningStep > 0) return "#f59e0b";
    if (card.status === "new") return "#3b82f6";
    return "#10b981";
  };

  const progressPercentage = (currentSession.reviewed / (currentSession.reviewed + currentSession.currentBatch.length)) * 100;

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

const styles = StyleSheet.create({
  progressSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  cardTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  cardTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  learningStepText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
}); 