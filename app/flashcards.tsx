import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useFlashcardLogic } from "../src/ui/hooks/useFlashcardLogic";
import { useThemedStyles } from "../src/ui/theme";
import { Screen, Button } from "../src/ui/components/themed";
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
    sessionSummary,

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

  const styles = useThemedStyles((theme) => ({
    cardContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      padding: theme.layout.md,
    },
  }));

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Screen>
      {isSessionComplete ? (
        <CompletionState
          onStartNewSession={() => setShowModeSelector(true)}
          onBackToDashboard={() => router.back()}
          reviewedWords={sessionSummary?.reviewedWords || []}
          sessionStats={sessionSummary?.sessionStats}
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
              onRevealAnswer={handleShowAnswer}
            />

            {!showAnswer ? (
              <Button
                title={flashcardSettings.deckFlipped ? 'Check Answer' : 'Show Answer'}
                variant="primary"
                size="large"
                onPress={handleShowAnswer}
                style={{ alignSelf: 'center' as const }}
              />
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
    </Screen>
  );
}