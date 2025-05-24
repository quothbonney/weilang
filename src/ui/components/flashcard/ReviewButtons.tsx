import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, RotateCcw, Brain, Zap } from 'lucide-react-native';
import { ReviewQuality } from '../../../domain/entities';

interface ReviewButtonsProps {
  onReview: (quality: ReviewQuality) => void;
  isReviewing: boolean;
}

interface QualityButtonConfig {
  quality: ReviewQuality;
  label: string;
  color: string;
  icon: React.ComponentType<any>;
}

export const ReviewButtons: React.FC<ReviewButtonsProps> = ({
  onReview,
  isReviewing,
}) => {
  const qualityButtons: QualityButtonConfig[] = [
    { quality: "again", label: "Again", color: "#ef4444", icon: RotateCcw },
    { quality: "hard", label: "Hard", color: "#f59e0b", icon: Brain },
    { quality: "good", label: "Good", color: "#10b981", icon: CheckCircle },
    { quality: "easy", label: "Easy", color: "#3b82f6", icon: Zap },
  ];

  const renderQualityButton = ({ quality, label, color, icon: Icon }: QualityButtonConfig) => (
    <TouchableOpacity 
      key={quality}
      style={[styles.reviewButton, { backgroundColor: color }]}
      onPress={() => onReview(quality)}
      disabled={isReviewing}
    >
      <Icon size={20} color="white" style={styles.buttonIcon} />
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.reviewButtons}>
      {qualityButtons.map(renderQualityButton)}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 