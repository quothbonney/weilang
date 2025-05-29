import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Screen, Text, Button } from '../src/ui/components/themed';

import { useTheme } from "../src/ui/theme";
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
import { storage } from "../src/platform/storageUtils";
import { ExampleGenerationMode, ModelOption } from "../src/ui/hooks/useStore";
import SettingsSection from "../src/ui/components/settings/SettingsSection";
import ToggleSwitch from "../src/ui/components/settings/ToggleSwitch";
import { AZURE_TTS_KEY } from "../env";
import { CloudSyncService } from "../src/infra/services/cloudSyncService";

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
  const { theme, styles } = useTheme();
  const cloudSync = React.useMemo(() => {
    try {
      return new CloudSyncService();
    } catch (error) {
      console.error('Failed to initialize CloudSyncService:', error);
      return null;
    }
  }, []);
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
    if (!cloudSync) {
      setSyncMessage('Cloud sync not available - check environment configuration');
      return;
    }
    try {
      setSyncMessage('Uploading backup...');
      await cloudSync.backupWords(getWordRepository());
      setSyncMessage('Backup uploaded to Cloudflare R2');
    } catch (error) {
      console.error('Backup failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncMessage(`Failed to upload backup: ${errorMessage}`);
    }
  };

  const handleRestore = async () => {
    if (!cloudSync) {
      setSyncMessage('Cloud sync not available - check environment configuration');
      return;
    }
    try {
      setSyncMessage('Syncing from cloud...');
      await cloudSync.restoreWords(getWordRepository());
      await loadWords();
      setSyncMessage('Data synced from Cloudflare R2');
    } catch (error) {
      console.error('Restore failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncMessage(`Failed to sync from cloud: ${errorMessage}`);
    }
  };

  return (
    <Screen scrollable style={{ backgroundColor: theme.colors.background.primary }} scrollViewProps={{ contentContainerStyle: { padding: theme.layout.lg, paddingBottom: theme.layout['2xl'] } }}>
        <SettingsSection title="Together API Configuration">
          <Text color="secondary" style={{ marginBottom: theme.layout.md }}>
            Enter your Together API key to enable example sentence generation.
            {apiKey && !inputKey.startsWith('sk-') && (
              <Text
                style={{ color: theme.colors.status.success, fontStyle: 'italic' }}
              >
                {' '} (Loaded from .env file)
              </Text>
            )}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.layout.md,
            }}
          >
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={inputKey}
              onChangeText={setInputKey}
              placeholder="Enter your API key"
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowKey(!showKey)}
              style={{
                marginLeft: theme.layout.sm,
                paddingHorizontal: theme.layout.sm,
                paddingVertical: theme.layout.xs,
              }}
            >
              <Text style={{ color: theme.colors.interactive.primary, fontWeight: '500' }}>
                {showKey ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button title="Save API Key" onPress={saveApiKey} />

          <Text
            variant="caption"
            color="secondary"
            style={{ marginTop: theme.layout.sm, fontStyle: 'italic' }}
          >
            Get your API key from https://api.together.xyz
          </Text>
        </SettingsSection>

        <SettingsSection title="Azure TTS Configuration">
          <Text color="secondary" style={{ marginBottom: theme.layout.md }}>
            Provide an Azure TTS key for high quality speech synthesis.
            {AZURE_TTS_KEY ? (
              <Text
                style={{ color: theme.colors.status.success, fontStyle: 'italic' }}
              >
                {' '} (Loaded from .env file)
              </Text>
            ) : null}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.layout.md,
            }}
          >
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={inputTtsKey}
              onChangeText={setInputTtsKey}
              placeholder="Enter your TTS key"
              secureTextEntry={!showTtsKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowTtsKey(!showTtsKey)}
              style={{
                marginLeft: theme.layout.sm,
                paddingHorizontal: theme.layout.sm,
                paddingVertical: theme.layout.xs,
              }}
            >
              <Text style={{ color: theme.colors.interactive.primary, fontWeight: '500' }}>
                {showTtsKey ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button title="Save TTS Key" onPress={saveTtsKey} />

          <Text
            variant="caption"
            color="secondary"
            style={{ marginTop: theme.layout.sm, fontStyle: 'italic' }}
          >
            Azure portal &gt; Cognitive Services &gt; Speech
          </Text>
        </SettingsSection>

        <SettingsSection title="Flashcard Settings" description="Customize your flashcard learning experience.">
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.layout.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.subtle,
            }}
          >
            <View style={{ flex: 1, marginRight: theme.layout.md }}>
              <Text variant="bodyLarge" style={{ fontWeight: '600', marginBottom: theme.layout.xs }}>
                Show Pinyin
              </Text>
              <Text color="secondary">Display pinyin pronunciation guide on flashcards</Text>
            </View>
            <ToggleSwitch value={flashcardSettings.showPinyin} onChange={togglePinyin} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.layout.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.subtle,
            }}
          >
            <View style={{ flex: 1, marginRight: theme.layout.md }}>
              <Text variant="bodyLarge" style={{ fontWeight: '600', marginBottom: theme.layout.xs }}>
                Flip Deck Direction
              </Text>
              <Text color="secondary">
                {flashcardSettings.deckFlipped
                  ? 'Show English → Write Chinese characters'
                  : 'Show Chinese → Recall English meaning'}
              </Text>
            </View>
            <ToggleSwitch value={flashcardSettings.deckFlipped} onChange={toggleDeckFlip} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.layout.md,
            }}
          >
            <View style={{ flex: 1, marginRight: theme.layout.md }}>
              <Text variant="bodyLarge" style={{ fontWeight: '600', marginBottom: theme.layout.xs }}>
                Auto-play TTS
              </Text>
              <Text color="secondary">
                {flashcardSettings.autoPlayTTS
                  ? 'Automatically speak Chinese when answer is revealed'
                  : 'Manual audio playback only'}
              </Text>
            </View>
            <ToggleSwitch value={flashcardSettings.autoPlayTTS} onChange={toggleAutoPlayTTS} />
          </View>

          <View
            style={{
              backgroundColor: theme.colors.surface.primary,
              padding: theme.layout.md,
              borderRadius: theme.borderRadius.md,
              marginTop: theme.layout.md,
            }}
          >
            <Text variant="bodySmall" style={{ fontWeight: '600', marginBottom: theme.layout.xs }}>
              Current Configuration:
            </Text>
            <Text color="secondary" style={{ marginBottom: theme.layout.xs }}>
              • Pinyin: {flashcardSettings.showPinyin ? 'Shown' : 'Hidden'}
            </Text>
            <Text color="secondary" style={{ marginBottom: theme.layout.xs }}>
              • Direction: {flashcardSettings.deckFlipped ? 'English → Chinese' : 'Chinese → English'}
            </Text>
            <Text color="secondary">
              • Auto-play TTS: {flashcardSettings.autoPlayTTS ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Example Generation Mode" description="Choose how examples are generated when you have few or no learned words.">
          <View
            style={{
              backgroundColor: theme.colors.surface.primary,
              padding: theme.layout.md,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.layout.md,
            }}
          >
            <Text variant="bodyLarge" style={{ fontWeight: '600', marginBottom: theme.layout.xs }}>
              Current: {GENERATION_MODES.find(m => m.key === exampleGenerationMode)?.label}
            </Text>
            <Text color="secondary">
              {GENERATION_MODES.find(m => m.key === exampleGenerationMode)?.description}
            </Text>
          </View>

          <View style={{ gap: theme.layout.sm }}>
            {GENERATION_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                onPress={() => changeGenerationMode(mode.key)}
                style={{
                  padding: theme.layout.md,
                  borderRadius: theme.borderRadius.xl,
                  borderWidth: 2,
                  borderColor:
                    exampleGenerationMode === mode.key
                      ? theme.colors.interactive.primary
                      : theme.colors.border.primary,
                  backgroundColor:
                    exampleGenerationMode === mode.key
                      ? theme.colors.interactive.primary
                      : theme.colors.surface.primary,
                }}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    fontWeight: '600',
                    marginBottom: theme.layout.xs,
                    color:
                      exampleGenerationMode === mode.key
                        ? theme.colors.text.inverse
                        : theme.colors.text.primary,
                  }}
                >
                  {mode.label}
                </Text>
                <Text
                  style={{
                    color:
                      exampleGenerationMode === mode.key
                        ? theme.colors.text.inverse
                        : theme.colors.text.secondary,
                  }}
                >
                  {mode.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        <SettingsSection title="AI Model Selection" description="Choose which AI model to use for generating examples and character meanings.">
          <View
            style={{
              backgroundColor: theme.colors.status.infoBackground,
              padding: theme.layout.md,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.layout.md,
            }}
          >
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.status.infoBorder, fontWeight: '600', marginBottom: theme.layout.xs }}
            >
              Enhanced Character Analysis
            </Text>
            <Text style={{ color: theme.colors.status.infoBorder }}>
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
          
          <View
            style={{
              marginTop: theme.layout.md,
              padding: theme.layout.md,
              backgroundColor: theme.colors.surface.primary,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <Text variant="bodySmall" style={{ fontWeight: '600', marginBottom: theme.layout.xs }}>
              Current Model:
            </Text>
            <Text style={{ fontWeight: '500', color: theme.colors.text.primary }}>
              {MODEL_OPTIONS.find(m => m.key === selectedModel)?.label}
            </Text>
            <Text variant="caption" color="secondary" style={{ marginTop: theme.layout.xs }}>
              {MODEL_OPTIONS.find(m => m.key === selectedModel)?.description}
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Cloud Sync" description="Backup your data to Cloudflare R2">
          <View style={{ flexDirection: 'row', marginBottom: theme.layout.md }}>
            <View style={{ flex: 1, marginRight: theme.layout.sm }}>
              <Button title="Upload Backup" onPress={handleBackup} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Sync From Cloud" onPress={handleRestore} />
            </View>
          </View>
          {syncMessage ? (
            <Text color="secondary">{syncMessage}</Text>
          ) : null}
        </SettingsSection>

        <SettingsSection title="About">
          <Text color="secondary" style={{ marginBottom: theme.layout.xs }}>
            魏Lang
          </Text>
          <Text color="secondary" style={{ marginBottom: theme.layout.xs }}>
            Version 1.0.0
          </Text>
          <Text color="secondary">Spaced repetition for Chinese learning</Text>
        </SettingsSection>
      </Screen>
  );
}

