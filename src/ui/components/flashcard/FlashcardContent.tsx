import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Shuffle, Eye, EyeOff } from 'lucide-react-native';
import * as Speech from "expo-speech";
import { speakWithAzure } from '../../../infra/tts/azureTts';
import { Word } from '../../../domain/entities';

interface FlashcardContentProps {
  currentCard: Word;
  flashcardSettings: {
    showPinyin: boolean;
    deckFlipped: boolean;
    typingMode: boolean;
    autoPlayTTS: boolean;
  };
  showAnswer: boolean;
  userInput: string;
  inputFeedback: 'correct' | 'incorrect' | null;
  onInputChange: (text: string) => void;
  onInputSubmit: () => void;
}

export const FlashcardContent: React.FC<FlashcardContentProps> = ({
  currentCard,
  flashcardSettings,
  showAnswer,
  userInput,
  inputFeedback,
  onInputChange,
  onInputSubmit,
}) => {

  const previousShowAnswer = useRef(false);
  const currentCardId = useRef(currentCard.id);

  // Auto-play TTS when answer is revealed in en-to-zh mode
  useEffect(() => {
    // Reset tracking when card changes
    if (currentCardId.current !== currentCard.id) {
      currentCardId.current = currentCard.id;
      previousShowAnswer.current = false;
    }

    // Only play TTS when transitioning from hidden to shown answer
    const shouldAutoPlay = flashcardSettings.autoPlayTTS && 
                          flashcardSettings.deckFlipped && 
                          showAnswer && 
                          !previousShowAnswer.current;
    
    if (shouldAutoPlay) {
      playTTS(currentCard.hanzi);
    }

    previousShowAnswer.current = showAnswer;
  }, [showAnswer, flashcardSettings.autoPlayTTS, flashcardSettings.deckFlipped, currentCard.id, currentCard.hanzi]);

  const playTTS = async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  };

  const renderFlippedTypingMode = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Shuffle size={16} color="#8b5cf6" />
          <Text style={styles.deckIndicatorText}>EN → ZH ✏️</Text>
        </View>
      </View>
      
      <Text style={styles.englishPrompt}>Write the Chinese characters for:</Text>
      <Text style={styles.meaning}>{currentCard.meaning}</Text>
      
      {!showAnswer && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.chineseInput,
              inputFeedback === 'correct' && styles.inputCorrect,
              inputFeedback === 'incorrect' && styles.inputIncorrect
            ]}
            value={userInput}
            onChangeText={onInputChange}
            placeholder="输入汉字..."
            placeholderTextColor="#9ca3af"
            autoFocus
            onSubmitEditing={onInputSubmit}
          />
          <Text style={styles.inputHint}>Type the Chinese characters</Text>
        </View>
      )}
      
      {showAnswer && (
        <>
          <View style={styles.divider} />
          <View style={styles.answerSection}>
            <Text style={styles.correctAnswerLabel}>Correct Answer:</Text>
            <Text style={styles.hanzi}>{currentCard.hanzi}</Text>
            {flashcardSettings.showPinyin && (
              <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
            )}
            
            {inputFeedback && (
              <View style={[
                styles.feedbackContainer,
                inputFeedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect
              ]}>
                <Text style={styles.feedbackText}>
                  {inputFeedback === 'correct'
                     ? `✓ Correct! You wrote: ${userInput}`
                     : `✗ Your answer: ${userInput}`
                  }
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
        </>
      )}
    </View>
  );

  const renderFlippedMode = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Shuffle size={16} color="#8b5cf6" />
          <Text style={styles.deckIndicatorText}>EN → ZH</Text>
        </View>
      </View>
      
      <Text style={styles.englishPrompt}>Recall the Chinese characters for:</Text>
      <Text style={styles.meaning}>{currentCard.meaning}</Text>
      
      {showAnswer && (
        <>
          <View style={styles.divider} />
          <Text style={styles.hanzi}>{currentCard.hanzi}</Text>
          {flashcardSettings.showPinyin && (
            <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
          )}
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
        </>
      )}
    </View>
  );

  const renderNormalMode = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Eye size={16} color="#3b82f6" />
          <Text style={styles.deckIndicatorText}>ZH → EN</Text>
        </View>
      </View>
      
      <Text style={styles.hanzi}>{currentCard.hanzi}</Text>
      {flashcardSettings.showPinyin && (
        <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
      )}
      
      {showAnswer && (
        <>
          <View style={styles.divider} />
          <Text style={styles.meaning}>{currentCard.meaning}</Text>
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
        </>
      )}
    </View>
  );

  if (flashcardSettings.deckFlipped) {
    return flashcardSettings.typingMode ? renderFlippedTypingMode() : renderFlippedMode();
  }
  
  return renderNormalMode();
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  deckIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deckIndicatorText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  hanzi: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  pinyin: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 8,
  },
  meaning: {
    fontSize: 24,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  englishPrompt: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  chineseInput: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  inputCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  inputIncorrect: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  answerSection: {
    alignItems: 'center',
    width: '100%',
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  feedbackContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
  },
  feedbackCorrect: {
    backgroundColor: '#ecfdf5',
  },
  feedbackIncorrect: {
    backgroundColor: '#fef2f2',
  },
  feedbackText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#374151',
  },
  wordStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  wordStatsText: {
    fontSize: 12,
    color: '#9ca3af',
  },
}); 