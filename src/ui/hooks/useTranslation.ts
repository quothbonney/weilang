import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useStore } from './useStore';
import { SentenceExercise } from '../../domain/entities';
import { speakWithAzure } from '../../infra/tts/azureTts';
import * as Speech from "expo-speech";

export function useTranslation() {
  const {
    currentTranslationSession,
    lastTranslationEvaluation,
    isLoading,
    error,
    startTranslationSession,
    submitTranslation,
    getCurrentTranslationExercise,
    skipCurrentTranslationExercise,
    getTranslationSessionStats,
    clearError
  } = useStore();

  // UI State
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [userTranslation, setUserTranslation] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<SentenceExercise | null>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);

  // Session settings
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [direction, setDirection] = useState<'en-to-zh' | 'zh-to-en'>('zh-to-en');
  const [exerciseCount, setExerciseCount] = useState(5);

  // Cache for last submitted exercise and translation
  const [lastSubmittedExercise, setLastSubmittedExercise] = useState<SentenceExercise | null>(null);
  const [lastUserTranslation, setLastUserTranslation] = useState('');

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
      // Cache the current exercise and user translation for feedback
      setLastSubmittedExercise(currentExercise);
      setLastUserTranslation(userTranslation.trim());
      
      await submitTranslation(
        currentTranslationSession.id,
        currentExercise.id,
        userTranslation.trim()
      );
    } catch (error) {
      console.error('Failed to submit translation:', error);
      Alert.alert('Error', 'Failed to evaluate translation. Please try again.');
    }
  };

  const handleNextExercise = () => {
    setShowEvaluation(false);
    setUserTranslation('');
    setLastSubmittedExercise(null);
    setLastUserTranslation('');
    
    // Check if there are more exercises
    const nextExercise = getCurrentTranslationExercise();
    setCurrentExercise(nextExercise);
    
    if (!nextExercise) {
      // No more exercises, session is complete
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

  const resetToModeSelector = () => {
    setUserTranslation('');
    setShowEvaluation(false);
    setCurrentExercise(null);
    setSessionStats(null);
    setShowModeSelector(true);
  };

  const handleSkipExercise = () => {
    // Skip this exercise without penalty - clear current state and advance
    setUserTranslation('');
    setShowEvaluation(false);
    setLastSubmittedExercise(null);
    setLastUserTranslation('');
    
    // Use the store's skip function to advance the session state
    skipCurrentTranslationExercise();
    
    // Get the next exercise using the updated session state
    const nextExercise = getCurrentTranslationExercise();
    setCurrentExercise(nextExercise);
    
    if (!nextExercise) {
      // No more exercises, session is complete
      handleSessionComplete();
    }
  };

  const handleEndSession = () => {
    // End the session immediately and go back to mode selector
    resetToModeSelector();
  };

  return {
    // State
    showModeSelector,
    userTranslation,
    showEvaluation,
    currentExercise,
    sessionStats,
    difficulty,
    direction,
    exerciseCount,
    lastSubmittedExercise,
    lastUserTranslation,
    
    // Store state
    currentTranslationSession,
    lastTranslationEvaluation,
    isLoading,
    error,
    
    // Actions
    setDifficulty,
    setDirection,
    setExerciseCount,
    setUserTranslation,
    handleStartSession,
    handleSubmitTranslation,
    handleNextExercise,
    playTTS,
    resetToModeSelector,
    handleSkipExercise,
    handleEndSession,
  };
} 