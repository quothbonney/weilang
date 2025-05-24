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
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Grid as GridIcon,
  Zap as ZapIcon
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

  // Enhanced character analysis function
  const analyzeCharacters = (hanzi: string) => {
    const characters = hanzi.split('');
    return characters.map((char, index) => {
      // Mock character data - in reality this would come from a character database
      const characterData = {
        character: char,
        meaning: char === '说' ? 'speak, say' : char === '话' ? 'words, speech' : char === '人' ? 'person, human' : char === '好' ? 'good, well' : char === '我' ? 'I, me' : char === '们' ? 'plural marker' : 'meaning',
        radical: char === '说' ? '言 (speech)' : char === '话' ? '言 (speech)' : char === '人' ? '人 (person)' : char === '好' ? '女 (woman)' : char === '我' ? '戈 (halberd)' : char === '们' ? '人 (person)' : '一 (one)',
        strokes: char === '说' ? 9 : char === '话' ? 8 : char === '人' ? 2 : char === '好' ? 6 : char === '我' ? 7 : char === '们' ? 5 : 3,
        pinyin: char === '说' ? 'shuō' : char === '话' ? 'huà' : char === '人' ? 'rén' : char === '好' ? 'hǎo' : char === '我' ? 'wǒ' : char === '们' ? 'men' : 'unknown'
      };

      // Find other words in dataset that contain this character
      const relatedWords = words.filter(w => 
        w.hanzi.includes(char) && w.id !== word?.id
      ).slice(0, 6); // Limit to 6 related words

      return {
        ...characterData,
        relatedWords,
        position: index
      };
    });
  };

  // Mock enhanced dictionary data
  const mockData = {
    frequency: "Common (Top 1000)",
    difficulty: "Beginner",
    strokes: 12,
    radical: {
      character: "言",
      meaning: "speech, words",
      description: "The speech radical (言) represents communication and language-related concepts"
    },
    components: [
      { char: "言", meaning: "speech, words", type: "radical" },
      { char: "吾", meaning: "I, my", type: "phonetic" }
    ],
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
    etymology: "Originally consisted of the mouth radical (口) and evolved to include the speech radical (言) to emphasize verbal communication.",
    wordFamily: [
      { word: "说话", meaning: "to speak", relationship: "compound" },
      { word: "说明", meaning: "to explain", relationship: "compound" },
      { word: "小说", meaning: "novel", relationship: "compound" }
    ]
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
      <View className="flex-1 justify-center items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <View className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <AlertCircleIcon size={56} color="#ef4444" />
          <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">Word not found</Text>
          <Text className="text-gray-600 text-center mt-3 leading-relaxed">The word you're looking for doesn't exist in your collection.</Text>
        </View>
      </View>
    );
  }

  if (!apiKey) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <View className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <InfoIcon size={56} color="#f59e0b" />
          <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">API Key Required</Text>
          <Text className="text-gray-600 text-center mt-3 mb-8 leading-relaxed">Please configure your Together API key to generate comprehensive word profiles.</Text>
          <TouchableOpacity 
            className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 rounded-xl shadow-sm"
            onPress={() => router.push('/settings')}
          >
            <Text className="text-white font-semibold text-lg text-center">Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const characterBreakdown = word.hanzi.length > 1 ? analyzeCharacters(word.hanzi) : null;

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-gray-50 to-white">
      {/* Elegant Hero Section */}
      <View className="bg-white px-8 py-12 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-start justify-between mb-8">
          <View className="flex-1 mr-6">
            <Text className="text-6xl font-light text-gray-900 mb-3 tracking-wide">{word.hanzi}</Text>
            <View className="flex-row items-center mb-3">
              <Text className="text-3xl text-blue-600 font-medium mr-4">{word.pinyin}</Text>
              <TouchableOpacity className="bg-blue-50 p-2 rounded-full" onPress={speakWord}>
                <Volume2Icon size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <Text className="text-xl text-gray-700 leading-relaxed">{word.meaning}</Text>
          </View>
          <View className="items-end space-y-3">
            <Badge className="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 px-4 py-2">
              <Text className="text-green-800 font-semibold">{mockData.difficulty}</Text>
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 px-4 py-2">
              <Text className="text-blue-800 font-semibold">{mockData.frequency}</Text>
            </Badge>
          </View>
        </View>

        {/* Elegant Stats Grid */}
        <View className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900 mb-1">{mockData.strokes}</Text>
              <Text className="text-sm text-gray-600 font-medium">Strokes</Text>
            </View>
            <View className="w-px h-12 bg-gray-300" />
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900 mb-1">{word.repetitions}</Text>
              <Text className="text-sm text-gray-600 font-medium">Reviews</Text>
            </View>
            <View className="w-px h-12 bg-gray-300" />
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900 mb-1">{Math.round(word.ease * 10)/10}</Text>
              <Text className="text-sm text-gray-600 font-medium">Ease</Text>
            </View>
            <View className="w-px h-12 bg-gray-300" />
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900 mb-1">{word.interval}</Text>
              <Text className="text-sm text-gray-600 font-medium">Interval</Text>
            </View>
          </View>
        </View>

        {/* Premium Action Buttons */}
        <View className="flex-row space-x-4">
          <TouchableOpacity className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 py-4 rounded-xl items-center shadow-sm">
            <Text className="text-white font-semibold text-lg">Practice</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-xl">
            <HeartIcon size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-xl">
            <ShareIcon size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {generating && (
        <View className="bg-white mx-6 mt-6 p-10 rounded-2xl shadow-lg border border-gray-100">
          <View className="items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-700 mt-6 font-semibold text-lg">Generating comprehensive profile...</Text>
            <Text className="text-gray-500 text-center mt-2 leading-relaxed">Analyzing characters, radicals, and linguistic patterns</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View className="p-6 space-y-6">

        {/* Character Breakdown - New Enhanced Section */}
        {characterBreakdown && characterBreakdown.length > 1 && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <GridIcon size={24} color="#8b5cf6" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Character Breakdown</Text>
            </View>
            
            <View className="space-y-6">
              {characterBreakdown.map((charData, index) => (
                <View key={index} className="border-l-4 border-purple-200 pl-6 py-4 bg-purple-50 rounded-r-xl">
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-4xl font-light text-gray-900 mr-4">{charData.character}</Text>
                        <Badge className="bg-purple-100 border border-purple-200">
                          <Text className="text-purple-800 font-medium">{charData.pinyin}</Text>
                        </Badge>
                      </View>
                      <Text className="text-lg text-gray-700 mb-2">{charData.meaning}</Text>
                      <Text className="text-sm text-gray-600">Radical: {charData.radical} • {charData.strokes} strokes</Text>
                    </View>
                  </View>
                  
                  {charData.relatedWords.length > 0 && (
                    <View className="mt-4 pt-4 border-t border-purple-200">
                      <Text className="text-sm font-semibold text-gray-700 mb-3">Found in your vocabulary:</Text>
                      <View className="flex-row flex-wrap">
                        {charData.relatedWords.map((relWord, idx) => (
                          <TouchableOpacity key={idx} className="bg-white border border-purple-200 px-3 py-2 rounded-lg mr-2 mb-2 shadow-sm">
                            <Text className="text-purple-800 font-medium">{relWord.hanzi}</Text>
                            <Text className="text-purple-600 text-xs">{relWord.meaning}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Enhanced Radical Analysis */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <ZapIcon size={24} color="#f59e0b" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">Radical Analysis</Text>
          </View>
          
          <View className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200 mb-6">
            <View className="flex-row items-center mb-4">
              <Text className="text-3xl font-light text-gray-900 mr-4">{mockData.radical.character}</Text>
              <View>
                <Text className="text-lg font-semibold text-amber-800">{mockData.radical.meaning}</Text>
                <Text className="text-sm text-amber-700">Primary Radical</Text>
              </View>
            </View>
            <Text className="text-amber-800 leading-relaxed">{mockData.radical.description}</Text>
          </View>

          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Character Components</Text>
            {mockData.components.map((comp, idx) => (
              <View key={idx} className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
                <View className="flex-row items-center">
                  <Text className="text-2xl font-light text-gray-900 mr-4">{comp.char}</Text>
                  <View>
                    <Text className="font-semibold text-gray-900">{comp.meaning}</Text>
                    <Text className="text-sm text-gray-600 capitalize">{comp.type} component</Text>
                  </View>
                </View>
                <Badge className={`${comp.type === 'radical' ? 'bg-amber-100 border-amber-200' : 'bg-blue-100 border-blue-200'}`}>
                  <Text className={`${comp.type === 'radical' ? 'text-amber-800' : 'text-blue-800'} text-xs font-medium`}>{comp.type}</Text>
                </Badge>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Usage Context */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <UsersIcon size={24} color="#10b981" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">Usage Context</Text>
          </View>
          
          <View className="space-y-5">
            {Object.entries(mockData.usage).map(([context, percentage]) => (
              <View key={context} className="space-y-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg text-gray-700 capitalize font-medium">{context}</Text>
                  <Text className="text-xl font-bold text-gray-900">{percentage}%</Text>
                </View>
                <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
                  <View 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full shadow-sm" 
                    style={{ width: `${percentage}%` }} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {profile && !generating && (
          <>
            {/* Enhanced Detailed Meaning */}
            <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <View className="flex-row items-center mb-6">
                <Book size={24} color="#3b82f6" />
                <Text className="text-2xl font-bold text-gray-900 ml-3">Detailed Meaning</Text>
              </View>
              <Text className="text-lg text-gray-700 leading-relaxed mb-6">{profile.detailedMeaning}</Text>
              <View className="pt-6 border-t border-gray-100">
                <Text className="text-sm text-gray-600 font-medium mb-3">Part of Speech</Text>
                <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 px-4 py-2">
                  <Text className="text-blue-800 font-semibold">{profile.partOfSpeech}</Text>
                </Badge>
              </View>
            </View>

            {/* Enhanced Example Sentences */}
            <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <View className="flex-row items-center mb-6">
                <FileTextIcon size={24} color="#8b5cf6" />
                <Text className="text-2xl font-bold text-gray-900 ml-3">Example Sentences</Text>
              </View>
              
              <View className="space-y-6">
                {profile.exampleSentences.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200"
                    onPress={() => speakExample(example.hanzi)}
                  >
                    <Text className="text-xl font-semibold text-gray-900 mb-2 leading-relaxed">{example.hanzi}</Text>
                    <Text className="text-lg text-blue-600 mb-3 font-medium">{example.pinyin}</Text>
                    <Text className="text-lg text-gray-700 italic leading-relaxed">{example.gloss}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Etymology */}
            {profile.etymology && (
              <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <View className="flex-row items-center mb-6">
                  <ClockIcon size={24} color="#6b7280" />
                  <Text className="text-2xl font-bold text-gray-900 ml-3">Etymology</Text>
                </View>
                <Text className="text-lg text-gray-700 leading-relaxed">{profile.etymology}</Text>
              </View>
            )}

            {/* Usage Notes */}
            {profile.usage && (
              <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <View className="flex-row items-center mb-6">
                  <LightbulbIcon size={24} color="#f59e0b" />
                  <Text className="text-2xl font-bold text-gray-900 ml-3">Usage Notes</Text>
                </View>
                <Text className="text-lg text-gray-700 leading-relaxed">{profile.usage}</Text>
              </View>
            )}
          </>
        )}

        {/* Enhanced Related Words */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <BrainIcon size={24} color="#10b981" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">Related Words</Text>
          </View>
          
          <View className="flex-row flex-wrap">
            {mockData.relatedWords.map((word, idx) => (
              <TouchableOpacity key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-3 rounded-xl mr-3 mb-3 shadow-sm">
                <Text className="text-green-800 font-semibold text-lg">{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Enhanced Word Family */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <SearchIcon size={24} color="#8b5cf6" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">Word Family</Text>
          </View>
          
          <View className="space-y-4">
            {mockData.wordFamily.map((item, idx) => (
              <View key={idx} className="flex-row items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-gray-900 mb-1">{item.word}</Text>
                  <Text className="text-gray-700">{item.meaning}</Text>
                </View>
                <Badge className="bg-purple-100 border border-purple-200">
                  <Text className="text-purple-800 text-sm font-medium">{item.relationship}</Text>
                </Badge>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced English Equivalents */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <GlobeIcon size={24} color="#8b5cf6" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">English Equivalents</Text>
          </View>
          
          <View className="space-y-6">
            <View>
              <Text className="text-lg font-semibold text-gray-700 mb-4">Synonyms</Text>
              <View className="flex-row flex-wrap">
                {mockData.synonyms.map((syn, idx) => (
                  <Text key={idx} className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 px-4 py-2 rounded-lg mr-3 mb-3 text-blue-800 font-medium">{syn}</Text>
                ))}
              </View>
            </View>
            
            <View>
              <Text className="text-lg font-semibold text-gray-700 mb-4">Antonyms</Text>
              <View className="flex-row flex-wrap">
                {mockData.antonyms.map((ant, idx) => (
                  <Text key={idx} className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 px-4 py-2 rounded-lg mr-3 mb-3 text-red-800 font-medium">{ant}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Memory Aids */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <LightbulbIcon size={24} color="#f59e0b" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">Memory Aids</Text>
          </View>
          
          <View className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
            <Text className="text-lg text-amber-800 leading-relaxed">{mockData.memoryAids}</Text>
          </View>
        </View>

        {/* Enhanced Cultural Context */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <GlobeIcon size={24} color="#10b981" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">Cultural Context</Text>
          </View>
          
          <Text className="text-lg text-gray-700 leading-relaxed">{mockData.culturalNotes}</Text>
        </View>

        {/* Dictionary Definition */}
        {dictionary && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <Book size={24} color="#6b7280" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">English Dictionary</Text>
            </View>
            
            {dictionary.meanings?.[0]?.definitions?.[0]?.definition && (
              <Text className="text-lg text-gray-700 leading-relaxed mb-6">{dictionary.meanings[0].definitions[0].definition}</Text>
            )}
            
            {dictionary.meanings?.[0]?.definitions?.[0]?.synonyms?.length > 0 && (
              <View className="pt-6 border-t border-gray-100">
                <Text className="text-lg font-semibold text-gray-700 mb-4">Dictionary Synonyms</Text>
                <Text className="text-gray-700 leading-relaxed">{dictionary.meanings[0].definitions[0].synonyms.slice(0,5).join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Enhanced Review Progress */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-6">
            <TrendingUpIcon size={24} color="#10b981" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">Learning Progress</Text>
          </View>
          
          <View className="space-y-6">
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg text-gray-700 font-medium">Mastery Level</Text>
                <Text className="text-2xl font-bold text-gray-900">{Math.min(Math.round((word.repetitions / 10) * 100), 100)}%</Text>
              </View>
              <View className="bg-gray-200 h-4 rounded-full overflow-hidden">
                <View 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full shadow-sm" 
                  style={{ width: `${Math.min((word.repetitions / 10) * 100, 100)}%` }} 
                />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center pt-6 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-sm text-gray-600 font-medium mb-2">Status</Text>
                <Badge className={`${word.status === 'new' ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200' : word.status === 'learning' ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200' : 'bg-gradient-to-r from-green-100 to-green-50 border-green-200'} px-4 py-2`}>
                  <Text className={`${word.status === 'new' ? 'text-blue-800' : word.status === 'learning' ? 'text-yellow-800' : 'text-green-800'} capitalize font-semibold`}>{word.status}</Text>
                </Badge>
              </View>
              <View className="items-center">
                <Text className="text-sm text-gray-600 font-medium mb-2">Next Review</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {word.due > Date.now() ? `${Math.ceil((word.due - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'Due now'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Action Buttons */}
        <View className="flex-row space-x-4 pt-6 pb-12">
          <TouchableOpacity 
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 py-5 rounded-2xl items-center shadow-lg"
            onPress={() => router.push(`/review/${word.id}`)}
          >
            <Text className="text-white font-bold text-xl">Review Card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 py-5 rounded-2xl items-center shadow-lg"
            onPress={() => router.push(`/example/${word.id}`)}
          >
            <Text className="text-white font-bold text-xl">Generate Example</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 
