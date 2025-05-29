import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from '../src/ui/hooks/useTranslation';
import {
  TranslationModeSelector,
  TranslationExercise,
  TranslationEvaluationComponent,
  TranslationSessionComplete,
} from '../src/ui/components/translation';

export default function TranslationScreen() {
  const router = useRouter();
  const {
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
  } = useTranslation();

  // Determine what to render
  if (showModeSelector || !currentTranslationSession) {
    return (
      <TranslationModeSelector
        difficulty={difficulty}
        direction={direction}
        exerciseCount={exerciseCount}
        isLoading={isLoading}
        error={error}
        onDifficultyChange={setDifficulty}
        onDirectionChange={setDirection}
        onExerciseCountChange={setExerciseCount}
        onStartSession={handleStartSession}
        onBack={() => router.back()}
      />
    );
  }

  if (!currentExercise) {
    return (
      <TranslationSessionComplete
        sessionStats={sessionStats}
        onStartNewSession={resetToModeSelector}
        onBackToDashboard={() => router.back()}
      />
    );
  }

  if (showEvaluation && lastTranslationEvaluation && lastSubmittedExercise) {
    return (
      <TranslationEvaluationComponent
        evaluation={lastTranslationEvaluation}
        submittedExercise={lastSubmittedExercise}
        userTranslation={lastUserTranslation}
        direction={direction}
        currentTranslationSession={currentTranslationSession}
        onNextExercise={handleNextExercise}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <TranslationExercise
      currentExercise={currentExercise}
      currentTranslationSession={currentTranslationSession}
      direction={direction}
      userTranslation={userTranslation}
      isLoading={isLoading}
      onUserTranslationChange={setUserTranslation}
      onSubmitTranslation={handleSubmitTranslation}
      onPlayTTS={playTTS}
      onBack={() => router.back()}
    />
  );
} 