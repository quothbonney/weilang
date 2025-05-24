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
  SelectItem,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
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
    setSelectedModel
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

        <Select
          selectedValue={selectedModel}
          onValueChange={(value) => changeModel(value as ModelOption)}
        >
          <SelectTrigger>
            <SelectInput placeholder="Select model" />
            <SelectIcon>
              <ChevronDown size={16} />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              {MODEL_OPTIONS.map((option) => (
                <SelectItem key={option.key} label={option.label} value={option.key} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Example Generation Mode</Text>
        <Text style={styles.description}>
          Choose how examples are generated when you have few or no learned words.
        </Text>

        <Slider
          minValue={0}
          maxValue={GENERATION_MODES.length - 1}
          step={1}
          value={GENERATION_MODES.findIndex((m) => m.key === exampleGenerationMode)}
          onChangeEnd={(val) => changeGenerationMode(GENERATION_MODES[val].key)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.modeLabel}>
            {GENERATION_MODES.find((m) => m.key === exampleGenerationMode)?.label}
          </Text>
          <Text style={styles.modeDescription}>
            {GENERATION_MODES.find((m) => m.key === exampleGenerationMode)?.description}
          </Text>
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
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  modeOptionMargin: {
    marginBottom: 8,
  },
  selectedMode: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  modeContent: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedModeText: {
    color: '#3b82f6',
  },
  selectedModeDescription: {
    color: '#2563eb',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginLeft: 12,
  },
  selectedRadio: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
}); 