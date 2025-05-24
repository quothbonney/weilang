import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Volume2, Heart, Share, Info, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useWordProfile } from "./WordProfileProvider";
import { useStore } from "../../hooks/useStore";
import { speakWithAzure } from "../../../infra/tts/azureTts";
import * as Speech from "expo-speech";

interface WordProfileHeaderProps {
  isCollapsed?: boolean;
}

export function WordProfileHeader({ isCollapsed = false }: WordProfileHeaderProps) {
  const router = useRouter();
  const { word, profile, isLoading, error } = useWordProfile();
  const { apiKey } = useStore();

  const speakWord = async () => {
    if (word) {
      const success = await speakWithAzure(word.hanzi);
      if (!success) {
        Speech.speak(word.hanzi, { language: 'zh-CN' });
      }
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Collapsed header - compact bar at top
  if (isCollapsed) {
    return (
      <View className="bg-white px-6 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-1"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-2xl font-light text-gray-900 mr-3">{word.hanzi}</Text>
          <Text className="text-base text-gray-600">{word.pinyin}</Text>
        </View>
        <TouchableOpacity 
          className="bg-gray-100 p-2 rounded-full"
          onPress={speakWord}
        >
          <Volume2 size={16} color="#4b5563" />
        </TouchableOpacity>
      </View>
    );
  }

  if (!apiKey) {
    return (
      <View className="bg-white px-6 py-8">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2 -ml-2"
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">Word Profile</Text>
        </View>
        
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <View className="flex-row items-center">
            <Info size={20} color="#f59e0b" />
            <Text className="text-amber-800 font-medium ml-2">API Key Required</Text>
          </View>
          <Text className="text-amber-700 mt-2">
            Configure your API keys in settings to generate comprehensive word profiles.
          </Text>
          <TouchableOpacity 
            className="bg-amber-600 py-2 px-4 rounded-lg mt-3 self-start"
            onPress={() => router.push('/settings')}
          >
            <Text className="text-white font-medium">Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Expanded header - tighter version
  return (
    <View className="bg-white">
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 -ml-2"
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-medium text-gray-900">Word Profile</Text>
        <View className="flex-row space-x-1">
          <TouchableOpacity className="p-2">
            <Heart size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Share size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Word Display - Tighter spacing */}
      <View className="px-8 py-8 items-center">
        {/* Character Display - smaller than before */}
        <Text className="text-6xl font-light text-gray-900 mb-3 tracking-wider">
          {word.hanzi}
        </Text>
        
        {/* Pinyin with audio */}
        <View className="flex-row items-center mb-3">
          <Text className="text-2xl text-gray-700 font-normal mr-3">
            {word.pinyin}
          </Text>
          <TouchableOpacity 
            className="bg-gray-100 p-2 rounded-full"
            onPress={speakWord}
          >
            <Volume2 size={18} color="#4b5563" />
          </TouchableOpacity>
        </View>
        
        {/* Meaning */}
        <Text className="text-lg text-gray-600 text-center mb-6 leading-relaxed">
          {word.meaning}
        </Text>

        {/* Large Practice Button */}
        <TouchableOpacity 
          className="bg-blue-600 py-3 px-12 rounded-full shadow-lg mb-4"
          onPress={() => router.push(`/review/${word.id}`)}
        >
          <Text className="text-white font-semibold text-lg">Practice</Text>
        </TouchableOpacity>

        {/* Status badges - smaller and more compact */}
        <View className="flex-row space-x-2">
          {profile?.difficulty && (
            <View className={`px-3 py-1 rounded-full ${getDifficultyColor(profile.difficulty)}`}>
              <Text className="text-xs font-medium capitalize">
                {profile.difficulty}
              </Text>
            </View>
          )}
          {profile?.frequency && (
            <View className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium">
                {profile.frequency}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View className="bg-blue-50 border-t border-blue-100 px-6 py-3">
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="text-blue-700 font-medium ml-3 text-sm">
              Generating profile...
            </Text>
          </View>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View className="bg-red-50 border-t border-red-100 px-6 py-3">
          <Text className="text-red-700 font-medium text-center text-sm">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
} 