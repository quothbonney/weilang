import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../src/ui/hooks/useStore";

export default function ExampleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { generateExample, lastGeneratedExample, isLoading, error, clearError } = useStore();
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (id && !hasGenerated) {
      generateExample(id);
      setHasGenerated(true);
    }
  }, [id]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Generating example...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            clearError();
            setHasGenerated(false);
          }}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!lastGeneratedExample) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>No example generated yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Example Sentence:</Text>
        <Text style={styles.hanzi}>{lastGeneratedExample.hanzi}</Text>
        <Text style={styles.pinyin}>{lastGeneratedExample.pinyin}</Text>
        <Text style={styles.gloss}>{lastGeneratedExample.gloss}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={() => {
            if (id) generateExample(id);
          }}
        >
          <Text style={styles.buttonText}>Generate Another</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  hanzi: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  pinyin: {
    fontSize: 20,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  gloss: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoText: {
    color: '#6b7280',
    textAlign: 'center',
  },
}); 