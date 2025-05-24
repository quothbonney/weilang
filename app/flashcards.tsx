import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";
import { ReviewQuality, Word, ReviewMode } from "../src/domain/entities";
import { CheckCircle, RotateCcw, Brain, Zap, Settings, BookOpen, Clock, Target } from "lucide-react-native";

export default function FlashcardsScreen() {
  const router = useRouter();
  const {     currentSession,     reviewSettings,     reviewMode,    startReviewSession,     getNextCard,     reviewWord,     advanceSession,    updateReviewSettings,    setReviewMode,    isLoading   } = useStore();
  
  const [currentCard, setCurrentCard] = useState<Word | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);

  useEffect(() => {
    if (!currentSession) {
      // Auto-start with mixed mode
      startReviewSession('mixed');
    }
  }, []);

  useEffect(() => {
    if (currentSession) {
      const nextCard = getNextCard();
      setCurrentCard(nextCard);
      setShowAnswer(false);
    }
  }, [currentSession]);

  const handleReview = async (quality: ReviewQuality) => {
    if (!currentCard || isReviewing) return;

    setIsReviewing(true);
    await reviewWord(currentCard.id, quality);
    advanceSession();

    const nextCard = getNextCard();
    if (nextCard) {
      setCurrentCard(nextCard);
    } else {
      setCurrentCard(null);
    }

    setIsReviewing(false);
    setShowAnswer(false);
  };

  const handleStartNewSession = (mode: ReviewMode) => {
    setShowModeSelector(false);
    startReviewSession(mode);
  };

  const ReviewModeSelector = () => (
    <Modal visible={showModeSelector} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Review Mode</Text>
          
          {[
            { mode: 'mixed' as ReviewMode, title: 'Mixed Review', subtitle: 'Learning cards → New cards → Review cards', icon: Target },
            { mode: 'learning-only' as ReviewMode, title: 'Learning Only', subtitle: 'Focus on cards marked "Again"', icon: Clock },
            { mode: 'new-only' as ReviewMode, title: 'New Cards Only', subtitle: 'Learn new vocabulary', icon: BookOpen },
            { mode: 'review-only' as ReviewMode, title: 'Review Only', subtitle: 'Review previously learned cards', icon: CheckCircle },
          ].map(({ mode, title, subtitle, icon: Icon }) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeButton, reviewMode === mode && styles.selectedMode]}
              onPress={() => handleStartNewSession(mode)}
            >
              <Icon size={24} color={reviewMode === mode ? "#3b82f6" : "#6b7280"} />
              <View style={styles.modeTextContainer}>
                <Text style={[styles.modeTitle, reviewMode === mode && styles.selectedModeText]}>{title}</Text>
                <Text style={styles.modeSubtitle}>{subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowModeSelector(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const SettingsPanel = () => (
    <Modal visible={showSettings} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Review Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Batch Size: {reviewSettings.batchSize}</Text>
            <View style={styles.settingButtons}>
              {[5, 10, 15, 20].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.settingButton, reviewSettings.batchSize === size && styles.selectedSetting]}
                  onPress={() => updateReviewSettings({ batchSize: size })}
                >
                  <Text style={[styles.settingButtonText, reviewSettings.batchSize === size && styles.selectedSettingText]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Max New Cards/Day: {reviewSettings.maxNewCardsPerDay}</Text>
            <View style={styles.settingButtons}>
              {[10, 20, 50, 100].map(max => (
                <TouchableOpacity
                  key={max}
                  style={[styles.settingButton, reviewSettings.maxNewCardsPerDay === max && styles.selectedSetting]}
                  onPress={() => updateReviewSettings({ maxNewCardsPerDay: max })}
                >
                  <Text style={[styles.settingButtonText, reviewSettings.maxNewCardsPerDay === max && styles.selectedSettingText]}>{max}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
        <Text style={styles.loadingText}>Loading review session...</Text>
      </View>
    );
  }

  if (!currentSession || !currentCard) {
    return (
      <View style={styles.centerContainer}>
        <CheckCircle size={64} color="#10b981" />
        <Text style={styles.congratsTitle}>Session Complete!</Text>
        <Text style={styles.congratsText}>Great work! You've finished this review session.</Text>
        
        <TouchableOpacity 
          style={styles.newSessionButton}
          onPress={() => setShowModeSelector(true)}
        >
          <Text style={styles.buttonText}>Start New Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getCardTypeLabel = (card: Word) => {
    if (card.learningStep > 0) return "Learning";
    if (card.status === "new") return "New";
    return "Review";
  };

  const getCardTypeColor = (card: Word) => {
    if (card.learningStep > 0) return "#f59e0b";
    if (card.status === "new") return "#3b82f6";
    return "#10b981";
  };

  return (
    <View style={styles.container}>
      {/* Header with session info and controls */}
      <View style={styles.header}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionMode}>{reviewMode.replace('-', ' ').toUpperCase()}</Text>
          <Text style={styles.sessionStats}>
            Batch {currentSession.batchIndex + 1} • {currentSession.reviewed} reviewed
          </Text>
        </View>
        
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowModeSelector(true)}
          >
            <Target size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSettings(true)}
          >
            <Settings size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress and card type indicator */}
      <View style={styles.progressSection}>
        <View style={styles.cardTypeIndicator}>
          <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(currentCard) }]}>
            <Text style={styles.cardTypeText}>{getCardTypeLabel(currentCard)}</Text>
          </View>
          {currentCard.learningStep > 0 && (
            <Text style={styles.learningStepText}>Step {currentCard.learningStep + 1}</Text>
          )}
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentSession.reviewed / (currentSession.reviewed + currentSession.currentBatch.length)) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Main Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.hanzi}>{currentCard.hanzi}</Text>
          <Text style={styles.pinyin}>{currentCard.pinyin}</Text>
          
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

      <ReviewModeSelector />
      <SettingsPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionMode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sessionStats: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  progressSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  cardTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  cardTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  learningStepText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedMode: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  modeTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedModeText: {
    color: '#3b82f6',
  },
  modeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  settingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedSetting: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  settingButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  selectedSettingText: {
    color: 'white',
  },
  doneButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  newSessionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontWeight: '500',
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
    marginBottom: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  }
});