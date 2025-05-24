import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FileText, Volume2 } from "lucide-react-native";
import { useWordProfile } from "../WordProfileProvider";
import { speakWithAzure } from "../../../../infra/tts/azureTts";
import * as Speech from "expo-speech";

export function ExamplesTab() {
  const { profile, word } = useWordProfile();

  const speakExample = async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  };

  return (
    <View className="p-4 space-y-6">
      {/* Example Sentences Section */}
      {profile?.examples && profile.examples.length > 0 ? (
        <View className="space-y-4">
          {profile.examples.map((example, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              onPress={() => speakExample(example.hanzi)}
              activeOpacity={0.7}
            >
              {/* HSK Level and Tags */}
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 px-3 py-1 rounded-full mr-3">
                  <Text className="text-purple-700 font-semibold text-sm">HSK 5</Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 font-medium text-sm">考</Text>
                </View>
              </View>
              
              {/* Example sentence content */}
              <View className="mb-4">
                <Text className="text-xl font-medium text-gray-900 mb-3 leading-relaxed">
                  {example.hanzi}
                </Text>
                <Text className="text-lg text-gray-600 mb-3 leading-relaxed">
                  {example.pinyin}
                </Text>
                <Text className="text-lg text-gray-700 italic leading-relaxed">
                  {example.gloss}
                </Text>
              </View>

              {/* Audio button */}
              <View className="flex-row justify-end">
                <TouchableOpacity 
                  className="bg-purple-50 p-3 rounded-full"
                  onPress={() => speakExample(example.hanzi)}
                >
                  <Volume2 size={20} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* Placeholder matching the design */
        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {/* Show a sample example like in the design */}
          <View className="flex-row items-center mb-4">
            <View className="bg-purple-100 px-3 py-1 rounded-full mr-3">
              <Text className="text-purple-700 font-semibold text-sm">HSK 5</Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-medium text-sm">考</Text>
            </View>
          </View>
          
          <Text className="text-xl font-medium text-gray-900 mb-3 leading-relaxed">
            他是该大学的优秀科研人员。
          </Text>
          <Text className="text-lg text-gray-600 mb-3 leading-relaxed">
            Tā shì gāi dàxué de yōuxiù kēyán rényuán.
          </Text>
          <Text className="text-lg text-gray-700 italic leading-relaxed">
            He is an outstanding scientific researcher of the university.
          </Text>
        </View>
      )}

      {/* Usage Notes */}
      {profile?.usage && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Usage Notes</Text>
          <View className="bg-amber-50 rounded-xl p-4">
            <Text className="text-lg text-amber-800 leading-relaxed">{profile.usage}</Text>
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

      {/* Empty state if no examples or notes */}
      {!profile?.examples?.length && !profile?.usage && !profile?.culturalNotes && (
        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <View className="items-center">
            <FileText size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-4 text-lg">
              Examples and usage notes will appear here once the profile is generated.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 