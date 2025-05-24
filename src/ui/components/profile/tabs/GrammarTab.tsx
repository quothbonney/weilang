import React from "react";
import { View, Text } from "react-native";
import { Book } from "lucide-react-native";
import { useWordProfile } from "../WordProfileProvider";

export function GrammarTab() {
  const { profile } = useWordProfile();

  return (
    <View className="p-4 space-y-4">
      {/* Dictionary Information */}
      {profile?.dictionary && (
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-6">
            <Book size={24} color="#6b7280" />
            <Text className="text-xl font-semibold text-gray-900 ml-3">
              Dictionary ({profile.dictionary.source})
            </Text>
          </View>
          
          {profile.dictionary.definitions.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-700 mb-4">Definitions</Text>
              <View className="space-y-2">
                {profile.dictionary.definitions.map((def, idx) => (
                  <Text key={idx} className="text-lg text-gray-700 leading-relaxed">
                    • {def}
                  </Text>
                ))}
              </View>
            </View>
          )}
          
          {profile.dictionary.synonyms.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-700 mb-4">Synonyms</Text>
              <View className="flex-row flex-wrap">
                {profile.dictionary.synonyms.map((syn, idx) => (
                  <View key={idx} className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg mr-2 mb-2">
                    <Text className="text-blue-800 font-medium">{syn}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {profile.dictionary.antonyms.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-gray-700 mb-4">Antonyms</Text>
              <View className="flex-row flex-wrap">
                {profile.dictionary.antonyms.map((ant, idx) => (
                  <View key={idx} className="bg-red-50 border border-red-200 px-3 py-2 rounded-lg mr-2 mb-2">
                    <Text className="text-red-800 font-medium">{ant}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Part of Speech */}
      {profile?.partOfSpeech && (
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Part of Speech</Text>
          <View className="bg-green-100 border border-green-200 px-4 py-3 rounded-xl self-start">
            <Text className="text-green-800 font-semibold text-lg">{profile.partOfSpeech}</Text>
          </View>
        </View>
      )}

      {/* Frequency Information */}
      {profile?.frequency && (
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Frequency</Text>
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg text-blue-800 font-medium">Usage Frequency</Text>
              <Text className="text-2xl font-bold text-blue-900">{profile.frequency}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Difficulty Level */}
      {profile?.difficulty && (
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Difficulty Level</Text>
          <View className={`px-4 py-3 rounded-xl self-start border ${
            profile.difficulty.toLowerCase() === 'easy' ? 'bg-green-100 border-green-200' :
            profile.difficulty.toLowerCase() === 'intermediate' ? 'bg-yellow-100 border-yellow-200' :
            'bg-red-100 border-red-200'
          }`}>
            <Text className={`font-semibold text-lg ${
              profile.difficulty.toLowerCase() === 'easy' ? 'text-green-800' :
              profile.difficulty.toLowerCase() === 'intermediate' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {profile.difficulty}
            </Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!profile?.dictionary && !profile?.partOfSpeech && !profile?.frequency && !profile?.difficulty && (
        <View className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <View className="items-center">
            <Book size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-4 text-lg">
              Grammar and dictionary information will appear here once the profile is generated.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 