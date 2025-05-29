import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { HandwritingInput } from './HandwritingInput';
import { Shuffle, Eye, EyeOff, User, Volume2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Speech from "expo-speech";
import { speakWithAzure } from '../../../infra/tts/azureTts';
import { Word } from '../../../domain/entities';
import { useFlashcardStyles, useTheme } from '../../theme';

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
  const styles = useFlashcardStyles();
  const { theme } = useTheme();
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
    <View style={styles.flashcardCard}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Shuffle size={16} color={theme.colors.chinese.accent} />
          <Text style={styles.deckIndicatorText}>EN → ZH ✏️</Text>
        </View>
      </View>
      
      <Text style={styles.englishPrompt}>Write the Chinese characters for:</Text>
      <Text style={styles.flashcardMeaning}>{currentCard.meaning}</Text>
      
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
            placeholderTextColor={theme.colors.text.tertiary}
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
              <Text style={styles.flashcardHanzi}>{currentCard.hanzi}</Text>
              <TouchableOpacity 
                style={styles.speakerButton}
                onPress={() => playTTS(currentCard.hanzi)}
              >
                <Volume2 size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
            {!flashcardSettings.showPinyin && (
              <Text style={styles.flashcardPinyin}>{currentCard.pinyin}</Text>
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
            <User size={16} color={theme.colors.interactive.primary} />
            <Text style={styles.profileButtonText}>See Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderFlippedHandwritingMode = () => (
    <View style={styles.flashcardCard}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Shuffle size={16} color={theme.colors.chinese.accent} />
          <Text style={styles.deckIndicatorText}>EN → ZH ✍️</Text>
        </View>
      </View>

      <Text style={styles.englishPrompt}>Write the Chinese characters for:</Text>
      <Text style={styles.flashcardMeaning}>{currentCard.meaning}</Text>

      {!showAnswer && (
        <HandwritingInput character={currentCard.hanzi} onComplete={onRevealAnswer} />
      )}

      {showAnswer && (
        <>
          <View style={styles.divider} />
          <View style={styles.hanziWithSpeaker}>
            <Text style={styles.flashcardHanzi}>{currentCard.hanzi}</Text>
            <TouchableOpacity
              style={styles.speakerButton}
              onPress={() => playTTS(currentCard.hanzi)}
            >
              <Volume2 size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
          {!flashcardSettings.showPinyin && (
            <Text style={styles.flashcardPinyin}>{currentCard.pinyin}</Text>
          )}
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push(`/profile/${currentCard.id}` as any)}
          >
            <User size={16} color={theme.colors.interactive.primary} />
            <Text style={styles.profileButtonText}>See Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderFlippedMode = () => (
    <View style={styles.flashcardCard}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Shuffle size={16} color={theme.colors.chinese.accent} />
          <Text style={styles.deckIndicatorText}>EN → ZH</Text>
        </View>
      </View>
      
      <Text style={styles.englishPrompt}>Recall the Chinese characters for:</Text>
      <Text style={styles.flashcardMeaning}>{currentCard.meaning}</Text>
      
      {showAnswer && (
        <>
          <View style={styles.divider} />
          <View style={styles.hanziWithSpeaker}>
            <Text style={styles.flashcardHanzi}>{currentCard.hanzi}</Text>
            <TouchableOpacity 
              style={styles.speakerButton}
              onPress={() => playTTS(currentCard.hanzi)}
            >
              <Volume2 size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          {/* Pinyin on the back of the card (flipped) if showPinyin is OFF */}
          {!flashcardSettings.showPinyin && (
            <Text style={styles.flashcardPinyin}>{currentCard.pinyin}</Text>
          )}
          <View style={styles.wordStats}>
            <Text style={styles.wordStatsText}>Ease: {currentCard.ease.toFixed(2)}</Text>
            <Text style={styles.wordStatsText}>Interval: {currentCard.interval} days</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push(`/profile/${currentCard.id}` as any)}
          >
            <User size={16} color={theme.colors.interactive.primary} />
            <Text style={styles.profileButtonText}>See Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderNormalMode = () => (
    <View style={styles.flashcardCard}>
      <View style={styles.cardHeader}>
        <View style={styles.deckIndicator}>
          <Eye size={16} color={theme.colors.interactive.primary} />
          <Text style={styles.deckIndicatorText}>ZH → EN</Text>
        </View>
      </View>
      
      <Text style={styles.flashcardHanzi}>{currentCard.hanzi}</Text>
      {/* Pinyin on the front of the card (normal mode) if showPinyin is ON */}
      {flashcardSettings.showPinyin && (
        <Text style={styles.flashcardPinyin}>{currentCard.pinyin}</Text>
      )}
      
      {showAnswer && (
        <>
          <View style={styles.divider} />
          <Text style={styles.flashcardMeaning}>{currentCard.meaning}</Text>
          {/* Pinyin on the back of the card (normal mode, answer shown) if showPinyin is OFF */}
          {!flashcardSettings.showPinyin && (
            <Text style={styles.flashcardPinyin}>{currentCard.pinyin}</Text>
          )}
          
          <View style={styles.hanziWithSpeaker}>
            <TouchableOpacity 
              style={styles.speakerButton}
              onPress={() => playTTS(currentCard.hanzi)}
            >
              <Volume2 size={20} color={theme.colors.text.secondary} />
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
            <User size={16} color={theme.colors.interactive.primary} />
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