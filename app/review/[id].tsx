import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../src/ui/hooks/useStore";
import { ReviewQuality } from "../../src/domain/entities";

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { words, reviewWord, loadWords } = useStore();
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  
  const word = words.find(w => w.id === id);

  useEffect(() => {
    if (!word) {
      loadWords();
    }
  }, [word]);

  const handleReview = async (quality: ReviewQuality) => {
    if (!word) return;
    
    setIsReviewing(true);
    await reviewWord(word.id, quality);
    router.back();
  };

  if (!word) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.hanzi}>{word.hanzi}</Text>
        
        {showAnswer && (
          <>
            <Text style={styles.pinyin}>{word.pinyin}</Text>
            <Text style={styles.meaning}>{word.meaning}</Text>
          </>
        )}
      </View>

      {!showAnswer ? (
        <TouchableOpacity 
          style={styles.showButton}
          onPress={() => setShowAnswer(true)}
        >
          <Text style={styles.buttonText}>Show Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.reviewButtons}>
          <TouchableOpacity 
            style={[styles.reviewButton, styles.againButton]}
            onPress={() => handleReview("again")}
            disabled={isReviewing}
          >
            <Text style={styles.buttonText}>Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.reviewButton, styles.hardButton]}
            onPress={() => handleReview("hard")}
            disabled={isReviewing}
          >
            <Text style={styles.buttonText}>Hard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.reviewButton, styles.goodButton]}
            onPress={() => handleReview("good")}
            disabled={isReviewing}
          >
            <Text style={styles.buttonText}>Good</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.reviewButton, styles.easyButton]}
            onPress={() => handleReview("easy")}
            disabled={isReviewing}
          >
            <Text style={styles.buttonText}>Easy</Text>
          </TouchableOpacity>
        </View>
      )}

            <View style={styles.stats}>        <Text style={styles.statsText}>Ease: {word.ease.toFixed(2)}</Text>        <Text style={styles.statsText}>Interval: {word.interval} days</Text>        <Text style={styles.statsText}>Status: {word.status}</Text>      </View>      <TouchableOpacity         style={styles.exampleButton}        onPress={() => router.push(`/example/${word.id}`)}      >        <Text style={styles.exampleButtonText}>Generate Example</Text>      </TouchableOpacity>
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
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  hanzi: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pinyin: {
    fontSize: 24,
    color: '#6b7280',
    marginBottom: 8,
  },
  meaning: {
    fontSize: 20,
    color: '#4b5563',
  },
  showButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  reviewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  reviewButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  againButton: {
    backgroundColor: '#ef4444',
  },
  hardButton: {
    backgroundColor: '#f59e0b',
  },
  goodButton: {
    backgroundColor: '#10b981',
  },
  easyButton: {
    backgroundColor: '#3b82f6',
  },
  stats: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
    statsText: {    color: '#6b7280',    fontSize: 12,  },  exampleButton: {    position: 'absolute',    top: 16,    right: 16,    backgroundColor: '#8b5cf6',    paddingHorizontal: 16,    paddingVertical: 8,    borderRadius: 6,  },  exampleButtonText: {    color: 'white',    fontSize: 14,    fontWeight: '600',  },}); 