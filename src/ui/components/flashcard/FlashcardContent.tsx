import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { HandwritingInput } from './HandwritingInput';
import { Shuffle, Eye, EyeOff, User, Volume2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Speech from "expo-speech";
import { speakWithAzure } from '../../../infra/tts/azureTts';
import { Word } from '../../../domain/entities';

interface FlashcardContentProps {
  currentCard: Word;
  flashcardSettings: {
    showPinyin: boolean;
    deckFlipped: boolean;
    typingMode: boolean;
    handwritingMode: boolean;
    autoPlayTTS: boolean;
  };
  showAnswer: boolean;
  userInput: string;
  inputFeedback: 'correct' | 'incorrect' | null;
  onInputChange: (text: string) => void;
  onInputSubmit: () => void;
  onRevealAnswer: () => void;
}

export const FlashcardContent: React.FC<FlashcardContentProps> = ({
  currentCard,
  flashcardSettings,
  showAnswer,
  userInput,
  inputFeedback,
  onInputChange,
  onInputSubmit,
  onRevealAnswer,
}) => {
  const router = useRouter();
  const ttsPlayedForThisRevealRef = useRef(false);
  const prevShowAnswerRef = useRef(showAnswer);
  const prevCardIdRef = useRef(currentCard.id);
  const isNewCardTransitionActiveRef = useRef(false);
  const ttsSuppressedUntil = useRef(0);

  const playTTS = useCallback(async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  }, []);

  // Auto-play TTS when answer is revealed in en-to-zh mode
  useEffect(() => {
    const cardIdChanged = prevCardIdRef.current !== currentCard.id;
    const justFlipped = !prevShowAnswerRef.current && showAnswer && !cardIdChanged;

    // On card change, always reset and never play TTS, and suppress TTS for 500ms
    if (cardIdChanged) {
      Speech.stop();
      ttsPlayedForThisRevealRef.current = false;
      ttsSuppressedUntil.current = Date.now() + 500;
      prevShowAnswerRef.current = showAnswer;
      prevCardIdRef.current = currentCard.id;
      return;
    }

    // Only play TTS if user explicitly flips the card (not on card change), and suppression window has passed
    if (
      justFlipped &&
      flashcardSettings.autoPlayTTS &&
      flashcardSettings.deckFlipped &&
      !ttsPlayedForThisRevealRef.current &&
      Date.now() > ttsSuppressedUntil.current
    ) {
      playTTS(currentCard.hanzi);
      ttsPlayedForThisRevealRef.current = true;
    }

    // Reset TTS flag if answer is hidden again
    if (!showAnswer) {
      ttsPlayedForThisRevealRef.current = false;
    }

    prevShowAnswerRef.current = showAnswer;
    prevCardIdRef.current = currentCard.id;
  }, [showAnswer, currentCard.id, flashcardSettings.autoPlayTTS, flashcardSettings.deckFlipped, currentCard.hanzi, playTTS]);

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
            <View style={styles.hanziWithSpeaker}>
              <Text style={styles.hanzi}>{currentCard.hanzi}</Text>
              <TouchableOpacity 
                style={styles.speakerButton}
                onPress={() => playTTS(currentCard.hanzi)}
              >
                <Volume2 size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>
            {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
            {!flashcardSettings.showPinyin && (
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
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push(`/profile/${currentCard.id}` as any)}
          >
            <User size={16} color="#3b82f6" />
            <Text style={styles.profileButtonText}>See Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderFlippedHandwritingMode = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Shuffle size={16} color="#8b5cf6" />
          <Text style={styles.deckIndicatorText}>EN → ZH ✍️</Text>
        </View>
      </View>

      <Text style={styles.englishPrompt}>Write the Chinese characters for:</Text>
      <Text style={styles.meaning}>{currentCard.meaning}</Text>

      {!showAnswer && (
        <HandwritingInput character={currentCard.hanzi} onComplete={onRevealAnswer} />
      )}

      {showAnswer && (
        <>
          <View style={styles.divider} />
          <View style={styles.hanziWithSpeaker}>
            <Text style={styles.hanzi}>{currentCard.hanzi}</Text>
            <TouchableOpacity
              style={styles.speakerButton}
              onPress={() => playTTS(currentCard.hanzi)}
            >
              <Volume2 size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>
            {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
            {!flashcardSettings.showPinyin && (
              <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
            )}
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
          {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
          {!flashcardSettings.showPinyin && (
            <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
          )}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push(`/profile/${currentCard.id}` as any)}
          >
            <User size={16} color="#3b82f6" />
            <Text style={styles.profileButtonText}>See Profile</Text>
          </TouchableOpacity>
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
          <View style={styles.hanziWithSpeaker}>
            <Text style={styles.hanzi}>{currentCard.hanzi}</Text>
            <TouchableOpacity 
              style={styles.speakerButton}
              onPress={() => playTTS(currentCard.hanzi)}
            >
              <Volume2 size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>
            {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
            {!flashcardSettings.showPinyin && (
              <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
            )}
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
          {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
          {!flashcardSettings.showPinyin && (
            <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
          )}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push(`/profile/${currentCard.id}` as any)}
          >
            <User size={16} color="#3b82f6" />
            <Text style={styles.profileButtonText}>See Profile</Text>
          </TouchableOpacity>
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
      {/* Pinyin on the front of the card (normal mode) if showPinyin is ON */}
      {flashcardSettings.showPinyin && (
        <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
      )}
      
      {showAnswer && (
        <>
          <View style={styles.divider} />
          <Text style={styles.meaning}>{currentCard.meaning}</Text>
          {/* Pinyin on the back of the card (normal mode, answer shown) if showPinyin is OFF */}
          {!flashcardSettings.showPinyin && (
            <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
          )}
          
          <View style={styles.hanziWithSpeaker}>
            <TouchableOpacity 
              style={styles.speakerButton}
              onPress={() => playTTS(currentCard.hanzi)}
            >
              <Volume2 size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push(`/profile/${currentCard.id}` as any)}
          >
            <User size={16} color="#3b82f6" />
            <Text style={styles.profileButtonText}>See Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  if (flashcardSettings.deckFlipped) {
    if (flashcardSettings.typingMode) return renderFlippedTypingMode();
    if (flashcardSettings.handwritingMode) return renderFlippedHandwritingMode();
    return renderFlippedMode();
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
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  profileButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  hanziWithSpeaker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  speakerButton: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
}); 