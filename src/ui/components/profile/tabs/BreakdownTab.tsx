import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useWordProfile } from "../WordProfileProvider";
import { useStore } from "../../../hooks/useStore";

interface CharacterData {
  character: string;
  meaning: string;
  pinyin: string;
  strokes: number;
  type: string;
  relatedWords: Array<{ hanzi: string; meaning: string; id: string }>;
}

export function BreakdownTab() {
  const { word, profile } = useWordProfile();
  const { words } = useStore();

  // Analyze characters using profile data
  const analyzeCharacters = (): CharacterData[] => {
    const characters = word.hanzi.split('');
    return characters.map((char, index) => {
      const charComponent = profile?.characterComponents?.find(
        c => c.type === 'character' && c.position === index
      );
      
      // Find other words in dataset that contain this character
      const relatedWords = words
        .filter(w => w.hanzi.includes(char) && w.id !== word.id)
        .slice(0, 6)
        .map(w => ({ hanzi: w.hanzi, meaning: w.meaning, id: w.id }));

      return {
        character: char,
        meaning: charComponent?.meaning || 'Loading...',
        pinyin: charComponent?.pinyin || 'Loading...',
        strokes: charComponent?.strokes || 8,
        type: charComponent?.type || 'component',
        relatedWords,
      };
    });
  };

  const characterBreakdown = word.hanzi.length > 1 ? analyzeCharacters() : null;

  return (
    <View className="p-4 space-y-6">
      {/* Character Section - matching the design */}
      <View>
        <Text className="text-2xl font-bold text-gray-900 mb-4">Character</Text>
        
        {/* Single character display */}
        {word.hanzi.length === 1 ? (
          <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <View className="items-center">
              <Text className="text-8xl font-light text-gray-900 mb-4">{word.hanzi}</Text>
              <Text className="text-2xl text-gray-600 font-medium mb-2">{word.pinyin}</Text>
              <Text className="text-xl text-gray-700 text-center">{word.meaning}</Text>
            </View>
          </View>
        ) : (
          /* Multi-character breakdown - like the design */
          <View className="flex-row space-x-4">
            {characterBreakdown?.map((charData, index) => (
              <View key={index} className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <View className="items-center">
                  <Text className="text-6xl font-light text-gray-900 mb-3">{charData.character}</Text>
                  <Text className="text-lg font-medium text-gray-600 mb-1">{charData.pinyin}</Text>
                  <Text className="text-base text-gray-700 text-center">{charData.meaning}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Radicals / Components Section - matching the design */}
      {profile?.characterComponents && profile.characterComponents.length > 0 && (
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-4">Radicals / Components</Text>
          
          <View className="space-y-4">
            {/* Main components in a grid */}
            <View className="flex-row flex-wrap -mx-2">
              {profile.characterComponents
                .filter(comp => comp.type === 'radical' || comp.meaning.length < 15) // Show main components first
                .slice(0, 4)
                .map((comp, idx) => (
                <View key={idx} className="w-1/2 px-2 mb-4">
                  <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <View className="items-center">
                      <Text className="text-4xl font-light text-gray-900 mb-2">{comp.char}</Text>
                      <Text className="text-sm text-gray-600 font-medium mb-1">{comp.pinyin}</Text>
                      <Text className="text-sm text-gray-700 text-center">{comp.meaning}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Character evolution/transformation if available */}
            {word.hanzi.length > 1 && characterBreakdown && (
              <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center justify-center space-x-6">
                  <View className="items-center">
                    <Text className="text-3xl font-light text-gray-900 mb-1">种</Text>
                    <Text className="text-sm text-gray-600">plant</Text>
                  </View>
                  
                  <View className="items-center">
                    <Text className="text-2xl text-gray-400">→</Text>
                  </View>
                  
                  <View className="items-center">
                    <Text className="text-3xl font-light text-gray-900 mb-1">研</Text>
                    <Text className="text-sm text-gray-600">research</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Examples Section - placeholder matching design style */}
      <View>
        <Text className="text-2xl font-bold text-gray-900 mb-4">Examples</Text>
        
        {profile?.examples && profile.examples.length > 0 ? (
          <View className="space-y-4">
            {profile.examples.slice(0, 1).map((example, index) => (
              <View key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                {/* HSK Level Badge */}
                <View className="flex-row items-center mb-4">
                  <View className="bg-purple-100 px-3 py-1 rounded-full mr-3">
                    <Text className="text-purple-700 font-semibold text-sm">HSK 5</Text>
                  </View>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 font-medium text-sm">考</Text>
                  </View>
                </View>
                
                {/* Example sentence */}
                <Text className="text-lg font-medium text-gray-900 mb-2 leading-relaxed">
                  {example.hanzi}
                </Text>
                <Text className="text-base text-gray-600 mb-3 leading-relaxed">
                  {example.pinyin}
                </Text>
                <Text className="text-base text-gray-700 italic leading-relaxed">
                  {example.gloss}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <Text className="text-gray-500 text-center">
              Example sentences will appear here once generated.
            </Text>
          </View>
        )}
      </View>

      {/* Related words if available */}
      {characterBreakdown && characterBreakdown.some(char => char.relatedWords.length > 0) && (
        <View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">Found in your vocabulary</Text>
          <View className="flex-row flex-wrap">
            {characterBreakdown
              .flatMap(char => char.relatedWords)
              .slice(0, 6)
              .map((relWord, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  className="bg-white border border-gray-200 px-4 py-3 rounded-xl mr-3 mb-3 shadow-sm"
                >
                  <Text className="text-gray-900 font-medium text-center">{relWord.hanzi}</Text>
                  <Text className="text-gray-600 text-xs text-center mt-1">{relWord.meaning}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
} 