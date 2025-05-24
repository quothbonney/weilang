import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useStore } from "../src/ui/hooks/useStore";
import { storage } from "../src/platform/storageUtils";

const API_KEY_STORAGE_KEY = 'weilang_api_key';

export default function SettingsScreen() {
  const { apiKey, setApiKey } = useStore();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load API key from storage on mount
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const storedKey = await storage.getItem(API_KEY_STORAGE_KEY);
      if (storedKey) {
        setInputKey(storedKey);
        setApiKey(storedKey);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Together API Configuration</Text>
        <Text style={styles.description}>
          Enter your Together API key to enable example sentence generation.
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
}); 