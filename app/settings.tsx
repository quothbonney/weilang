import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem
} from "@gluestack-ui/themed";
import { ChevronDown } from "lucide-react-native";
import { useStore } from "../src/ui/hooks/useStore";
import { storage } from "../src/platform/storageUtils";
import { ExampleGenerationMode, ModelOption } from "../src/ui/hooks/useStore";

const API_KEY_STORAGE_KEY = 'weilang_api_key';
const GENERATION_MODE_STORAGE_KEY = 'weilang_generation_mode';
const SELECTED_MODEL_STORAGE_KEY = 'weilang_selected_model';

const GENERATION_MODES: { key: ExampleGenerationMode; label: string; description: string }[] = [
  {
    key: 'strict',
    label: 'Strict (Known Words Only)',
    description: 'Use only words you\'ve learned and reviewed'
  },
  {
    key: 'some-ood',
    label: 'Flexible (Some New Words)',
    description: 'Add 1-2 new words for natural sentences'
  },
  {
    key: 'many-ood',
    label: 'Relaxed (Many New Words)',
    description: 'Use additional common words freely'
  },
  {
    key: 'independent',
    label: 'Independent (Any Words)',
    description: 'Generate beginner-friendly sentences independently'
  }
];

const MODEL_OPTIONS: { key: ModelOption; label: string; description: string }[] = [
  {
    key: 'deepseek-ai/DeepSeek-V3',
    label: 'DeepSeek V3',
    description: 'Latest model with excellent Chinese support'
  },
  {
    key: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    label: 'Llama 3.1 405B Turbo',
    description: 'Large model with strong reasoning capabilities'
  },
  {
    key: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    label: 'Qwen 2.5 72B Turbo',
    description: 'Optimized for Chinese language tasks'
  }
];

export default function SettingsScreen() {
  const { 
    apiKey, 
    setApiKey, 
    exampleGenerationMode, 
    setExampleGenerationMode,
    selectedModel,
    setSelectedModel,
    flashcardSettings,
    setFlashcardSettings
  } = useStore();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Update input when store updates
    setInputKey(apiKey || '');
  }, [apiKey]);

  const saveApiKey = async () => {
    try {
      if (inputKey.trim()) {
        await storage.setItem(API_KEY_STORAGE_KEY, inputKey.trim());
        setApiKey(inputKey.trim());
        Alert.alert('Success', 'API key saved successfully');
      } else {
        await storage.removeItem(API_KEY_STORAGE_KEY);
        setApiKey(null);
        Alert.alert('Success', 'API key removed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const changeGenerationMode = async (mode: ExampleGenerationMode) => {
    try {
      setExampleGenerationMode(mode);
      await storage.setItem(GENERATION_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save generation mode:', error);
    }
  };

  const changeModel = async (model: ModelOption) => {
    try {
      setSelectedModel(model);
      await storage.setItem(SELECTED_MODEL_STORAGE_KEY, model);
    } catch (error) {
      console.error('Failed to save model selection:', error);
    }
  };

  const togglePinyin = () => {
    setFlashcardSettings({ showPinyin: !flashcardSettings.showPinyin });
  };

  const toggleDeckFlip = () => {
    setFlashcardSettings({ deckFlipped: !flashcardSettings.deckFlipped });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Together API Configuration</Text>
        <Text style={styles.description}>
          Enter your Together API key to enable example sentence generation.
          {apiKey && !inputKey.startsWith('sk-') && (
            <Text style={styles.envNote}> (Loaded from .env file)</Text>
          )}
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputKey}
            onChangeText={setInputKey}
            placeholder="Enter your API key"
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowKey(!showKey)}
          >
            <Text style={styles.toggleText}>{showKey ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveApiKey}
        >
          <Text style={styles.saveButtonText}>Save API Key</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Get your API key from https://api.together.xyz
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Model Selection</Text>
        <Text style={styles.description}>
          Choose which AI model to use for generating examples and profiles.
        </Text>

        <Select selectedValue={selectedModel} onValueChange={value => changeModel(value as ModelOption)}>
          <SelectTrigger>
            <SelectInput placeholder="Select model" />
            <SelectIcon><ChevronDown size={16} /></SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              {MODEL_OPTIONS.map(option => (
                <SelectItem key={option.key} label={option.label} value={option.key} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flashcard Settings</Text>
        <Text style={styles.description}>
          Customize your flashcard learning experience.
        </Text>

        {/* Pinyin Display Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Show Pinyin</Text>
            <Text style={styles.settingDescription}>
              Display pinyin pronunciation guide on flashcards
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, flashcardSettings.showPinyin && styles.toggleActive]}
            onPress={togglePinyin}
          >
            <View style={[styles.toggleThumb, flashcardSettings.showPinyin && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        {/* Deck Flip Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Flip Deck Direction</Text>
            <Text style={styles.settingDescription}>
              {flashcardSettings.deckFlipped 
                ? "Show English → Write Chinese characters" 
                : "Show Chinese → Recall English meaning"
              }
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, flashcardSettings.deckFlipped && styles.toggleActive]}
            onPress={toggleDeckFlip}
          >
            <View style={[styles.toggleThumb, flashcardSettings.deckFlipped && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        {/* Current Settings Display */}
        <View style={styles.currentSettings}>
          <Text style={styles.currentSettingsTitle}>Current Configuration:</Text>
          <Text style={styles.currentSettingsText}>
            • Pinyin: {flashcardSettings.showPinyin ? 'Shown' : 'Hidden'}
          </Text>
          <Text style={styles.currentSettingsText}>
            • Direction: {flashcardSettings.deckFlipped ? 'English → Chinese' : 'Chinese → English'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Example Generation Mode</Text>
        <Text style={styles.description}>
          Choose how examples are generated when you have few or no learned words.
        </Text>

        {/* Current selection info */}
        <View style={styles.currentModeInfo}>
          <Text style={styles.currentModeLabel}>
            Current: {GENERATION_MODES.find(m => m.key === exampleGenerationMode)?.label}
          </Text>
          <Text style={styles.currentModeDescription}>
            {GENERATION_MODES.find(m => m.key === exampleGenerationMode)?.description}
          </Text>
        </View>

        {/* Mode selection buttons */}
        <View style={styles.modeButtons}>
          {GENERATION_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.modeButton,
                exampleGenerationMode === mode.key && styles.modeButtonActive
              ]}
              onPress={() => changeGenerationMode(mode.key)}
            >
              <View style={styles.modeButtonContent}>
                <Text style={[
                  styles.modeButtonText,
                  exampleGenerationMode === mode.key && styles.modeButtonTextActive
                ]}>
                  {mode.label}
                </Text>
                <Text style={[
                  styles.modeButtonDescription,
                  exampleGenerationMode === mode.key && styles.modeButtonDescriptionActive
                ]}>
                  {mode.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.infoText}>WeiLang 魏Lang</Text>
        <Text style={styles.infoText}>Version 1.0.0</Text>
        <Text style={styles.infoText}>Spaced repetition for Chinese learning</Text>
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
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    color: '#6b7280',
    marginBottom: 16,
  },
  envNote: {
    color: '#059669',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  toggleButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  helpText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoText: {
    color: '#6b7280',
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  currentSettings: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  currentSettingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  currentSettingsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  currentModeInfo: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  currentModeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modeButtons: {
    gap: 12,
  },
  modeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  modeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  modeButtonContent: {
    alignItems: 'flex-start',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  modeButtonDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modeButtonDescriptionActive: {
    color: '#e0e7ff',
  },
});
