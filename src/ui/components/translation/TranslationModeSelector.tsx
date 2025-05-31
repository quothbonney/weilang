import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Languages } from 'lucide-react-native';
import { useTranslationStyles, useTheme } from '../../theme';

interface TranslationModeSelectorProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  direction: 'en-to-zh' | 'zh-to-en';
  exerciseCount: number;
  isLoading: boolean;
  error: string | null;
  onDifficultyChange: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  onDirectionChange: (direction: 'en-to-zh' | 'zh-to-en') => void;
  onExerciseCountChange: (count: number) => void;
  onStartSession: () => void;
}

export function TranslationModeSelector({
  difficulty,
  direction,
  exerciseCount,
  isLoading,
  error,
  onDifficultyChange,
  onDirectionChange,
  onExerciseCountChange,
  onStartSession,
}: TranslationModeSelectorProps) {
  const styles = useTranslationStyles();
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Languages size={32} color={theme.colors.interactive.primary} />
          <Text style={styles.cardTitle}>Start Translation Practice</Text>
          <Text style={styles.cardDescription}>
            Practice translating sentences using words you've learned
          </Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Difficulty</Text>
          <View style={styles.optionGroup}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.optionButton, difficulty === level && styles.optionButtonActive]}
                onPress={() => onDifficultyChange(level)}
              >
                <Text style={[styles.optionText, difficulty === level && styles.optionTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Direction</Text>
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={[styles.optionButton, direction === 'zh-to-en' && styles.optionButtonActive]}
              onPress={() => onDirectionChange('zh-to-en')}
            >
              <Text style={[styles.optionText, direction === 'zh-to-en' && styles.optionTextActive]}>
                Chinese → English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, direction === 'en-to-zh' && styles.optionButtonActive]}
              onPress={() => onDirectionChange('en-to-zh')}
            >
              <Text style={[styles.optionText, direction === 'en-to-zh' && styles.optionTextActive]}>
                English → Chinese
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Number of Exercises</Text>
          <View style={styles.optionGroup}>
            {[3, 5, 10].map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.optionButton, exerciseCount === count && styles.optionButtonActive]}
                onPress={() => onExerciseCountChange(count)}
              >
                <Text style={[styles.optionText, exerciseCount === count && styles.optionTextActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={onStartSession}
          disabled={isLoading}
        >
          <Text style={styles.startButtonText}>
            {isLoading ? 'Generating Exercises...' : 'Start Practice'}
          </Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
} 