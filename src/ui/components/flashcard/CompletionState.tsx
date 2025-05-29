import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CheckCircle, TrendingUp, BarChart3, Clock, Volume2 } from 'lucide-react-native';
import { Word } from '../../../domain/entities';
import { speakWithAzure } from '../../../infra/tts/azureTts';
import * as Speech from "expo-speech";
import { useTheme } from '../../theme';

interface ReviewedWord {
  word: Word;
  previousStatus: string;
  previousEase: number;
  previousInterval: number;
  qualityRating: string;
}

interface CompletionStateProps {
  onStartNewSession: () => void;
  onBackToDashboard: () => void;
  reviewedWords?: ReviewedWord[];
  sessionStats?: {
    totalReviewed: number;
    correctAnswers: number;
    sessionDuration: number;
  };
}

export const CompletionState: React.FC<CompletionStateProps> = ({
  onStartNewSession,
  onBackToDashboard,
  reviewedWords = [],
  sessionStats,
}) => {
  const { theme } = useTheme();
  const playTTS = async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  };

  const getProgressIcon = (word: ReviewedWord) => {
    if (word.word.ease > word.previousEase) {
      return <TrendingUp size={16} color={theme.colors.status.success} />;
    } else if (word.word.ease < word.previousEase) {
      return (
        <TrendingUp
          size={16}
          color={theme.colors.status.error}
          style={{ transform: [{ rotate: '180deg' }] }}
        />
      );
    }
    return <BarChart3 size={16} color={theme.colors.text.secondary} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return theme.colors.interactive.primary;
      case 'learning':
        return theme.colors.status.warning;
      case 'review':
        return theme.colors.status.success;
      default:
        return theme.colors.text.secondary;
    }
  };

  const accuracy = sessionStats ? Math.round((sessionStats.correctAnswers / sessionStats.totalReviewed) * 100) : 0;

  const styles = {
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    scrollContent: {
      padding: theme.layout.lg,
      paddingBottom: theme.layout['2xl'],
    },
    header: { alignItems: 'center' as const, marginBottom: theme.layout.xl },
    congratsTitle: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
      marginTop: theme.layout.lg,
      marginBottom: theme.layout.sm,
    },
    congratsText: {
      fontSize: 18,
      color: theme.colors.text.secondary,
      textAlign: 'center' as const,
    },
    statsCard: {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.layout.lg,
      marginBottom: theme.layout.lg,
      ...theme.shadows.md,
    },
    statsTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
      textAlign: 'center' as const,
    },
    statsGrid: { flexDirection: 'row' as const, justifyContent: 'space-around' as const },
    statItem: { alignItems: 'center' as const },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      color: theme.colors.interactive.primary,
      marginBottom: theme.layout.xs,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      fontWeight: '500' as const,
    },
    wordsCard: {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.layout.lg,
      marginBottom: theme.layout.xl,
      ...theme.shadows.md,
    },
    wordsTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
    },
    wordItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
      paddingVertical: theme.layout.md,
    },
    wordContent: { flex: 1 },
    wordHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.layout.xs,
    },
    hanzi: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
      marginRight: theme.layout.sm,
    },
    speakerButton: { padding: theme.layout.xs, marginRight: theme.layout.sm },
    pinyin: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: 2 },
    meaning: { fontSize: 14, color: theme.colors.text.primary, marginBottom: theme.layout.sm },
    progressInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flexWrap: 'wrap' as const,
      gap: theme.layout.sm,
    },
    statusBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.colors.surface.secondary,
      paddingHorizontal: theme.layout.sm,
      paddingVertical: theme.layout.xs,
      borderRadius: theme.borderRadius.full,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.layout.xs,
    },
    statusText: {
      fontSize: 12,
      color: theme.colors.text.primary,
      fontWeight: '500' as const,
      textTransform: 'capitalize' as const,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      backgroundColor: theme.colors.background.secondary,
      paddingHorizontal: theme.layout.sm,
      paddingVertical: theme.layout.xs,
      borderRadius: theme.borderRadius.md,
    },
    actions: { gap: theme.layout.lg },
    newSessionButton: {
      backgroundColor: theme.colors.interactive.primary,
      paddingHorizontal: theme.layout['2xl'],
      paddingVertical: theme.layout.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center' as const,
    },
    newSessionButtonText: {
      color: theme.colors.text.inverse,
      fontWeight: '600' as const,
      fontSize: 16,
    },
    backButton: {
      paddingVertical: theme.layout.md,
      alignItems: 'center' as const,
    },
    backButtonText: {
      color: theme.colors.text.secondary,
      fontWeight: '500' as const,
      fontSize: 16,
    },
  } as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <CheckCircle size={64} color={theme.colors.status.success} />
        <Text style={styles.congratsTitle}>Session Complete!</Text>
        <Text style={styles.congratsText}>
          Great work! You've completed your review session.
        </Text>
      </View>

      {/* Session Stats */}
      {sessionStats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Session Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessionStats.totalReviewed}</Text>
              <Text style={styles.statLabel}>Cards Reviewed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(sessionStats.sessionDuration / 60)}m</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>
        </View>
      )}

      {/* Reviewed Words */}
      {reviewedWords.length > 0 && (
        <View style={styles.wordsCard}>
          <Text style={styles.wordsTitle}>Words Reviewed</Text>
          {reviewedWords.map((item, index) => (
            <View key={item.word.id} style={styles.wordItem}>
              <View style={styles.wordContent}>
                <View style={styles.wordHeader}>
                  <Text style={styles.hanzi}>{item.word.hanzi}</Text>
                  <TouchableOpacity 
                    style={styles.speakerButton}
                    onPress={() => playTTS(item.word.hanzi)}
                  >
                    <Volume2 size={14} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                  {getProgressIcon(item)}
                </View>
                <Text style={styles.pinyin}>{item.word.pinyin}</Text>
                <Text style={styles.meaning}>{item.word.meaning}</Text>
                
                <View style={styles.progressInfo}>
                  <View style={styles.statusBadge}>
                    <View 
                      style={[styles.statusDot, { backgroundColor: getStatusColor(item.word.status) }]} 
                    />
                    <Text style={styles.statusText}>{item.word.status}</Text>
                  </View>
                  
                  <Text style={styles.progressText}>
                    Ease: {item.previousEase.toFixed(1)} → {item.word.ease.toFixed(1)}
                  </Text>
                  <Text style={styles.progressText}>
                    Next: {item.word.interval}d
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.newSessionButton}
          onPress={onStartNewSession}
        >
          <Text style={styles.newSessionButtonText}>Start New Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackToDashboard}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
