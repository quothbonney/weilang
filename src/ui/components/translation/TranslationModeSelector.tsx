import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Languages, ArrowLeft } from 'lucide-react-native';
import { translationStyles } from './translationStyles';

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
  onBack: () => void;
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
  onBack,
}: TranslationModeSelectorProps) {
  return (
    <ScrollView style={translationStyles.container} contentContainerStyle={translationStyles.scrollContent}>
      <View style={translationStyles.header}>
        <TouchableOpacity style={translationStyles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={translationStyles.title}>Sentence Translation</Text>
      </View>

      <View style={translationStyles.card}>
        <View style={translationStyles.cardHeader}>
          <Languages size={32} color="#3b82f6" />
          <Text style={translationStyles.cardTitle}>Start Translation Practice</Text>
          <Text style={translationStyles.cardDescription}>
            Practice translating sentences using words you've learned
          </Text>
        </View>

        <View style={translationStyles.settingsSection}>
          <Text style={translationStyles.settingsTitle}>Difficulty</Text>
          <View style={translationStyles.optionGroup}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[translationStyles.optionButton, difficulty === level && translationStyles.optionButtonActive]}
                onPress={() => onDifficultyChange(level)}
              >
                <Text style={[translationStyles.optionText, difficulty === level && translationStyles.optionTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={translationStyles.settingsSection}>
          <Text style={translationStyles.settingsTitle}>Direction</Text>
          <View style={translationStyles.optionGroup}>
            <TouchableOpacity
              style={[translationStyles.optionButton, direction === 'zh-to-en' && translationStyles.optionButtonActive]}
              onPress={() => onDirectionChange('zh-to-en')}
            >
              <Text style={[translationStyles.optionText, direction === 'zh-to-en' && translationStyles.optionTextActive]}>
                Chinese → English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[translationStyles.optionButton, direction === 'en-to-zh' && translationStyles.optionButtonActive]}
              onPress={() => onDirectionChange('en-to-zh')}
            >
              <Text style={[translationStyles.optionText, direction === 'en-to-zh' && translationStyles.optionTextActive]}>
                English → Chinese
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={translationStyles.settingsSection}>
          <Text style={translationStyles.settingsTitle}>Number of Exercises</Text>
          <View style={translationStyles.optionGroup}>
            {[3, 5, 10].map((count) => (
              <TouchableOpacity
                key={count}
                style={[translationStyles.optionButton, exerciseCount === count && translationStyles.optionButtonActive]}
                onPress={() => onExerciseCountChange(count)}
              >
                <Text style={[translationStyles.optionText, exerciseCount === count && translationStyles.optionTextActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={translationStyles.startButton}
          onPress={onStartSession}
          disabled={isLoading}
        >
          <Text style={translationStyles.startButtonText}>
            {isLoading ? 'Generating Exercises...' : 'Start Practice'}
          </Text>
        </TouchableOpacity>

        {error && (
          <View style={translationStyles.errorContainer}>
            <Text style={translationStyles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
} 