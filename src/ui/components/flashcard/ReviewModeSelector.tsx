import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Target, Clock, BookOpen, CheckCircle, X } from 'lucide-react-native';
import { ReviewMode } from '../../../domain/entities';
import { useTheme } from '../../theme';

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
  const { theme } = useTheme();
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

  const styles = {
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.background.overlay,
      justifyContent: 'center' as const,
      padding: theme.layout.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.layout.lg,
      maxHeight: '80%',
      minHeight: 300,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    modalHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: theme.layout.md,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: theme.layout.sm,
    },
    scrollContent: { flexGrow: 1 },
    settingsSection: { marginBottom: theme.layout.lg },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.sm,
    },
    modeButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      padding: theme.layout.md,
      marginBottom: theme.layout.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    selectedMode: {
      borderColor: theme.colors.interactive.primary,
      backgroundColor: theme.colors.interactive.primary + '1A',
    },
    modeTextContainer: {
      marginLeft: theme.layout.md,
      flex: 1,
    },
    modeTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
    },
    selectedModeText: { color: theme.colors.interactive.primary },
    modeSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.layout.xs,
    },
    settingRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: theme.layout.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    settingInfo: { flex: 1, marginRight: theme.layout.md },
    settingLabel: {
      fontSize: 15,
      fontWeight: '500' as const,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.xs,
    },
    settingDescription: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    toggle: {
      width: 44,
      height: 24,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.border.secondary,
      padding: 2,
      justifyContent: 'center' as const,
    },
    toggleActive: {
      backgroundColor: theme.colors.interactive.primary,
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface.primary,
    },
    toggleThumbActive: { marginLeft: 18 },
    bottomPadding: { height: theme.layout.lg },
  } as const;

  const renderModeButton = ({ mode, title, subtitle, icon: Icon }: ModeConfig) => (
    <TouchableOpacity
      key={mode}
      style={[styles.modeButton, reviewMode === mode && styles.selectedMode]}
      onPress={() => onSelectMode(mode)}
    >
      <Icon
        size={24}
        color={
          reviewMode === mode
            ? theme.colors.interactive.primary
            : theme.colors.text.secondary
        }
      />
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
              <X size={24} color={theme.colors.text.secondary} />
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
