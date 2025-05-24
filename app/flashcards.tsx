import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";
import { ReviewQuality, Word } from "../src/domain/entities";
import { CheckCircle, RotateCcw, Brain, Zap } from "lucide-react-native";

export default function FlashcardsScreen() {
  const router = useRouter();
  const { dueWords, loadDueWords, reviewWord, isLoading } = useStore();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, remaining: 0 });
  const [isReviewing, setIsReviewing] = useState(false);

  const currentWord = dueWords[currentWordIndex];

  useEffect(() => {
    loadDueWords();
  }, []);

  useEffect(() => {
    setSessionStats({
      reviewed: currentWordIndex,
      remaining: dueWords.length - currentWordIndex
    });
  }, [currentWordIndex, dueWords.length]);

  const handleReview = async (quality: ReviewQuality) => {
    if (!currentWord || isReviewing) return;
    
    setIsReviewing(true);
    await reviewWord(currentWord.id, quality);
    
    setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
    
    // Move to next word or finish session
    if (currentWordIndex < dueWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      router.back();
    }
    setIsReviewing(false);
  };

  const getQualityButton = (quality: ReviewQuality, label: string, color: string, icon: any) => (
    <TouchableOpacity 
      key={quality}
      style={[styles.reviewButton, { backgroundColor: color }]}
      onPress={() => handleReview(quality)}
      disabled={isReviewing}
    >
      {React.createElement(icon, { size: 20, color: 'white', style: { marginBottom: 4 } })}
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading flashcards...</Text>
      </View>
    );
  }

  if (dueWords.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <CheckCircle size={64} color="#10b981" />
        <Text style={styles.congratsTitle}>Great job!</Text>
        <Text style={styles.congratsText}>No cards due for review right now.</Text>
        <Text style={styles.congratsSubtext}>Come back later or add more words to your deck.</Text>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentWord) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No word found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentWordIndex / dueWords.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentWordIndex + 1} of {dueWords.length}
        </Text>
      </View>

      {/* Session Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{sessionStats.reviewed}</Text>
          <Text style={styles.statLabel}>Reviewed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{sessionStats.remaining}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* Main Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.hanzi}>{currentWord.hanzi}</Text>
          <Text style={styles.pinyin}>{currentWord.pinyin}</Text>
          
          {showAnswer && (
            <>
              <View style={styles.divider} />
              <Text style={styles.meaning}>{currentWord.meaning}</Text>
              <View style={styles.wordStats}>
                <Text style={styles.wordStatsText}>Ease: {currentWord.ease.toFixed(2)}</Text>
                <Text style={styles.wordStatsText}>Interval: {currentWord.interval} days</Text>
              </View>
            </>
          )}
        </View>
        
        {!showAnswer ? (
          <TouchableOpacity 
            style={styles.showButton}
            onPress={() => setShowAnswer(true)}
          >
            <Text style={styles.showButtonText}>Show Answer</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.reviewButtons}>
            {getQualityButton("again", "Again", "#ef4444", RotateCcw)}
            {getQualityButton("hard", "Hard", "#f59e0b", Brain)}
            {getQualityButton("good", "Good", "#10b981", CheckCircle)}
            {getQualityButton("easy", "Easy", "#3b82f6", Zap)}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
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
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  meaning: {
    fontSize: 24,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  wordStats: {
    flexDirection: 'row',
    gap: 16,
  },
  wordStatsText: {
    fontSize: 12,
    color: '#9ca3af',
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
  reviewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
    marginBottom: 8,
  },
  congratsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
  },
}); 