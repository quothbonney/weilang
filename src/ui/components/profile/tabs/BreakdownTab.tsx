import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useWordProfile } from "../WordProfileProvider";
import { useStore } from "../../../hooks/useStore";

interface CharacterData {
  character: string;
  meaning: string;
  pinyin: string;
  strokes: number;
  radical?: {
    character: string;
    meaning: string;
    pinyin: string;
    strokes: number;
    position: string;
  };
  components: string[];
  relatedWords: Array<{ hanzi: string; meaning: string; id: string }>;
}

export function BreakdownTab() {
  const { word, profile } = useWordProfile();
  const { words } = useStore();

  // Debug logging
  console.log('🔍 BreakdownTab Debug:', {
    word: word.hanzi,
    hasProfile: !!profile,
    hasRadicalBreakdown: !!profile?.radicalBreakdown,
    hasCharacters: !!profile?.radicalBreakdown?.characters,
    charactersLength: profile?.radicalBreakdown?.characters?.length || 0,
    hasCharacterComponents: !!profile?.characterComponents,
    characterComponentsLength: profile?.characterComponents?.length || 0,
    profileKeys: profile ? Object.keys(profile) : []
  });

  // Analyze characters using the new radicalBreakdown data
  const analyzeCharacters = (): CharacterData[] => {
    // Fallback to old method only, ignore radicalBreakdown
    return word.hanzi.split('').map((char) => {
      const charComponent = profile?.characterComponents?.find(c => c.char === char);
      const relatedWords = words
        .filter(w => w.hanzi.includes(char) && w.id !== word.id)
        .slice(0, 6)
        .map(w => ({ hanzi: w.hanzi, meaning: w.meaning, id: w.id }));

      return {
        character: char,
        meaning: charComponent?.meaning || 'Loading...',
        pinyin: charComponent?.pinyin || 'Loading...',
        strokes: charComponent?.strokes || 8,
        components: [],
        relatedWords,
      };
    });
  };

  const characterBreakdown = analyzeCharacters();

  // Hide radicals/components section
  // const radicalsAndComponents = getAllRadicalsAndComponents();

  return (
    <View className="p-4 space-y-6">
      {/* Character Section - matching the concept art design */}
      <View>
        <Text className="text-2xl font-bold text-gray-900 mb-4">Character</Text>
        
        {/* Multi-character breakdown - like the concept art */}
        <View className="flex-row space-x-4">
          {characterBreakdown?.map((charData, index) => (
            <View key={index} className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="items-center">
                <Text className="text-6xl font-light text-gray-900 mb-3">{charData.character}</Text>
                <Text className="text-lg font-medium text-gray-600 mb-1">
                  {word.hanzi.split('')[index] === charData.character ? 
                    word.pinyin.split(' ')[index] || charData.pinyin : charData.pinyin}
                </Text>
                <Text className="text-base text-gray-700 text-center">
                  {index === 0 ? word.meaning.split(',')[0] || word.meaning : charData.meaning}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Examples Section - preserved from original */}
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

      {/* Related words - enhanced with radical connections */}
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