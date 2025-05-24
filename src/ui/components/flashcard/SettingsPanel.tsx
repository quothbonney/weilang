import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

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
          <Text style={styles.modalTitle}>Review Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>
              Batch Size: {reviewSettings.batchSize}
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
            {renderSettingButtons(
              maxNewCardsOptions,
              reviewSettings.maxNewCardsPerDay,
              (maxNewCardsPerDay) => onUpdateSettings({ maxNewCardsPerDay })
            )}
          </View>
          
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
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
  doneButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 