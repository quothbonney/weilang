import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/ui/hooks/useStore';
import { SentenceExercise, TranslationSession, TranslationEvaluation } from '../src/domain/entities';
import { ArrowLeft, Languages, CheckCircle, XCircle, TrendingUp, Volume2 } from 'lucide-react-native';
import { speakWithAzure } from '../src/infra/tts/azureTts';
import * as Speech from "expo-speech";

export default function TranslationScreen() {
  const router = useRouter();
  const {
    currentTranslationSession,
    lastTranslationEvaluation,
    isLoading,
    error,
    startTranslationSession,
    submitTranslation,
    getCurrentTranslationExercise,
    getTranslationSessionStats,
    clearError
  } = useStore();

  // UI State
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [userTranslation, setUserTranslation] = useState('');
  const [currentUserTranslation, setCurrentUserTranslation] = useState(''); // Store the translation for current feedback
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<SentenceExercise | null>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);

  // Session settings
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [direction, setDirection] = useState<'en-to-zh' | 'zh-to-en'>('zh-to-en');
  const [exerciseCount, setExerciseCount] = useState(5);

  useEffect(() => {
    if (currentTranslationSession) {
      setShowModeSelector(false);
      const exercise = getCurrentTranslationExercise();
      setCurrentExercise(exercise);
      
      if (!exercise) {
        // Session complete
        handleSessionComplete();
      }
    }
  }, [currentTranslationSession]);

  useEffect(() => {
    if (lastTranslationEvaluation) {
      setShowEvaluation(true);
    }
  }, [lastTranslationEvaluation]);

  const handleStartSession = async () => {
    try {
      clearError();
      // Reset all state when starting a new session
      setUserTranslation('');
      setCurrentUserTranslation('');
      setShowEvaluation(false);
      setCurrentExercise(null);
      setSessionStats(null);
      
      await startTranslationSession(difficulty, direction, exerciseCount);
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start translation session. Please check your API key and try again.');
    }
  };

  const handleSubmitTranslation = async () => {
    if (!currentExercise || !currentTranslationSession || !userTranslation.trim()) {
      return;
    }

    try {
      clearError();
      // Store the current user translation for feedback display
      setCurrentUserTranslation(userTranslation.trim());
      
      const result = await submitTranslation(
        currentTranslationSession.id,
        currentExercise.id,
        userTranslation.trim()
      );

      if (result.isSessionComplete) {
        handleSessionComplete();
      }
    } catch (error) {
      console.error('Failed to submit translation:', error);
      Alert.alert('Error', 'Failed to evaluate translation. Please try again.');
    }
  };

  const handleNextExercise = () => {
    setShowEvaluation(false);
    setUserTranslation('');
    setCurrentUserTranslation(''); // Clear the stored translation
    const nextExercise = getCurrentTranslationExercise();
    setCurrentExercise(nextExercise);
    
    if (!nextExercise) {
      handleSessionComplete();
    }
  };

  const handleSessionComplete = async () => {
    if (currentTranslationSession) {
      try {
        const stats = await getTranslationSessionStats(currentTranslationSession.id);
        setSessionStats(stats);
      } catch (error) {
        console.error('Failed to get session stats:', error);
      }
    }
  };

  const playTTS = async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const renderModeSelector = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Sentence Translation</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Languages size={32} color="#3b82f6" />
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
                onPress={() => setDifficulty(level)}
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
              onPress={() => setDirection('zh-to-en')}
            >
              <Text style={[styles.optionText, direction === 'zh-to-en' && styles.optionTextActive]}>
                Chinese → English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, direction === 'en-to-zh' && styles.optionButtonActive]}
              onPress={() => setDirection('en-to-zh')}
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
                onPress={() => setExerciseCount(count)}
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
          onPress={handleStartSession}
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

  const renderExercise = () => {
    if (!currentExercise) return null;

    const sourceText = direction === 'zh-to-en' ? currentExercise.chinese.hanzi : currentExercise.english;
    const targetLanguage = direction === 'zh-to-en' ? 'English' : 'Chinese';

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Translation Exercise</Text>
        </View>

        {/* Progress indicator */}
        {currentTranslationSession && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Exercise {currentTranslationSession.currentExerciseIndex + 1} of {currentTranslationSession.exercises.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentTranslationSession.currentExerciseIndex + 1) / currentTranslationSession.exercises.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.exerciseCard}>
          <View style={styles.sourceSection}>
            <Text style={styles.sourceLabel}>Translate this to {targetLanguage}:</Text>
            <View style={styles.sourceTextContainer}>
              <Text style={styles.sourceText}>{sourceText}</Text>
              {direction === 'zh-to-en' && (
                <TouchableOpacity 
                  style={styles.speakerButton}
                  onPress={() => playTTS(currentExercise.chinese.hanzi)}
                >
                  <Volume2 size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
            {direction === 'zh-to-en' && (
              <Text style={styles.pinyinText}>{currentExercise.chinese.pinyin}</Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Your translation:</Text>
            <TextInput
              style={styles.translationInput}
              value={userTranslation}
              onChangeText={setUserTranslation}
              placeholder={`Enter your ${targetLanguage} translation...`}
              multiline
              textAlignVertical="top"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, !userTranslation.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitTranslation}
            disabled={!userTranslation.trim() || isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Evaluating...' : 'Submit Translation'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderEvaluation = () => {
    if (!lastTranslationEvaluation || !currentExercise) return null;

    const evaluation = lastTranslationEvaluation;
    const expectedText = direction === 'zh-to-en' ? currentExercise.english : currentExercise.chinese.hanzi;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Translation Feedback</Text>
        </View>

        <View style={styles.evaluationCard}>
          {/* Overall Score */}
          <View style={styles.scoreSection}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(evaluation.overallScore) }]}>
              <Text style={[styles.scoreText, { color: getScoreColor(evaluation.overallScore) }]}>
                {evaluation.overallScore}
              </Text>
            </View>
            <Text style={styles.scoreLabel}>Overall Score</Text>
          </View>

          {/* Original Sentence */}
          <View style={styles.comparisonSection}>
            <View style={styles.translationItem}>
              <Text style={styles.translationLabel}>Original Sentence:</Text>
              <Text style={styles.originalSentenceText}>
                {direction === 'zh-to-en' ? currentExercise.chinese.hanzi : currentExercise.english}
              </Text>
              {direction === 'zh-to-en' && (
                <Text style={styles.pinyinText}>{currentExercise.chinese.pinyin}</Text>
              )}
            </View>
            <View style={styles.translationItem}>
              <Text style={styles.translationLabel}>Your Translation:</Text>
              <Text style={styles.userTranslationText}>{currentUserTranslation}</Text>
            </View>
            <View style={styles.translationItem}>
              <Text style={styles.translationLabel}>Expected Translation:</Text>
              <Text style={styles.expectedTranslationText}>{expectedText}</Text>
            </View>
          </View>

          {/* Detailed Feedback */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Detailed Feedback</Text>
            
            {/* Category Scores */}
            <View style={styles.categoryScores}>
              {Object.entries(evaluation.detailedFeedback).map(([category, feedback]) => (
                <View key={category} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  <Text style={[styles.categoryScore, { color: getScoreColor(feedback.score) }]}>
                    {feedback.score}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Overall Feedback */}
            <View style={styles.feedbackItem}>
              <Text style={styles.feedbackItemTitle}>Overall Assessment</Text>
              <Text style={styles.feedbackItemText}>{evaluation.overallFeedback}</Text>
            </View>

            {/* Encouragement */}
            <View style={styles.feedbackItem}>
              <Text style={styles.feedbackItemTitle}>What You Did Well</Text>
              <Text style={styles.encouragementText}>{evaluation.encouragement}</Text>
            </View>

            {/* Next Steps */}
            <View style={styles.feedbackItem}>
              <Text style={styles.feedbackItemTitle}>Next Steps</Text>
              {evaluation.nextSteps.map((step, index) => (
                <Text key={index} style={styles.nextStepText}>• {step}</Text>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextExercise}
          >
            <Text style={styles.nextButtonText}>
              {currentTranslationSession && getCurrentTranslationExercise() ? 'Next Exercise' : 'View Results'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderSessionComplete = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Session Complete!</Text>
      </View>

      <View style={styles.completionCard}>
        <CheckCircle size={64} color="#10b981" />
        <Text style={styles.completionTitle}>Great Work!</Text>
        <Text style={styles.completionText}>
          You've completed your translation practice session.
        </Text>

        {sessionStats && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Session Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionStats.completedExercises}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(sessionStats.averageScore)}%</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(sessionStats.timeSpent / 60000)}m</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.newSessionButton}
            onPress={() => {
              // Reset all state when going back to mode selector
              setUserTranslation('');
              setCurrentUserTranslation('');
              setShowEvaluation(false);
              setCurrentExercise(null);
              setSessionStats(null);
              setShowModeSelector(true);
            }}
          >
            <Text style={styles.newSessionButtonText}>Start New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backToDashboardButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToDashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // Determine what to render
  if (showModeSelector || !currentTranslationSession) {
    return renderModeSelector();
  }

  if (!currentExercise) {
    return renderSessionComplete();
  }

  if (showEvaluation && lastTranslationEvaluation) {
    return renderEvaluation();
  }

  return renderExercise();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  optionButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionTextActive: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sourceSection: {
    marginBottom: 24,
  },
  sourceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sourceTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 20,
    color: '#1f2937',
    flex: 1,
    lineHeight: 28,
  },
  speakerButton: {
    padding: 8,
    marginLeft: 12,
  },
  pinyinText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },

  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  translationInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  evaluationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  comparisonSection: {
    marginBottom: 24,
  },
  translationItem: {
    marginBottom: 16,
  },
  translationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  originalSentenceText: {
    fontSize: 18,
    color: '#1f2937',
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    fontWeight: '500',
  },
  userTranslationText: {
    fontSize: 16,
    color: '#1f2937',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  expectedTranslationText: {
    fontSize: 16,
    color: '#1f2937',
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoryScores: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryName: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  categoryScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackItem: {
    marginBottom: 16,
  },
  feedbackItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  feedbackItemText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  encouragementText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  nextStepText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsSection: {
    width: '100%',
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  newSessionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newSessionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backToDashboardButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToDashboardButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
}); 