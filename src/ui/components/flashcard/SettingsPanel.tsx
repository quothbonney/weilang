import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

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
  const batchSizeOptions = [5, 10, 15, 20];
  const maxNewCardsOptions = [10, 20, 50, 100];

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
    padding: 24,
    maxHeight: '80%',
    minHeight: 250,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  settingButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  settingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: 50,
    alignItems: 'center',
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
    marginTop: 10,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomPadding: {
    height: 20,
  },
}); 