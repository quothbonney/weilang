import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Lightbulb, TrendingUp, RotateCcw, RefreshCw, Play } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useWordProfile } from "../WordProfileProvider";

export function NotesTab() {
  const router = useRouter();
  const { word, profile, refreshProfile, clearCache, isLoading } = useWordProfile();

  const getMasteryPercentage = () => {
    return Math.min(Math.round((word.repetitions / 10) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'learning': return 'bg-yellow-100 text-yellow-700';
      case 'mature': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getNextReviewText = () => {
    if (word.due <= Date.now()) return 'Due now';
    const days = Math.ceil((word.due - Date.now()) / (1000 * 60 * 60 * 24));
    return `${days} day${days === 1 ? '' : 's'}`;
  };

  return (
    <View className="p-4 space-y-6">
      {/* Memory Aids */}
      {profile?.memoryAids && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Lightbulb size={24} color="#f59e0b" />
            <Text className="text-xl font-semibold text-gray-900 ml-3">Memory Aids</Text>
          </View>
          
          <View className="bg-amber-50 rounded-xl p-4">
            <Text className="text-lg text-amber-800 leading-relaxed">{profile.memoryAids}</Text>
          </View>
        </View>
      )}

      {/* Cultural Context */}
      {profile?.culturalNotes && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Cultural Context</Text>
          <View className="bg-green-50 rounded-xl p-4">
            <Text className="text-lg text-green-800 leading-relaxed">{profile.culturalNotes}</Text>
          </View>
        </View>
      )}

      {/* Learning Progress */}
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-6">
          <TrendingUp size={24} color="#10b981" />
          <Text className="text-xl font-semibold text-gray-900 ml-3">Learning Progress</Text>
        </View>
        
        <View className="space-y-6">
          {/* Mastery Level with improved styling */}
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg text-gray-700 font-medium">Mastery Level</Text>
              <Text className="text-3xl font-bold text-gray-900">{getMasteryPercentage()}%</Text>
            </View>
            <View className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <View 
                className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${getMasteryPercentage()}%` }} 
              />
            </View>
          </View>
          
          {/* Status and Stats Grid */}
          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">{word.repetitions}</Text>
                <Text className="text-xs text-gray-600 font-medium">Reviews</Text>
              </View>
              <View className="w-px h-8 bg-gray-300" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">{Math.round(word.ease * 10) / 10}</Text>
                <Text className="text-xs text-gray-600 font-medium">Ease</Text>
              </View>
              <View className="w-px h-8 bg-gray-300" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">{word.interval}</Text>
                <Text className="text-xs text-gray-600 font-medium">Interval</Text>
              </View>
            </View>
          </View>
          
          {/* Status and Next Review */}
          <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-sm text-gray-600 font-medium mb-2">Status</Text>
              <View className={`px-4 py-2 rounded-full ${getStatusColor(word.status)}`}>
                <Text className="capitalize font-semibold">{word.status}</Text>
              </View>
            </View>
            <View className="items-center">
              <Text className="text-sm text-gray-600 font-medium mb-2">Next Review</Text>
              <Text className="text-lg font-bold text-gray-900">{getNextReviewText()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons - improved styling */}
      <View className="space-y-4">
        <TouchableOpacity 
          className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
          onPress={() => router.push(`/review/${word.id}`)}
        >
          <Play size={22} color="white" />
          <Text className="text-white font-bold text-xl ml-3">Practice</Text>
        </TouchableOpacity>

        <View className="flex-row space-x-4">
          <TouchableOpacity 
            className="flex-1 bg-purple-600 py-3 rounded-xl flex-row items-center justify-center shadow-sm"
            onPress={refreshProfile}
            disabled={isLoading}
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-semibold ml-2">
              {isLoading ? 'Loading...' : 'Refresh'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 bg-red-600 py-3 rounded-xl flex-row items-center justify-center shadow-sm"
            onPress={clearCache}
            disabled={isLoading}
          >
            <RotateCcw size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty State for Memory Aids */}
      {!profile?.memoryAids && !profile?.culturalNotes && (
        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <View className="items-center">
            <Lightbulb size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-4 text-lg">
              Memory aids and cultural notes will appear here once the profile is generated.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 