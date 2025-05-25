import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle, TrendingUp, BarChart3, Clock, Volume2 } from 'lucide-react-native';
import { Word } from '../../../domain/entities';
import { speakWithAzure } from '../../../infra/tts/azureTts';
import * as Speech from "expo-speech";

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
  const playTTS = async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  };

  const getProgressIcon = (word: ReviewedWord) => {
    if (word.word.ease > word.previousEase) {
      return <TrendingUp size={16} color="#10b981" />;
    } else if (word.word.ease < word.previousEase) {
      return <TrendingUp size={16} color="#ef4444" style={{ transform: [{ rotate: '180deg' }] }} />;
    }
    return <BarChart3 size={16} color="#6b7280" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'learning': return '#f59e0b';
      case 'review': return '#10b981';
      default: return '#6b7280';
    }
  };

  const accuracy = sessionStats ? Math.round((sessionStats.correctAnswers / sessionStats.totalReviewed) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <CheckCircle size={64} color="#10b981" />
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
                    <Volume2 size={14} color="#6b7280" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  congratsText: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  wordsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  wordItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 12,
  },
  wordContent: {
    flex: 1,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hanzi: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  speakerButton: {
    padding: 4,
    marginRight: 8,
  },
  pinyin: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  meaning: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actions: {
    gap: 16,
  },
  newSessionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newSessionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 16,
  },
}); 