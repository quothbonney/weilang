import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../src/ui/hooks/useStore";
import { WordProfile } from "../../src/domain/entities";

export default function WordProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { words, isLoading, error, clearError, apiKey, selectedModel } = useStore();
  const [profile, setProfile] = useState<WordProfile | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const word = words.find(w => w.id === id);

  useEffect(() => {
    if (word && apiKey) {
      generateProfile();
    }
  }, [word, apiKey]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const generateProfile = async () => {
    if (!word || !apiKey) return;

    setGenerating(true);
    try {
      // Mock profile generation for now - in real implementation this would use the use case
      const mockProfile: WordProfile = {
        id: `profile-${word.id}`,
        wordId: word.id,
        partOfSpeech: "Loading...",
        detailedMeaning: "Generating detailed analysis...",
        exampleSentences: [
          { hanzi: word.hanzi, pinyin: word.pinyin, gloss: word.meaning }
        ],
        createdAt: Date.now(),
      };
      
      setProfile(mockProfile);
      
      // Simulate API call delay
      setTimeout(() => {
        const enhancedProfile: WordProfile = {
          ...mockProfile,
          partOfSpeech: getPartOfSpeech(word.hanzi),
          detailedMeaning: getDetailedMeaning(word.hanzi, word.meaning),
          exampleSentences: [
            { hanzi: `我说${word.hanzi}`, pinyin: `wǒ shuō ${word.pinyin}`, gloss: `I say ${word.meaning}` },
            { hanzi: `这是${word.hanzi}`, pinyin: `zhè shì ${word.pinyin}`, gloss: `This is ${word.meaning}` },
            { hanzi: `${word.hanzi}很好`, pinyin: `${word.pinyin} hěn hǎo`, gloss: `${word.meaning} is very good` }
          ],
          etymology: getEtymology(word.hanzi),
          usage: `This word is commonly used in daily conversation. Model: ${selectedModel}`,
        };
        setProfile(enhancedProfile);
        setGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to generate profile:', error);
      setGenerating(false);
    }
  };

  // Helper functions for mock data
  const getPartOfSpeech = (hanzi: string): string => {
    const verbIndicators = ['吃', '喝', '说', '看', '听'];
    const nounIndicators = ['水', '人', '家', '车', '书'];
    const adjectiveIndicators = ['好', '大', '小', '美', '快'];
    
    if (verbIndicators.some(v => hanzi.includes(v))) return 'Verb';
    if (nounIndicators.some(n => hanzi.includes(n))) return 'Noun';
    if (adjectiveIndicators.some(a => hanzi.includes(a))) return 'Adjective';
    return 'Various';
  };

  const getDetailedMeaning = (hanzi: string, basicMeaning: string): string => {
    return `${basicMeaning.charAt(0).toUpperCase() + basicMeaning.slice(1)} - This word (${hanzi}) represents a fundamental concept in Chinese language and culture. It carries various nuances depending on context and is essential for daily communication.`;
  };

  const getEtymology = (hanzi: string): string => {
    return `The character ${hanzi} has ancient origins and has evolved over thousands of years of Chinese writing history.`;
  };

  if (!word) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Word not found</Text>
      </View>
    );
  }

  if (!apiKey) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>API key not configured</Text>
        <Text style={styles.infoText}>Please set your Together API key in settings</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.buttonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hanzi}>{word.hanzi}</Text>
        <Text style={styles.pinyin}>{word.pinyin}</Text>
        <Text style={styles.basicMeaning}>{word.meaning}</Text>
      </View>

      {generating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Generating comprehensive profile...</Text>
        </View>
      )}

      {profile && !generating && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Part of Speech</Text>
            <Text style={styles.sectionContent}>{profile.partOfSpeech}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Meaning</Text>
            <Text style={styles.sectionContent}>{profile.detailedMeaning}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Example Sentences</Text>
            {profile.exampleSentences.map((example, index) => (
              <View key={index} style={styles.exampleContainer}>
                <Text style={styles.exampleHanzi}>{example.hanzi}</Text>
                <Text style={styles.examplePinyin}>{example.pinyin}</Text>
                <Text style={styles.exampleGloss}>{example.gloss}</Text>
              </View>
            ))}
          </View>

          {profile.etymology && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Etymology</Text>
              <Text style={styles.sectionContent}>{profile.etymology}</Text>
            </View>
          )}

          {profile.usage && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usage Notes</Text>
              <Text style={styles.sectionContent}>{profile.usage}</Text>
            </View>
          )}
        </>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.reviewButton}
          onPress={() => router.push(`/review/${word.id}`)}
        >
          <Text style={styles.buttonText}>Review Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.exampleButton}
          onPress={() => router.push(`/example/${word.id}`)}
        >
          <Text style={styles.buttonText}>Generate Example</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  hanzi: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pinyin: {
    fontSize: 24,
    color: '#6b7280',
    marginBottom: 8,
  },
  basicMeaning: {
    fontSize: 18,
    color: '#4b5563',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
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
    color: '#1f2937',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  exampleContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exampleHanzi: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  examplePinyin: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  exampleGloss: {
    fontSize: 16,
    color: '#4b5563',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  exampleButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
}); 