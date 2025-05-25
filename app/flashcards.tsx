import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useFlashcardLogic } from "../src/ui/hooks/useFlashcardLogic";
import {
  FlashcardHeader,
  ProgressSection,
  FlashcardContent,
  ReviewButtons,
  ReviewModeSelector,
  SettingsPanel,
  LoadingState,
  CompletionState,
} from "../src/ui/components/flashcard";

export default function FlashcardsScreen() {
  const router = useRouter();
  const {
    // State
    currentCard,
    currentSession,
    reviewMode,
    reviewSettings,
    flashcardSettings,
    showAnswer,
    isReviewing,
    showSettings,
    showModeSelector,
    userInput,
    inputFeedback,
    isLoading,
    isSessionComplete,

    // Actions
    handleReview,
    handleStartNewSession,
    handleInputSubmit,
    handleShowAnswer,
    setUserInput,
    setShowSettings,
    setShowModeSelector,
    updateReviewSettings,
    setFlashcardSettings,
  } = useFlashcardLogic();

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Render main flashcard screen or completion state
  return (
    <View style={styles.container}>
      {isSessionComplete ? (
        <CompletionState
          onStartNewSession={() => setShowModeSelector(true)}
          onBackToDashboard={() => router.back()}
        />
      ) : (
        <>
          {/* Header with session info and controls */}
          <FlashcardHeader
            reviewMode={reviewMode}
            currentSession={currentSession!}
            flashcardSettings={flashcardSettings}
            onOpenModeSelector={() => setShowModeSelector(true)}
            onOpenSettings={() => setShowSettings(true)}
          />

      {/* Progress and card type indicator */}
      <ProgressSection
        currentCard={currentCard!}
        currentSession={currentSession!}
      />

      {/* Main Card */}
      <View style={styles.cardContainer}>
        <FlashcardContent
          currentCard={currentCard!}
          flashcardSettings={flashcardSettings}
          showAnswer={showAnswer}
          userInput={userInput}
          inputFeedback={inputFeedback}
          onInputChange={setUserInput}
          onInputSubmit={handleInputSubmit}
        />
        
        {!showAnswer ? (
          <TouchableOpacity 
            style={styles.showButton}
            onPress={handleShowAnswer}
          >
            <Text style={styles.showButtonText}>
              {flashcardSettings.deckFlipped ? 'Check Answer' : 'Show Answer'}
            </Text>
          </TouchableOpacity>
        ) : (
          <ReviewButtons
            onReview={handleReview}
            isReviewing={isReviewing}
          />
        )}
      </View>
        </>
      )}

      {/* Modals */}
      <ReviewModeSelector
        visible={showModeSelector}
        reviewMode={reviewMode}
        flashcardSettings={flashcardSettings}
        onClose={() => setShowModeSelector(false)}
        onSelectMode={handleStartNewSession}
        onUpdateFlashcardSettings={setFlashcardSettings}
      />

      <SettingsPanel
        visible={showSettings}
        reviewSettings={reviewSettings}
        onClose={() => setShowSettings(false)}
        onUpdateSettings={updateReviewSettings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  showButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  showButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
});