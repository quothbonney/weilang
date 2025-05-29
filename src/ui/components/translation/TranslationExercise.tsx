import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Volume2 } from 'lucide-react-native';
import { SentenceExercise, TranslationSession } from '../../../domain/entities';
import { translationStyles } from './translationStyles';

interface TranslationExerciseProps {
  currentExercise: SentenceExercise;
  currentTranslationSession: TranslationSession;
  direction: 'en-to-zh' | 'zh-to-en';
  userTranslation: string;
  isLoading: boolean;
  onUserTranslationChange: (text: string) => void;
  onSubmitTranslation: () => void;
  onPlayTTS: (text: string) => void;
  onBack: () => void;
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
  onBack,
}: TranslationExerciseProps) {
  const sourceText = direction === 'zh-to-en' ? currentExercise.chinese.hanzi : currentExercise.english;
  const targetLanguage = direction === 'zh-to-en' ? 'English' : 'Chinese';

  return (
    <ScrollView style={translationStyles.container} contentContainerStyle={translationStyles.scrollContent}>
      <View style={translationStyles.header}>
        <TouchableOpacity style={translationStyles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={translationStyles.title}>Translation Exercise</Text>
      </View>

      {/* Progress indicator */}
      <View style={translationStyles.progressContainer}>
        <Text style={translationStyles.progressText}>
          Exercise {currentTranslationSession.currentExerciseIndex + 1} of {currentTranslationSession.exercises.length}
        </Text>
        <View style={translationStyles.progressBar}>
          <View 
            style={[
              translationStyles.progressFill, 
              { width: `${((currentTranslationSession.currentExerciseIndex + 1) / currentTranslationSession.exercises.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={translationStyles.exerciseCard}>
        <View style={translationStyles.sourceSection}>
          <Text style={translationStyles.sourceLabel}>Translate this to {targetLanguage}:</Text>
          <View style={translationStyles.sourceTextContainer}>
            <Text style={translationStyles.sourceText}>{sourceText}</Text>
            {direction === 'zh-to-en' && (
              <TouchableOpacity 
                style={translationStyles.speakerButton}
                onPress={() => onPlayTTS(currentExercise.chinese.hanzi)}
              >
                <Volume2 size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          {direction === 'zh-to-en' && (
            <Text style={translationStyles.pinyinText}>{currentExercise.chinese.pinyin}</Text>
          )}
        </View>

        <View style={translationStyles.inputSection}>
          <Text style={translationStyles.inputLabel}>Your translation:</Text>
          <TextInput
            style={translationStyles.translationInput}
            value={userTranslation}
            onChangeText={onUserTranslationChange}
            placeholder={`Enter your ${targetLanguage} translation...`}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[translationStyles.submitButton, !userTranslation.trim() && translationStyles.submitButtonDisabled]}
          onPress={onSubmitTranslation}
          disabled={!userTranslation.trim() || isLoading}
        >
          <Text style={translationStyles.submitButtonText}>
            {isLoading ? 'Evaluating...' : 'Submit Translation'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 