import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, RotateCcw, Brain, Zap } from 'lucide-react-native';
import { ReviewQuality } from '../../../domain/entities';
import { useFlashcardStyles, useTheme } from '../../theme';

interface ReviewButtonsProps {
  onReview: (quality: ReviewQuality) => void;
  isReviewing: boolean;
}

interface QualityButtonConfig {
  quality: ReviewQuality;
  label: string;
  colorKey: 'again' | 'hard' | 'good' | 'easy';
  icon: React.ComponentType<any>;
}

export const ReviewButtons: React.FC<ReviewButtonsProps> = ({
  onReview,
  isReviewing,
}) => {
  const styles = useFlashcardStyles();
  const { theme } = useTheme();
  
  const qualityButtons: QualityButtonConfig[] = [
    { quality: "again", label: "Again", colorKey: "again", icon: RotateCcw },
    { quality: "hard", label: "Hard", colorKey: "hard", icon: Brain },
    { quality: "good", label: "Good", colorKey: "good", icon: CheckCircle },
    { quality: "easy", label: "Easy", colorKey: "easy", icon: Zap },
  ];

  const renderQualityButton = ({ quality, label, colorKey, icon: Icon }: QualityButtonConfig) => (
    <TouchableOpacity 
      key={quality}
      style={[styles.reviewButton, { backgroundColor: styles.reviewQualityColors[colorKey] }]}
      onPress={() => onReview(quality)}
      disabled={isReviewing}
    >
      <Icon size={theme.dimensions.iconSize.lg} color={theme.colors.text.inverse} style={{ marginBottom: theme.layout.xs }} />
      <Text style={styles.reviewButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.reviewButtonsContainer}>
      {qualityButtons.map(renderQualityButton)}
    </View>
  );
}; 