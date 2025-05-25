import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Target, Clock, BookOpen, CheckCircle, X } from 'lucide-react-native';
import { ReviewMode } from '../../../domain/entities';

interface ReviewModeSelectorProps {
  visible: boolean;
  reviewMode: ReviewMode;
  flashcardSettings: {
    showPinyin: boolean;
    deckFlipped: boolean;
    typingMode: boolean;
    handwritingMode: boolean;
    autoPlayTTS: boolean;
  };
  onClose: () => void;
  onSelectMode: (mode: ReviewMode) => void;
  onUpdateFlashcardSettings: (settings: Partial<{ showPinyin: boolean; deckFlipped: boolean; typingMode: boolean; handwritingMode: boolean; autoPlayTTS: boolean; }>) => void;
}

interface ModeConfig {
  mode: ReviewMode;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
}

export const ReviewModeSelector: React.FC<ReviewModeSelectorProps> = ({
  visible,
  reviewMode,
  flashcardSettings,
  onClose,
  onSelectMode,
  onUpdateFlashcardSettings,
}) => {
  const modes: ModeConfig[] = [
    { 
      mode: 'mixed', 
      title: 'Mixed Review', 
      subtitle: 'Learning cards → New cards → Review cards', 
      icon: Target 
    },
    { 
      mode: 'learning-only', 
      title: 'Learning Only', 
      subtitle: 'Focus on cards marked "Again"', 
      icon: Clock 
    },
    { 
      mode: 'new-only', 
      title: 'New Cards Only', 
      subtitle: 'Learn new vocabulary', 
      icon: BookOpen 
    },
    { 
      mode: 'review-only', 
      title: 'Review Only', 
      subtitle: 'Review previously learned cards', 
      icon: CheckCircle 
    },
  ];

  const renderModeButton = ({ mode, title, subtitle, icon: Icon }: ModeConfig) => (
    <TouchableOpacity
      key={mode}
      style={[styles.modeButton, reviewMode === mode && styles.selectedMode]}
      onPress={() => onSelectMode(mode)}
    >
      <Icon size={24} color={reviewMode === mode ? "#3b82f6" : "#6b7280"} />
      <View style={styles.modeTextContainer}>
        <Text style={[styles.modeTitle, reviewMode === mode && styles.selectedModeText]}>
          {title}
        </Text>
        <Text style={styles.modeSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderToggle = (isActive: boolean, onToggle: () => void) => (
    <TouchableOpacity 
      style={[styles.toggle, isActive && styles.toggleActive]}
      onPress={onToggle}
    >
      <View style={[styles.toggleThumb, isActive && styles.toggleThumbActive]} />
    </TouchableOpacity>
  );

  const renderSettingRow = (
    label: string,
    description: string,
    isActive: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {renderToggle(isActive, onToggle)}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header with close button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {/* Scrollable content */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Review Mode Selection */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Review Mode</Text>
              {modes.map(renderModeButton)}
            </View>
            
            {/* Flashcard Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Flashcard Options</Text>
              
              {renderSettingRow(
                "Show Pinyin",
                "Display pinyin pronunciation guide",
                flashcardSettings.showPinyin,
                () => onUpdateFlashcardSettings({ showPinyin: !flashcardSettings.showPinyin })
              )}
              
              {renderSettingRow(
                "Flip Deck Direction",
                flashcardSettings.deckFlipped
                  ? "English → Chinese characters"
                  : "Chinese → English meaning",
                flashcardSettings.deckFlipped,
                () => onUpdateFlashcardSettings({ deckFlipped: !flashcardSettings.deckFlipped })
              )}
              
              {renderSettingRow(
                "Typing Mode",
                flashcardSettings.typingMode
                  ? "Type characters for extra mastery points"
                  : "Just reveal the answer (default)",
                flashcardSettings.typingMode,
                () => onUpdateFlashcardSettings({ typingMode: !flashcardSettings.typingMode })
              )}

              {renderSettingRow(
                "Handwriting Mode",
                flashcardSettings.handwritingMode
                  ? "Write characters with stylus"
                  : "Disable drawing input",
                flashcardSettings.handwritingMode,
                () => onUpdateFlashcardSettings({ handwritingMode: !flashcardSettings.handwritingMode })
              )}
              
              {renderSettingRow(
                "Auto-play TTS",
                flashcardSettings.autoPlayTTS
                  ? "Speak Chinese after revealing answer"
                  : "Manual audio playback only",
                flashcardSettings.autoPlayTTS,
                () => onUpdateFlashcardSettings({ autoPlayTTS: !flashcardSettings.autoPlayTTS })
              )}
            </View>
            
            {/* Extra padding at bottom for scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    marginLeft: 18,
  },
  bottomPadding: {
    height: 20,
  },
}); 