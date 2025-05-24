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
import { WordProfileDTO } from "../../src/domain/entities";

const { width } = Dimensions.get('window');

export default function WordProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { words, generateEnhancedProfile, lastEnhancedProfile, error, clearError, apiKey, wordProfileService } = useStore();
  const [profile, setProfile] = useState<WordProfileDTO | null>(null);
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

  const clearCacheAndRefresh = async () => {
    if (wordProfileService) {
      console.log('🔍 Clearing profile cache...');
      await wordProfileService.clearCache();
      console.log('✅ Cache cleared! Refreshing profile...');
      if (word) {
        await fetchProfile();
      }
    }
  };

  const fetchProfile = async () => {
    if (!word || !wordProfileService) return;
    
    setGenerating(true);
    console.log(`🔍 Starting progressive profile generation for "${word.hanzi}"...`);
    
    try {
      // Use progressive loading - get API data immediately, LLM data later
      const partialProfile = await wordProfileService.generateProfileProgressive(
        word,
        (enhancedProfile) => {
          console.log(`🔍 LLM enhancement complete for "${word.hanzi}"`);
          setProfile(enhancedProfile);
        }
      );
      
      console.log(`🔍 Partial profile ready for "${word.hanzi}"`);
      setProfile(partialProfile);
    } catch (err) {
      console.error('Failed to generate profile:', err);
      // Fallback to old method if progressive fails
      try {
        const p = await generateEnhancedProfile(word.id);
        setProfile(p);
      } catch (fallbackErr) {
        console.error('Fallback profile generation also failed:', fallbackErr);
      }
    } finally {
      setGenerating(false);
    }
  };

  // Enhanced character analysis function using real profile data
  const analyzeCharacters = (hanzi: string, profileData?: WordProfileDTO) => {
    const characters = hanzi.split('');
    return characters.map((char, index) => {
      // Use real character data from profile if available
      const charComponent = profileData?.characterComponents?.find(c => c.char === char);
      
      const characterData = {
        character: char,
        meaning: charComponent?.meaning || 'Loading...',
        radical: `${char} (${charComponent?.type || 'component'})`,
        strokes: charComponent?.strokes || 8,
        pinyin: charComponent?.pinyin || 'Loading...'
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
          <Text className="text-gray-600 text-center mt-3 mb-8 leading-relaxed">Please configure your API keys to generate comprehensive word profiles.</Text>
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

  const characterBreakdown = word.hanzi.length > 1 ? analyzeCharacters(word.hanzi, profile || undefined) : null;

  return (
    <ScrollView 
      className="flex-1 bg-gradient-to-br from-gray-50 to-white"
      showsVerticalScrollIndicator={false}
      bounces={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
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
              <Text className="text-green-800 font-semibold">{profile?.difficulty || "Loading..."}</Text>
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 px-4 py-2">
              <Text className="text-blue-800 font-semibold">{profile?.frequency || "Loading..."}</Text>
            </Badge>
          </View>
        </View>

        {/* Elegant Stats Grid */}
        <View className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900 mb-1">{profile?.totalStrokes || "?"}</Text>
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

        {/* Character Breakdown - Enhanced with real data */}
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
                      <Text className="text-sm text-gray-600">Component: {charData.radical} • {charData.strokes} strokes</Text>
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

        {/* Enhanced Radical Analysis with real data */}
        {profile?.radical && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <ZapIcon size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Radical Analysis</Text>
            </View>
            
            <View className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200 mb-6">
              <View className="flex-row items-center mb-4">
                <Text className="text-3xl font-light text-gray-900 mr-4">{profile.radical.char}</Text>
                <View>
                  <Text className="text-lg font-semibold text-amber-800">{profile.radical.meaning}</Text>
                  <Text className="text-sm text-amber-700">Radical #{profile.radical.number}</Text>
                </View>
              </View>
              <Text className="text-amber-800 leading-relaxed">This radical appears in many characters related to {profile.radical.meaning.toLowerCase()}.</Text>
            </View>

            {profile.characterComponents && profile.characterComponents.length > 0 && (
              <View className="space-y-4">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Character Components</Text>
                {profile.characterComponents.map((comp, idx) => (
                  <View key={idx} className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <View className="flex-row items-center">
                      <Text className="text-2xl font-light text-gray-900 mr-4">{comp.char}</Text>
                      <View>
                        <Text className="font-semibold text-gray-900">{comp.meaning}</Text>
                        <Text className="text-sm text-gray-600 capitalize">{comp.type} component • {comp.pinyin}</Text>
                      </View>
                    </View>
                    <Badge className={`${comp.type === 'radical' ? 'bg-amber-100 border-amber-200' : 'bg-blue-100 border-blue-200'}`}>
                      <Text className={`${comp.type === 'radical' ? 'text-amber-800' : 'text-blue-800'} text-xs font-medium`}>{comp.type}</Text>
                    </Badge>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Enhanced Detailed Meaning with real data */}
        {profile && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <Book size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Detailed Analysis</Text>
            </View>
            
            {profile.meanings && profile.meanings.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">All Meanings</Text>
                {profile.meanings.map((meaning, idx) => (
                  <Text key={idx} className="text-lg text-gray-700 leading-relaxed mb-2">• {meaning}</Text>
                ))}
              </View>
            )}
            
            <View className="pt-6 border-t border-gray-100">
              <Text className="text-sm text-gray-600 font-medium mb-3">Part of Speech</Text>
              <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 px-4 py-2">
                <Text className="text-blue-800 font-semibold">{profile.partOfSpeech}</Text>
              </Badge>
            </View>
          </View>
        )}

        {/* Enhanced Example Sentences with real data */}
        {profile?.examples && profile.examples.length > 0 && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <FileTextIcon size={24} color="#8b5cf6" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Example Sentences</Text>
            </View>
            
            <View className="space-y-6">
              {profile.examples.map((example, index) => (
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
        )}

        {/* Dictionary Information with real data */}
        {profile?.dictionary && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <Book size={24} color="#6b7280" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Dictionary ({profile.dictionary.source})</Text>
            </View>
            
            {profile.dictionary.definitions.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-700 mb-4">Definitions</Text>
                {profile.dictionary.definitions.map((def, idx) => (
                  <Text key={idx} className="text-lg text-gray-700 leading-relaxed mb-2">• {def}</Text>
                ))}
              </View>
            )}
            
            <View className="space-y-6">
              {profile.dictionary.synonyms.length > 0 && (
                <View>
                  <Text className="text-lg font-semibold text-gray-700 mb-4">Synonyms</Text>
                  <View className="flex-row flex-wrap">
                    {profile.dictionary.synonyms.map((syn, idx) => (
                      <Text key={idx} className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 px-4 py-2 rounded-lg mr-3 mb-3 text-blue-800 font-medium">{syn}</Text>
                    ))}
                  </View>
                </View>
              )}
              
              {profile.dictionary.antonyms.length > 0 && (
                <View>
                  <Text className="text-lg font-semibold text-gray-700 mb-4">Antonyms</Text>
                  <View className="flex-row flex-wrap">
                    {profile.dictionary.antonyms.map((ant, idx) => (
                      <Text key={idx} className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 px-4 py-2 rounded-lg mr-3 mb-3 text-red-800 font-medium">{ant}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Etymology with real data */}
        {profile?.etymology && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <ClockIcon size={24} color="#6b7280" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Etymology</Text>
            </View>
            <Text className="text-lg text-gray-700 leading-relaxed">{profile.etymology}</Text>
          </View>
        )}

        {/* Usage Notes with real data */}
        {profile?.usage && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <LightbulbIcon size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Usage Notes</Text>
            </View>
            <Text className="text-lg text-gray-700 leading-relaxed">{profile.usage}</Text>
          </View>
        )}

        {/* Memory Aids with real data */}
        {profile?.memoryAids && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <LightbulbIcon size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Memory Aids</Text>
            </View>
            
            <View className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
              <Text className="text-lg text-amber-800 leading-relaxed">{profile.memoryAids}</Text>
            </View>
          </View>
        )}

        {/* Cultural Context with real data */}
        {profile?.culturalNotes && (
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-6">
              <GlobeIcon size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-gray-900 ml-3">Cultural Context</Text>
            </View>
            
            <Text className="text-lg text-gray-700 leading-relaxed">{profile.culturalNotes}</Text>
          </View>
        )}

        {/* Enhanced Learning Progress */}
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
        <View className="space-y-4 pt-6 pb-12">
          <View className="flex-row space-x-4">
            <TouchableOpacity 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 py-5 rounded-2xl items-center shadow-lg"
              onPress={() => router.push(`/review/${word.id}`)}
            >
              <Text className="text-white font-bold text-xl">Review Card</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 py-5 rounded-2xl items-center shadow-lg"
              onPress={fetchProfile}
            >
              <Text className="text-white font-bold text-xl">Refresh Profile</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            className="bg-gradient-to-r from-red-500 to-red-600 py-4 rounded-2xl items-center shadow-lg"
            onPress={clearCacheAndRefresh}
            disabled={generating}
          >
            <Text className="text-white font-bold text-lg">🗑️ Clear Cache & Regenerate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 
