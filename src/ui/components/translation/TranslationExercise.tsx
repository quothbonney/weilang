import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { useTranslationStyles, useTheme } from '../../theme';

interface TranslationExerciseProps {
  currentExercise: any;
  currentTranslationSession: any;
  direction: 'en-to-zh' | 'zh-to-en';
  userTranslation: string;
  isLoading: boolean;
  onUserTranslationChange: (text: string) => void;
  onSubmitTranslation: () => void;
  onPlayTTS: (text: string) => void;
  onEndSession: () => void;
  onSkipExercise: () => void;
}

export function TranslationExercise({
  currentExercise,
  currentTranslationSession,
  direction,
  userTranslation,
  isLoading,
  onUserTranslationChange,
  onSubmitTranslation,
  onPlayTTS,
  onEndSession,
  onSkipExercise,
}: TranslationExerciseProps) {
  const styles = useTranslationStyles();
  const { theme } = useTheme();

  const isChineseToEnglish = direction === 'zh-to-en';
  const sourceSentence = isChineseToEnglish 
    ? currentExercise.chinese.hanzi 
    : currentExercise.english;
  const targetLanguage = isChineseToEnglish ? 'English' : 'Chinese';

  const currentIndex = currentTranslationSession.exercises.indexOf(currentExercise) + 1;
  const totalExercises = currentTranslationSession.exercises.length;
  const progress = currentIndex / totalExercises;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Exercise {currentIndex} of {totalExercises}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.exerciseCard}>
        <View style={styles.sourceSection}>
          <Text style={styles.sourceLabel}>Translate this sentence:</Text>
          
          <View style={styles.sourceTextContainer}>
            <Text style={styles.sourceText}>{sourceSentence}</Text>
            {isChineseToEnglish && (
              <TouchableOpacity 
                style={styles.speakerButton}
                onPress={() => onPlayTTS(sourceSentence)}
              >
                <Volume2 size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          
          {isChineseToEnglish && currentExercise.chinese.pinyin && (
            <Text style={styles.pinyinText}>{currentExercise.chinese.pinyin}</Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Your {targetLanguage} translation:</Text>
          <TextInput
            style={styles.translationInput}
            value={userTranslation}
            onChangeText={onUserTranslationChange}
            placeholder={`Type your ${targetLanguage} translation here...`}
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!userTranslation.trim() || isLoading) && styles.submitButtonDisabled]}
          onPress={onSubmitTranslation}
          disabled={!userTranslation.trim() || isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Evaluating...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.headerButton} onPress={onSkipExercise}>
          <Text style={styles.headerButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButtonDanger} onPress={onEndSession}>
          <Text style={styles.headerButtonTextDanger}>End</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 