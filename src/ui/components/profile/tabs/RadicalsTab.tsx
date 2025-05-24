import React from "react";
import { View, Text } from "react-native";
import { Zap } from "lucide-react-native";
import { useWordProfile } from "../WordProfileProvider";

export function RadicalsTab() {
  const { profile } = useWordProfile();

  return (
    <View className="p-4 space-y-6">
      {/* Main Radical Section */}
      {profile?.radical && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-6">
            <Zap size={24} color="#f59e0b" />
            <Text className="text-xl font-semibold text-gray-900 ml-3">Main Radical</Text>
          </View>
          
          <View className="bg-amber-50 rounded-xl p-6">
            <View className="flex-row items-center mb-4">
              <Text className="text-5xl font-light text-gray-900 mr-6">{profile.radical.char}</Text>
              <View>
                <Text className="text-xl font-semibold text-amber-800">{profile.radical.meaning}</Text>
                <Text className="text-sm text-amber-700">Radical #{profile.radical.number}</Text>
              </View>
            </View>
            <Text className="text-amber-800 leading-relaxed">
              This radical appears in many characters related to {profile.radical.meaning.toLowerCase()}.
            </Text>
          </View>
        </View>
      )}

      {/* Character Components Grid */}
      {profile?.characterComponents && profile.characterComponents.length > 0 && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-6">Character Components</Text>
          
          {/* Grid layout for components */}
          <View className="flex-row flex-wrap -mx-2">
            {profile.characterComponents.map((comp, idx) => (
              <View key={idx} className="w-1/2 px-2 mb-4">
                <View className="bg-gray-50 rounded-xl p-4 min-h-[120px] justify-center">
                  <View className="items-center">
                    <Text className="text-4xl font-light text-gray-900 mb-2">{comp.char}</Text>
                    <Text className="text-sm text-gray-600 font-medium mb-1">{comp.pinyin}</Text>
                    <Text className="text-sm text-gray-700 text-center">{comp.meaning}</Text>
                    
                    {/* Component type badge */}
                    <View 
                      className={`mt-2 px-2 py-1 rounded-full ${
                        comp.type === 'radical' 
                          ? 'bg-amber-100' 
                          : 'bg-blue-100'
                      }`}
                    >
                      <Text 
                        className={`text-xs font-medium ${
                          comp.type === 'radical' 
                            ? 'text-amber-700' 
                            : 'text-blue-700'
                        }`}
                      >
                        {comp.type}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Character Evolution/Transformation */}
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Text className="text-xl font-semibold text-gray-900 mb-6">Character Evolution</Text>
        
        <View className="flex-row items-center justify-center space-x-8">
          <View className="items-center">
            <Text className="text-4xl font-light text-gray-900 mb-2">种</Text>
            <Text className="text-base text-gray-600">plant</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-3xl text-gray-400">→</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-4xl font-light text-gray-900 mb-2">研</Text>
            <Text className="text-base text-gray-600">research</Text>
          </View>
        </View>
        
        <Text className="text-gray-600 text-center mt-4 leading-relaxed">
          The character evolved from representing physical "plant" to abstract "research"
        </Text>
      </View>

      {/* Stroke Information */}
      {profile?.totalStrokes && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Stroke Information</Text>
          
          <View className="bg-purple-50 rounded-xl p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg text-purple-800 font-medium">Total Strokes</Text>
              <Text className="text-4xl font-bold text-purple-900">{profile.totalStrokes}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Etymology */}
      {profile?.etymology && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Etymology</Text>
          <View className="bg-blue-50 rounded-xl p-4">
            <Text className="text-lg text-blue-800 leading-relaxed">{profile.etymology}</Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!profile?.radical && !profile?.characterComponents?.length && (
        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <View className="items-center">
            <Zap size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-4 text-lg">
              Radical information will appear here once the profile is generated.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 