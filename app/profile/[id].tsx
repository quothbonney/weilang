import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import * as Speech from "expo-speech"; // fallback
import { speakWithAzure } from "../../src/infra/tts/azureTts";
import { 
  Card, 
  Badge,
  Avatar,
  AvatarImage,
  Divider,
  Progress,
  Button,
  ButtonText,
  VStack,
  HStack,
  Box,
  Heading
} from "@gluestack-ui/themed";
import { 
  Book, 
  Sparkles, 
  Clock as ClockIcon, 
  Globe as GlobeIcon, 
  Brain as BrainIcon,
  Target as TargetIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  Layers as LayersIcon,
  Volume2 as Volume2Icon,
  Heart as HeartIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Copy as CopyIcon,
  Edit as EditIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../src/ui/hooks/useStore";
import { WordProfile } from "../../src/domain/entities";

const { width } = Dimensions.get('window');

export default function WordProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { words, generateWordProfile, lastGeneratedProfile, error, clearError, apiKey } = useStore();
  const [profile, setProfile] = useState<WordProfile | null>(null);
  const [dictionary, setDictionary] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
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

  // Mock additional dictionary data for demonstration
  const mockData = {
    frequency: "Common (Top 1000)",
    difficulty: "Beginner",
    strokes: 12,
    radical: "言",
    components: ["言", "吾"],
    relatedWords: ["说话", "谈话", "对话", "讲话"],
    synonyms: ["speak", "talk", "say", "tell"],
    antonyms: ["listen", "hear", "silence"],
    culturalNotes: "This word is commonly used in formal and informal contexts in Mandarin Chinese.",
    memoryAids: "Think of 'words' coming from your mouth when you speak.",
    usage: {
      formal: 85,
      informal: 90,
      written: 80,
      spoken: 95
    },
    tones: {
      tone: "3rd tone",
      description: "Falling-rising tone, like asking 'Really?'"
    }
  };

  const speakWord = async () => {
    if (word) {
      const success = await speakWithAzure(word.hanzi);
      if (!success) {
        Speech.speak(word.hanzi, { language: 'zh-CN' });
      }
    }
  };

  const speakExample = async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  };

  if (!word) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <AlertCircleIcon size={48} color="#ef4444" />
        <Text className="text-xl font-semibold text-gray-900 mt-4">Word not found</Text>
        <Text className="text-gray-600 text-center mt-2">The word you're looking for doesn't exist in your collection.</Text>
      </View>
    );
  }

  if (!apiKey) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <InfoIcon size={48} color="#f59e0b" />
        <Text className="text-xl font-semibold text-gray-900 mt-4">API Key Required</Text>
        <Text className="text-gray-600 text-center mt-2 mb-6">Please configure your Together API key to generate comprehensive word profiles.</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => router.push('/settings')}
        >
          <Text className="text-white font-semibold">Go to Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Hero Section */}
      <View className="bg-white px-6 py-8 border-b border-gray-100">
        <View className="flex-row items-start justify-between mb-6">
          <View className="flex-1">
            <Text className="text-5xl font-bold text-gray-900 mb-2">{word.hanzi}</Text>
            <Text className="text-2xl text-blue-600 font-medium mb-1">{word.pinyin}</Text>
            <Text className="text-lg text-gray-700">{word.meaning}</Text>
          </View>
          <View className="items-end space-y-2">
            <Badge className="bg-green-100 border border-green-200">
              <Text className="text-green-800 font-medium">{mockData.difficulty}</Text>
            </Badge>
            <Badge className="bg-blue-100 border border-blue-200">
              <Text className="text-blue-800 font-medium">{mockData.frequency}</Text>
            </Badge>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4">
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">{mockData.strokes}</Text>
            <Text className="text-sm text-gray-600">Strokes</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">{word.repetitions}</Text>
            <Text className="text-sm text-gray-600">Reviews</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">{Math.round(word.ease * 10)/10}</Text>
            <Text className="text-sm text-gray-600">Ease</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">{word.interval}</Text>
            <Text className="text-sm text-gray-600">Interval</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3 mt-6">
          <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-lg items-center">
            <Text className="text-white font-semibold">Practice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
            onPress={speakWord}
          >
            <Text className="text-gray-700 font-semibold">Listen</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-3 rounded-lg">
            <HeartIcon size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-3 rounded-lg">
            <ShareIcon size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {generating && (
        <View className="bg-white mx-4 mt-4 p-8 rounded-xl shadow-sm border border-gray-100">
          <View className="items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4 font-medium">Generating comprehensive profile...</Text>
            <Text className="text-gray-500 text-sm mt-1">This may take a few moments</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View className="p-4 space-y-4">

        {/* Character Analysis */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <LayersIcon size={20} color="#8b5cf6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Character Analysis</Text>
          </View>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Radical</Text>
              <Text className="font-semibold text-gray-900">{mockData.radical}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Components</Text>
              <View className="flex-row space-x-2">
                {mockData.components.map((comp, idx) => (
                  <Text key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">{comp}</Text>
                ))}
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Tone</Text>
              <Text className="font-semibold text-gray-900">{mockData.tones.tone}</Text>
            </View>
          </View>
        </View>

        {/* Pronunciation & Tone */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Volume2Icon size={20} color="#10b981" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Pronunciation Guide</Text>
          </View>
          
          <View className="bg-green-50 p-4 rounded-lg border border-green-100">
            <Text className="text-green-800 font-medium mb-2">{mockData.tones.description}</Text>
            <Text className="text-green-700 text-sm">{mockData.tones.description}</Text>
          </View>
        </View>

        {/* Usage Context */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <UsersIcon size={20} color="#f59e0b" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Usage Context</Text>
          </View>
          
          <View className="space-y-3">
            {Object.entries(mockData.usage).map(([context, percentage]) => (
              <View key={context} className="space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 capitalize">{context}</Text>
                  <Text className="text-gray-900 font-medium">{percentage}%</Text>
                </View>
                <View className="bg-gray-200 h-2 rounded-full">
                  <View 
                    className="bg-amber-500 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {profile && !generating && (
          <>
            {/* Detailed Meaning */}
            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <Book size={20} color="#3b82f6" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Detailed Meaning</Text>
              </View>
              <Text className="text-gray-700 leading-6">{profile.detailedMeaning}</Text>
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-sm text-gray-600 font-medium mb-2">Part of Speech</Text>
                <Badge className="bg-blue-100 border border-blue-200 self-start">
                  <Text className="text-blue-800">{profile.partOfSpeech}</Text>
                </Badge>
              </View>
            </View>

            {/* Example Sentences */}
            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <FileTextIcon size={20} color="#8b5cf6" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Example Sentences</Text>
              </View>
              
              <View className="space-y-4">
                {profile.exampleSentences.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                    onPress={() => speakExample(example.hanzi)}
                  >
                    <Text className="text-lg font-semibold text-gray-900 mb-1">{example.hanzi}</Text>
                    <Text className="text-blue-600 mb-2">{example.pinyin}</Text>
                    <Text className="text-gray-700 italic">{example.gloss}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Etymology */}
            {profile.etymology && (
              <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-4">
                  <ClockIcon size={20} color="#6b7280" />
                  <Text className="text-lg font-semibold text-gray-900 ml-2">Etymology</Text>
                </View>
                <Text className="text-gray-700 leading-6">{profile.etymology}</Text>
              </View>
            )}

            {/* Usage Notes */}
            {profile.usage && (
              <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-4">
                  <LightbulbIcon size={20} color="#f59e0b" />
                  <Text className="text-lg font-semibold text-gray-900 ml-2">Usage Notes</Text>
                </View>
                <Text className="text-gray-700 leading-6">{profile.usage}</Text>
              </View>
            )}
          </>
        )}

        {/* Related Words */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <BrainIcon size={20} color="#10b981" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Related Words</Text>
          </View>
          
          <View className="flex-row flex-wrap">
            {mockData.relatedWords.map((word, idx) => (
              <TouchableOpacity key={idx} className="bg-green-50 border border-green-200 px-3 py-2 rounded-lg mr-2 mb-2">
                <Text className="text-green-800 font-medium">{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Synonyms & Antonyms */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <GlobeIcon size={20} color="#8b5cf6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">English Equivalents</Text>
          </View>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Synonyms</Text>
              <View className="flex-row flex-wrap">
                {mockData.synonyms.map((syn, idx) => (
                  <Text key={idx} className="bg-blue-50 border border-blue-200 px-3 py-1 rounded mr-2 mb-2 text-blue-800">{syn}</Text>
                ))}
              </View>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Antonyms</Text>
              <View className="flex-row flex-wrap">
                {mockData.antonyms.map((ant, idx) => (
                  <Text key={idx} className="bg-red-50 border border-red-200 px-3 py-1 rounded mr-2 mb-2 text-red-800">{ant}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Memory Aids */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <LightbulbIcon size={20} color="#f59e0b" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Memory Aids</Text>
          </View>
          
          <View className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <Text className="text-amber-800">{mockData.memoryAids}</Text>
          </View>
        </View>

        {/* Cultural Context */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <GlobeIcon size={20} color="#10b981" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Cultural Context</Text>
          </View>
          
          <Text className="text-gray-700 leading-6">{mockData.culturalNotes}</Text>
        </View>

        {/* Dictionary Definition */}
        {dictionary && (
          <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Book size={20} color="#6b7280" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">English Dictionary</Text>
            </View>
            
            {dictionary.meanings?.[0]?.definitions?.[0]?.definition && (
              <Text className="text-gray-700 leading-6 mb-4">{dictionary.meanings[0].definitions[0].definition}</Text>
            )}
            
            {dictionary.meanings?.[0]?.definitions?.[0]?.synonyms?.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-2">Dictionary Synonyms</Text>
                <Text className="text-gray-700">{dictionary.meanings[0].definitions[0].synonyms.slice(0,5).join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Review Progress */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <TrendingUpIcon size={20} color="#10b981" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Learning Progress</Text>
          </View>
          
          <View className="space-y-4">
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Mastery Level</Text>
                <Text className="font-semibold text-gray-900">{Math.min(Math.round((word.repetitions / 10) * 100), 100)}%</Text>
              </View>
              <View className="bg-gray-200 h-3 rounded-full">
                <View 
                  className="bg-green-500 h-3 rounded-full" 
                  style={{ width: `${Math.min((word.repetitions / 10) * 100, 100)}%` }} 
                />
              </View>
            </View>
            
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-sm text-gray-600">Status</Text>
                <Badge className={`mt-1 ${word.status === 'new' ? 'bg-blue-100 border-blue-200' : word.status === 'learning' ? 'bg-yellow-100 border-yellow-200' : 'bg-green-100 border-green-200'}`}>
                  <Text className={`${word.status === 'new' ? 'text-blue-800' : word.status === 'learning' ? 'text-yellow-800' : 'text-green-800'} capitalize`}>{word.status}</Text>
                </Badge>
              </View>
              <View className="items-center">
                <Text className="text-sm text-gray-600">Next Review</Text>
                <Text className="font-semibold text-gray-900 mt-1">
                  {word.due > Date.now() ? `${Math.ceil((word.due - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'Due now'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3 pt-4 pb-8">
          <TouchableOpacity 
            className="flex-1 bg-blue-600 py-4 rounded-xl items-center shadow-sm"
            onPress={() => router.push(`/review/${word.id}`)}
          >
            <Text className="text-white font-semibold text-lg">Review Card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 bg-purple-600 py-4 rounded-xl items-center shadow-sm"
            onPress={() => router.push(`/example/${word.id}`)}
          >
            <Text className="text-white font-semibold text-lg">Generate Example</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 
