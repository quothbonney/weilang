import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
} from "@gluestack-ui/themed";
import { ChevronDown } from "lucide-react-native";
import { useStore } from "../src/ui/hooks/useStore";
import { getWordRepository } from "../src/platform/storageProvider";
import { CloudSyncService } from "../src/infra/services/cloudSyncService";
import { storage } from "../src/platform/storageUtils";
import { ExampleGenerationMode, ModelOption } from "../src/ui/hooks/useStore";
import SettingsSection from "../src/ui/components/settings/SettingsSection";
import ToggleSwitch from "../src/ui/components/settings/ToggleSwitch";
import { AZURE_TTS_KEY } from "../env";

const API_KEY_STORAGE_KEY = 'weilang_api_key';
const TTS_KEY_STORAGE_KEY = 'weilang_tts_key';
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
    ttsApiKey,
    setTtsApiKey,
    exampleGenerationMode,
    setExampleGenerationMode,
    selectedModel,
    setSelectedModel,
    flashcardSettings,
    setFlashcardSettings,
    loadWords
  } = useStore();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [inputTtsKey, setInputTtsKey] = useState(ttsApiKey || AZURE_TTS_KEY || '');
  const [showTtsKey, setShowTtsKey] = useState(false);
  const cloudSync = React.useMemo(() => new CloudSyncService(), []);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    // Update input when store updates
    setInputKey(apiKey || '');
    setInputTtsKey(ttsApiKey || AZURE_TTS_KEY || '');
  }, [apiKey, ttsApiKey]);

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

  const saveTtsKey = async () => {
    try {
      if (inputTtsKey.trim()) {
        await storage.setItem(TTS_KEY_STORAGE_KEY, inputTtsKey.trim());
        setTtsApiKey(inputTtsKey.trim());
        Alert.alert('Success', 'TTS key saved successfully');
      } else {
        await storage.removeItem(TTS_KEY_STORAGE_KEY);
        setTtsApiKey(null);
        Alert.alert('Success', 'TTS key removed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save TTS key');
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

  const toggleAutoPlayTTS = () => {
    setFlashcardSettings({ autoPlayTTS: !flashcardSettings.autoPlayTTS });
  };

  const handleBackup = async () => {
    try {
      await cloudSync.backupWords(getWordRepository());
      setSyncMessage('Backup uploaded to Cloudflare R2');
    } catch (error) {
      console.error('Backup failed', error);
      setSyncMessage('Failed to upload backup');
    }
  };

  const handleRestore = async () => {
    try {
      await cloudSync.restoreWords(getWordRepository());
      await loadWords();
      setSyncMessage('Data synced from Cloudflare R2');
    } catch (error) {
      console.error('Restore failed', error);
      setSyncMessage('Failed to sync from cloud');
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      bounces
      keyboardShouldPersistTaps="handled"
    >
        <SettingsSection title="Together API Configuration">
          <Text className="text-gray-600 mb-4">
            Enter your Together API key to enable example sentence generation.
            {apiKey && !inputKey.startsWith('sk-') && (
              <Text className="text-green-600 italic"> (Loaded from .env file)</Text>
            )}
          </Text>

          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base"
              value={inputKey}
              onChangeText={setInputKey}
              placeholder="Enter your API key"
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className="ml-2 px-3 py-2"
              onPress={() => setShowKey(!showKey)}
            >
              <Text className="text-blue-500 font-medium">{showKey ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-blue-500 rounded-lg px-6 py-3 items-center"
            onPress={saveApiKey}
          >
            <Text className="text-white font-semibold text-base">Save API Key</Text>
          </TouchableOpacity>

          <Text className="text-xs text-gray-500 mt-2 italic">
            Get your API key from https://api.together.xyz
          </Text>
        </SettingsSection>

        <SettingsSection title="Azure TTS Configuration">
          <Text className="text-gray-600 mb-4">
            Provide an Azure TTS key for high quality speech synthesis.
            {AZURE_TTS_KEY ? (
              <Text className="text-green-600 italic"> (Loaded from .env file)</Text>
            ) : null}
          </Text>

          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base"
              value={inputTtsKey}
              onChangeText={setInputTtsKey}
              placeholder="Enter your TTS key"
              secureTextEntry={!showTtsKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className="ml-2 px-3 py-2"
              onPress={() => setShowTtsKey(!showTtsKey)}
            >
              <Text className="text-blue-500 font-medium">{showTtsKey ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-blue-500 rounded-lg px-6 py-3 items-center"
            onPress={saveTtsKey}
          >
            <Text className="text-white font-semibold text-base">Save TTS Key</Text>
          </TouchableOpacity>

          <Text className="text-xs text-gray-500 mt-2 italic">
            Azure portal &gt; Cognitive Services &gt; Speech
          </Text>
        </SettingsSection>

        <SettingsSection title="Flashcard Settings" description="Customize your flashcard learning experience.">
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-gray-900 mb-1">Show Pinyin</Text>
              <Text className="text-sm text-gray-600">Display pinyin pronunciation guide on flashcards</Text>
            </View>
            <ToggleSwitch value={flashcardSettings.showPinyin} onChange={togglePinyin} />
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-gray-900 mb-1">Flip Deck Direction</Text>
              <Text className="text-sm text-gray-600">
                {flashcardSettings.deckFlipped
                  ? 'Show English → Write Chinese characters'
                  : 'Show Chinese → Recall English meaning'}
              </Text>
            </View>
            <ToggleSwitch value={flashcardSettings.deckFlipped} onChange={toggleDeckFlip} />
          </View>

          <View className="flex-row justify-between items-center py-3">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-gray-900 mb-1">Auto-play TTS</Text>
              <Text className="text-sm text-gray-600">
                {flashcardSettings.autoPlayTTS
                  ? 'Automatically speak Chinese when answer is revealed'
                  : 'Manual audio playback only'}
              </Text>
            </View>
            <ToggleSwitch value={flashcardSettings.autoPlayTTS} onChange={toggleAutoPlayTTS} />
          </View>

          <View className="bg-gray-50 p-3 rounded-lg mt-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Current Configuration:</Text>
            <Text className="text-sm text-gray-600 mb-1">• Pinyin: {flashcardSettings.showPinyin ? 'Shown' : 'Hidden'}</Text>
            <Text className="text-sm text-gray-600 mb-1">• Direction: {flashcardSettings.deckFlipped ? 'English → Chinese' : 'Chinese → English'}</Text>
            <Text className="text-sm text-gray-600">• Auto-play TTS: {flashcardSettings.autoPlayTTS ? 'Enabled' : 'Disabled'}</Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Example Generation Mode" description="Choose how examples are generated when you have few or no learned words.">
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Current: {GENERATION_MODES.find(m => m.key === exampleGenerationMode)?.label}
            </Text>
            <Text className="text-sm text-gray-600">
              {GENERATION_MODES.find(m => m.key === exampleGenerationMode)?.description}
            </Text>
          </View>

          <View className="gap-3">
            {GENERATION_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                className={`p-4 rounded-xl border-2 ${exampleGenerationMode === mode.key ? 'bg-blue-500 border-blue-500' : 'border-gray-200 bg-white'}`}
                onPress={() => changeGenerationMode(mode.key)}
              >
                <Text className={`text-base font-semibold mb-1 ${exampleGenerationMode === mode.key ? 'text-white' : 'text-gray-900'}`}>{mode.label}</Text>
                <Text className={`text-sm ${exampleGenerationMode === mode.key ? 'text-indigo-100' : 'text-gray-600'}`}>{mode.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        <SettingsSection title="AI Model Selection" description="Choose which AI model to use for generating examples and character meanings.">
          <View className="bg-blue-50 p-4 rounded-lg mb-4">
            <Text className="text-sm font-semibold text-blue-900 mb-2">Enhanced Character Analysis</Text>
            <Text className="text-sm text-blue-700">
              Character meanings are now generated using AI when database lookup fails, providing more comprehensive definitions.
            </Text>
          </View>
          
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
          
          <View className="mt-4 p-3 bg-gray-50 rounded-lg">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Current Model:</Text>
            <Text className="text-sm text-gray-700 font-medium">
              {MODEL_OPTIONS.find(m => m.key === selectedModel)?.label}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">
              {MODEL_OPTIONS.find(m => m.key === selectedModel)?.description}
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Cloud Sync" description="Backup your data to Cloudflare R2">
          <View className="flex-row mb-3">
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-lg px-4 py-3 items-center mr-2"
              onPress={handleBackup}
            >
              <Text className="text-white font-semibold text-base">Upload Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-lg px-4 py-3 items-center"
              onPress={handleRestore}
            >
              <Text className="text-white font-semibold text-base">Sync From Cloud</Text>
            </TouchableOpacity>
          </View>
          {syncMessage ? (
            <Text className="text-sm text-gray-700">{syncMessage}</Text>
          ) : null}
        </SettingsSection>

        <SettingsSection title="About">
          <Text className="text-gray-600 mb-1">魏Lang</Text>
          <Text className="text-gray-600 mb-1">Version 1.0.0</Text>
          <Text className="text-gray-600">Spaced repetition for Chinese learning</Text>
        </SettingsSection>
      </ScrollView>
  );
}

