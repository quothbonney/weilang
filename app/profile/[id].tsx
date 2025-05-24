import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Book, Info, Sparkles } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../src/ui/hooks/useStore";
import { WordProfile } from "../../src/domain/entities";

export default function WordProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { words, generateWordProfile, lastGeneratedProfile, error, clearError, apiKey } = useStore();
  const [profile, setProfile] = useState<WordProfile | null>(null);
  const [dictionary, setDictionary] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const word = words.find(w => w.id === id);

  useEffect(() => {
    if (word && apiKey) {
      fetchProfile();
    }
  }, [word, apiKey]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const fetchProfile = async () => {
    if (!word) return;
    setGenerating(true);
    try {
      const p = await generateWordProfile(word.id);
      setProfile(p);
      if (p) {
        fetchDictionary(word.meaning);
      }
    } catch (err) {
      console.error('Failed to generate profile:', err);
    } finally {
      setGenerating(false);
    }
  };

  const fetchDictionary = async (meaning: string) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${meaning}`);
      if (res.ok) {
        const data = await res.json();
        setDictionary(data[0]);
      }
    } catch (e) {
      console.log('dictionary fetch failed');
    }
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
      <LinearGradient colors={["#8b5cf6", "#ec4899"]} style={styles.header}>
        <Text style={styles.hanzi}>{word.hanzi}</Text>
        <Text style={styles.pinyin}>{word.pinyin}</Text>
        <Text style={styles.basicMeaning}>{word.meaning}</Text>
      </LinearGradient>

      {generating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Generating comprehensive profile...</Text>
        </View>
      )}

      {profile && !generating && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Book size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>Part of Speech</Text>
            </View>
            <Text style={styles.sectionContent}>{profile.partOfSpeech}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>Detailed Meaning</Text>
            </View>
            <Text style={styles.sectionContent}>{profile.detailedMeaning}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>Example Sentences</Text>
            </View>
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
              <View style={styles.sectionHeader}>
                <Book size={20} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Etymology</Text>
              </View>
              <Text style={styles.sectionContent}>{profile.etymology}</Text>
            </View>
          )}

          {profile.usage && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Info size={20} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Usage Notes</Text>
              </View>
              <Text style={styles.sectionContent}>{profile.usage}</Text>
            </View>
          )}

          {dictionary && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Info size={20} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>English Definition</Text>
              </View>
              {dictionary.meanings?.[0]?.definitions?.[0]?.definition && (
                <Text style={styles.sectionContent}>
                  {dictionary.meanings[0].definitions[0].definition}
                </Text>
              )}
              {dictionary.meanings?.[0]?.definitions?.[0]?.synonyms?.length > 0 && (
                <Text style={styles.sectionContent}>
                  Synonyms: {dictionary.meanings[0].definitions[0].synonyms.slice(0,5).join(', ')}
                </Text>
              )}
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
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  hanzi: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  pinyin: {
    fontSize: 24,
    color: 'white',
    marginBottom: 8,
  },
  basicMeaning: {
    fontSize: 18,
    color: 'white',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
