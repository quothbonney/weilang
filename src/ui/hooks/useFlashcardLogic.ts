import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useStore } from './useStore';
import { ReviewQuality, Word, ReviewMode } from '../../domain/entities';

export const useFlashcardLogic = () => {
  const {
    currentSession,
    reviewSettings,
    reviewMode,
    startReviewSession,
    getNextCard,
    reviewWord,
    advanceSession,
    requeueCard,
    updateReviewSettings,
    setReviewMode,
    isLoading,
    flashcardSettings,
    setFlashcardSettings,
    startSessionTracking,
    addReviewedWord,
    getSessionSummary,
    resetSessionTracking
  } = useStore();

  const [currentCard, setCurrentCard] = useState<Word | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  
  // For deck flipped mode (English → Chinese)
  const [userInput, setUserInput] = useState('');
  const [inputFeedback, setInputFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Initialize session
  useEffect(() => {
    if (!currentSession) {
      startReviewSession('mixed');
    }
  }, [currentSession, startReviewSession]);

  // Update current card when session changes
  useEffect(() => {
    if (currentSession) {
      const nextCard = getNextCard();
      setCurrentCard(nextCard);
      resetCardState();
    }
  }, [currentSession, getNextCard]);

  const resetCardState = () => {
    setShowAnswer(false);
    setUserInput('');
    setInputFeedback(null);
  };

  const handleReview = async (quality: ReviewQuality) => {
    if (!currentCard || isReviewing) return;

    setIsReviewing(true);
    try {
      // Store previous state for tracking
      const previousState = {
        status: currentCard.status,
        ease: currentCard.ease,
        interval: currentCard.interval,
      };

      const updatedCard = await reviewWord(currentCard.id, quality);

      // Track this review
      addReviewedWord(updatedCard, previousState, quality);

      if (quality === 'again') {
        // For wrong answers, requeue the card and don't advance
        requeueCard(currentCard);
      } else {
        // For correct answers, advance normally
        advanceSession();
      }

      if (quality === 'again' || updatedCard.status === 'learning') {
        requeueCard(updatedCard);
      }

      const nextCard = getNextCard();
      setCurrentCard(nextCard);
      resetCardState();
    } catch (error) {
      console.error('Error reviewing word:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleStartNewSession = (mode: ReviewMode) => {
    setShowModeSelector(false);
    startReviewSession(mode);
  };

  const handleInputSubmit = () => {
    if (!currentCard || !userInput.trim()) return;

    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = currentCard.hanzi.toLowerCase();
    
    const isCorrect = userAnswer === correctAnswer;
    setInputFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);

    if (!isCorrect) {
      Alert.alert(
        'Answer Check',
        `Your answer: ${userInput}\nCorrect answer: ${currentCard.hanzi}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleShowAnswer = () => {
    if (flashcardSettings.deckFlipped && flashcardSettings.typingMode && !showAnswer) {
      handleInputSubmit();
    } else {
      setShowAnswer(true);
    }
  };

  const isSessionComplete = !currentSession || !currentCard;
  const sessionSummary = getSessionSummary();

  return {
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
  };
}; 