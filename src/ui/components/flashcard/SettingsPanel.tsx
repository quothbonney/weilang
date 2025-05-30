import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../theme';

interface SettingsPanelProps {
  visible: boolean;
  reviewSettings: {
    batchSize: number;
    maxNewCardsPerDay: number;
  };
  onClose: () => void;
  onUpdateSettings: (settings: Partial<{ batchSize: number; maxNewCardsPerDay: number; }>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  reviewSettings,
  onClose,
  onUpdateSettings,
}) => {
  const { theme } = useTheme();
  const batchSizeOptions = [5, 10, 15, 20];
  const maxNewCardsOptions = [10, 20, 50, 100];

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
      padding: theme.layout.xl,
      maxHeight: '80%',
      minHeight: 250,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    modalHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: theme.layout.lg,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: theme.layout.sm,
    },
    scrollContent: {
      flexGrow: 1,
    },
    settingItem: {
      marginBottom: theme.layout.lg,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.sm,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.layout.md,
    },
    settingButtons: {
      flexDirection: 'row' as const,
      gap: theme.layout.sm,
      flexWrap: 'wrap' as const,
    },
    settingButton: {
      paddingHorizontal: theme.layout.lg,
      paddingVertical: theme.layout.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      minWidth: 50,
      alignItems: 'center' as const,
    },
    selectedSetting: {
      backgroundColor: theme.colors.interactive.primary,
      borderColor: theme.colors.interactive.primary,
    },
    settingButtonText: {
      color: theme.colors.text.primary,
      fontWeight: '500' as const,
    },
    selectedSettingText: {
      color: theme.colors.text.inverse,
    },
    doneButton: {
      backgroundColor: theme.colors.status.success,
      paddingVertical: theme.layout.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center' as const,
      marginTop: theme.layout.sm,
    },
    doneButtonText: {
      color: theme.colors.text.inverse,
      fontWeight: '600' as const,
      fontSize: 16,
    },
    bottomPadding: {
      height: theme.layout.lg,
    },
  } as const;

  const renderSettingButtons = (
    options: number[],
    currentValue: number,
    onSelect: (value: number) => void
  ) => (
    <View style={styles.settingButtons}>
      {options.map(value => (
        <TouchableOpacity
          key={value}
          style={[
            styles.settingButton,
            currentValue === value && styles.selectedSetting
          ]}
          onPress={() => onSelect(value)}
        >
          <Text style={[
            styles.settingButtonText,
            currentValue === value && styles.selectedSettingText
          ]}>
            {value}
          </Text>
        </TouchableOpacity>
      ))}
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
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>
                Batch Size: {reviewSettings.batchSize}
              </Text>
              <Text style={styles.settingDescription}>
                Number of cards to review in each session
              </Text>
              {renderSettingButtons(
                batchSizeOptions,
                reviewSettings.batchSize,
                (batchSize) => onUpdateSettings({ batchSize })
              )}
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>
                Max New Cards/Day: {reviewSettings.maxNewCardsPerDay}
              </Text>
              <Text style={styles.settingDescription}>
                Daily limit for introducing new cards
              </Text>
              {renderSettingButtons(
                maxNewCardsOptions,
                reviewSettings.maxNewCardsPerDay,
                (maxNewCardsPerDay) => onUpdateSettings({ maxNewCardsPerDay })
              )}
            </View>
            
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>

            {/* Extra padding at bottom for scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
