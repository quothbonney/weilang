import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SentenceExercise, TranslationEvaluation, TranslationSession } from '../../../domain/entities';
import { useTranslationStyles, useTheme } from '../../theme';
import { useStore } from '../../hooks/useStore';

interface CharacterMeaning {
  character: string;
  meaning: string;
  pinyin: string;
}

interface TranslationEvaluationProps {
  evaluation: TranslationEvaluation;
  submittedExercise: SentenceExercise;
  userTranslation: string;
  direction: 'en-to-zh' | 'zh-to-en';
  currentTranslationSession: TranslationSession | null;
  onNextExercise: () => void;
  onBack: () => void;
}

export function TranslationEvaluationComponent({
  evaluation,
  submittedExercise,
  userTranslation,
  direction,
  currentTranslationSession,
  onNextExercise,
  onBack,
}: TranslationEvaluationProps) {
  const router = useRouter();
  const styles = useTranslationStyles();
  const { theme } = useTheme();
  const { sentenceTranslationService, words, reviewWord } = useStore();
  const [characterMeanings, setCharacterMeanings] = useState<CharacterMeaning[]>([]);
  const [loadingCharacterMeanings, setLoadingCharacterMeanings] = useState(false);
  
  const expectedText = direction === 'zh-to-en' ? submittedExercise.english : submittedExercise.chinese.hanzi;
  const sourceText = direction === 'zh-to-en' ? submittedExercise.chinese.hanzi : submittedExercise.english;

  // Load character meanings for Chinese text when component mounts
  useEffect(() => {
    const loadCharacterMeanings = async () => {
      if (direction === 'zh-to-en' && sentenceTranslationService) {
        setLoadingCharacterMeanings(true);
        try {
          // Get unique characters from the Chinese sentence
          const characters = Array.from(new Set(submittedExercise.chinese.hanzi.split('')))
            .filter(char => char.trim() && /[\u4e00-\u9fff]/.test(char)); // Only Chinese characters
          
          if (characters.length > 0) {
            // Use the LLM adapter to get character meanings
            const llmAdapter = (sentenceTranslationService as any).llmAdapter;
            if (llmAdapter && llmAdapter.generateCharacterMeanings) {
              const meanings = await llmAdapter.generateCharacterMeanings(characters);
              setCharacterMeanings(meanings);
            }
          }
        } catch (error) {
          console.error('Failed to load character meanings:', error);
        } finally {
          setLoadingCharacterMeanings(false);
        }
      }
    };

    loadCharacterMeanings();
  }, [submittedExercise.chinese.hanzi, direction, sentenceTranslationService]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.status.success;
    if (score >= 60) return theme.colors.status.warning;
    return theme.colors.status.error;
  };

  const handleCharacterClick = (character: string) => {
    // Find the word that contains this character
    const wordWithCharacter = words.find(word => word.hanzi.includes(character));
    
    if (wordWithCharacter) {
      // Navigate to the profile page for this word
      router.push(`/profile/${wordWithCharacter.id}`);
    } else {
      // If no word found, we could potentially create a new word or show a message
      console.log(`No word found containing character: ${character}`);
    }
  };

  const groupCharactersIntoWords = (sentence: string) => {
    const characters = sentence.split('');
    const groups: Array<{ 
      type: 'word' | 'punctuation'; 
      content: string; 
      characters: string[];
      wordData?: any;
      groupMeaning?: string;
    }> = [];
    let i = 0;

    while (i < characters.length) {
      const char = characters[i];
      
      // Handle punctuation and non-Chinese characters
      if (!/[\u4e00-\u9fff]/.test(char)) {
        groups.push({ type: 'punctuation', content: char, characters: [char] });
        i++;
        continue;
      }

      // Try to find the longest matching word starting at this position
      let longestMatch = '';
      let matchLength = 0;
      let matchedWord = null;

      // Check for words of length 1-4 characters
      for (let len = Math.min(4, characters.length - i); len >= 1; len--) {
        const substring = characters.slice(i, i + len).join('');
        const matchingWord = words.find(word => word.hanzi === substring);
        
        if (matchingWord && len > matchLength) {
          longestMatch = substring;
          matchLength = len;
          matchedWord = matchingWord;
        }
      }

      if (longestMatch && matchedWord) {
        // Found a matching word
        groups.push({ 
          type: 'word', 
          content: longestMatch, 
          characters: longestMatch.split(''),
          wordData: matchedWord,
          groupMeaning: matchedWord.meaning
        });
        i += matchLength;
      } else {
        // No word match, treat as single character
        const charMeaning = characterMeanings.find(cm => cm.character === char);
        groups.push({ 
          type: 'word', 
          content: char, 
          characters: [char],
          groupMeaning: charMeaning?.meaning || '?'
        });
        i++;
      }
    }

    return groups;
  };

  const calculateMasteryScore = (userTranslation: string, expectedTranslation: string, wordGroups: any[]) => {
    // Simple word overlap scoring
    const userWords = userTranslation.toLowerCase().split(/\s+/);
    const expectedWords = expectedTranslation.toLowerCase().split(/\s+/);
    
    let totalScore = 0;
    let groupCount = 0;

    wordGroups.forEach(group => {
      if (group.type === 'word' && group.groupMeaning && group.groupMeaning !== '?') {
        groupCount++;
        const groupMeaningWords = group.groupMeaning.toLowerCase().split(/[,;\/\s]+/);
        
        // Check if any meaning words appear in user translation
        const hasMatch = groupMeaningWords.some((meaningWord: string) => 
          meaningWord.length > 2 && userWords.some(userWord => 
            userWord.includes(meaningWord) || meaningWord.includes(userWord)
          )
        );
        
        if (hasMatch) {
          totalScore += 100;
        } else {
          // Partial credit for semantic similarity
          const hasPartialMatch = groupMeaningWords.some((meaningWord: string) => 
            meaningWord.length > 1 && userWords.some(userWord => 
              userWord.length > 1 && (
                userWord.startsWith(meaningWord.substring(0, 2)) ||
                meaningWord.startsWith(userWord.substring(0, 2))
              )
            )
          );
          if (hasPartialMatch) {
            totalScore += 30;
          }
        }
      }
    });

    return groupCount > 0 ? Math.round(totalScore / groupCount) : 0;
  };

  const updateWordMasteryScores = async (userTranslation: string, expectedTranslation: string, wordGroups: any[]) => {
    const userWords = userTranslation.toLowerCase().split(/\s+/);
    
    for (const group of wordGroups) {
      if (group.type === 'word' && group.wordData && group.groupMeaning && group.groupMeaning !== '?') {
        const groupMeaningWords = group.groupMeaning.toLowerCase().split(/[,;\/\s]+/);
        
        // Check if any meaning words appear in user translation
        const hasExactMatch = groupMeaningWords.some((meaningWord: string) => 
          meaningWord.length > 2 && userWords.some(userWord => 
            userWord.includes(meaningWord) || meaningWord.includes(userWord)
          )
        );
        
        const hasPartialMatch = !hasExactMatch && groupMeaningWords.some((meaningWord: string) => 
          meaningWord.length > 1 && userWords.some(userWord => 
            userWord.length > 1 && (
              userWord.startsWith(meaningWord.substring(0, 2)) ||
              meaningWord.startsWith(userWord.substring(0, 2))
            )
          )
        );

        // Determine review quality based on understanding
        let reviewQuality: 'again' | 'hard' | 'good' | 'easy';
        
        if (hasExactMatch) {
          reviewQuality = 'good'; // User understood this word/character well
        } else if (hasPartialMatch) {
          reviewQuality = 'hard'; // Partial understanding
        } else {
          reviewQuality = 'again'; // No understanding, needs more practice
        }

        try {
          // Update the word's SRS parameters based on understanding
          await reviewWord(group.wordData.id, reviewQuality);
          console.log(`🔍 Updated mastery for "${group.content}" (${group.wordData.hanzi}) with quality: ${reviewQuality}`);
        } catch (error) {
          console.error(`Failed to update mastery for word ${group.content}:`, error);
        }
      }
    }
  };

  // Update mastery scores when evaluation is shown
  useEffect(() => {
    if (evaluation && submittedExercise && userTranslation && characterMeanings.length > 0) {
      const wordGroups = groupCharactersIntoWords(submittedExercise.chinese.hanzi);
      updateWordMasteryScores(userTranslation, expectedText, wordGroups);
    }
  }, [evaluation, submittedExercise, userTranslation, characterMeanings, expectedText]);

  const renderHighlightedTranslation = (text: any, characterDiff: any[] = []) => {
    // Safety check: ensure text is a string
    let textStr: string;
    if (typeof text === 'object' && text !== null) {
      if ('hanzi' in text) {
        textStr = text.hanzi;
      } else {
        console.warn('Unexpected object passed to renderHighlightedTranslation:', text);
        textStr = JSON.stringify(text);
      }
    } else {
      textStr = String(text || '');
    }
    
    if (!characterDiff || characterDiff.length === 0) return <Text>{textStr}</Text>;
    const chars = textStr.split('');
    return (
      <Text>
        {chars.map((char, idx) => {
          const diff = characterDiff.find((d: any) => d.position === idx);
          if (diff) {
            return (
              <Text key={idx} style={diff.type === 'incorrect' ? styles.incorrectChar : styles.correctChar}>
                {char}
                <Text style={styles.feedbackBadge}>
                  {diff.type !== 'correct' && diff.expectedChar && ` (${diff.expectedChar})`}
                  {typeof diff.score === 'number' && ` ${diff.score}%`}
                </Text>
              </Text>
            );
          }
          return <Text key={idx}>{char}</Text>;
        })}
      </Text>
    );
  };

  const renderCharacterBreakdown = () => {
    if (direction !== 'zh-to-en' || characterMeanings.length === 0) return null;

    const wordGroups = groupCharactersIntoWords(submittedExercise.chinese.hanzi);

    return (
      <View style={styles.characterBreakdownSection}>
        <View style={styles.characterGrid}>
          {wordGroups.map((group, groupIndex) => {
            if (group.type === 'punctuation') {
              return (
                <Text key={groupIndex} style={styles.punctuationChar}>
                  {group.content}
                </Text>
              );
            }

            // For word groups, render characters together with group meaning
            return (
              <View key={groupIndex} style={styles.wordGroup}>
                <View style={styles.wordGroupCharacters}>
                  {group.characters.map((char, charIndex) => {
                    const charMeaning = characterMeanings.find(cm => cm.character === char);
                    const hasData = charMeaning && !loadingCharacterMeanings;
                    
                    return (
                      <TouchableOpacity
                        key={`${groupIndex}-${charIndex}`}
                        style={[
                          styles.characterCard,
                          hasData && styles.characterCardActive
                        ]}
                        onPress={() => handleCharacterClick(char)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.characterCardHanzi}>{char}</Text>
                        {charMeaning ? (
                          <Text style={styles.characterCardPinyin}>{charMeaning.pinyin}</Text>
                        ) : loadingCharacterMeanings ? (
                          <Text style={styles.characterCardLoading}>...</Text>
                        ) : (
                          <Text style={styles.characterCardError}>?</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {group.groupMeaning && (
                  <Text style={styles.wordGroupMeaning}>
                    {group.groupMeaning}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={theme.colors.text.secondary} />
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
              {sourceText}
            </Text>
            {direction === 'zh-to-en' && (
              <Text style={styles.pinyinText}>{submittedExercise.chinese.pinyin}</Text>
            )}
          </View>
          <View style={styles.translationItem}>
            <Text style={styles.translationLabel}>Your Translation:</Text>
            {renderHighlightedTranslation(userTranslation, evaluation.characterDiff)}
          </View>
          <View style={styles.translationItem}>
            <Text style={styles.translationLabel}>Expected Translation:</Text>
            <Text style={styles.expectedTranslationText}>{expectedText}</Text>
          </View>
        </View>

        {/* Character Breakdown - New Section */}
        {renderCharacterBreakdown()}

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
          onPress={onNextExercise}
        >
          <Text style={styles.nextButtonText}>
            {currentTranslationSession && currentTranslationSession.currentExerciseIndex < currentTranslationSession.exercises.length ? 'Next Exercise' : 'View Results'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 