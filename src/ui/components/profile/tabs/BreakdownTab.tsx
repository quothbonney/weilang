import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useWordProfile } from "../WordProfileProvider";
import { useStore } from "../../../hooks/useStore";
import { useProfileStyles } from "../../../theme";

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
  const styles = useProfileStyles();

  // Debug logging
  console.log('🔍 BreakdownTab Debug:', {
    word: word.hanzi,
    wordPinyin: word.pinyin,
    hasProfile: !!profile,
    hasRadicalBreakdown: !!profile?.radicalBreakdown,
    hasCharacters: !!profile?.radicalBreakdown?.characters,
    charactersLength: profile?.radicalBreakdown?.characters?.length || 0,
    hasCharacterComponents: !!profile?.characterComponents,
    characterComponentsLength: profile?.characterComponents?.length || 0,
    characterComponents: profile?.characterComponents?.map(c => ({char: c.char, pinyin: c.pinyin, meaning: c.meaning, type: c.type})),
    profileKeys: profile ? Object.keys(profile) : []
  });

  // Analyze characters using the new radicalBreakdown data
  const analyzeCharacters = (): CharacterData[] => {
    const characters = word.hanzi.split('');
    return characters.map((char, index) => {
      const charComponent = profile?.characterComponents?.find(
        c => c.type === 'character' && c.position === index
      );
      
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
    <View style={styles.tabContent}>
      {/* Character Section - matching the concept art design */}
      <View style={styles.tabSection}>
        <Text style={styles.tabSectionTitle}>Character</Text>
        
        {/* Multi-character breakdown - like the concept art */}
        <View style={styles.characterRow}>
          {characterBreakdown?.map((charData, index) => (
            <View key={index} style={styles.characterCard}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.characterDisplay}>{charData.character}</Text>
                <Text style={styles.characterPinyin}>
                  {charData.pinyin}
                </Text>
                <Text style={styles.characterMeaning}>
                  {charData.meaning}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Examples Section - preserved from original */}
      <View style={styles.tabSection}>
        <Text style={styles.tabSectionTitle}>Examples</Text>
        
        {profile?.examples && profile.examples.length > 0 ? (
          <View>
            {profile.examples.slice(0, 1).map((example, index) => (
              <View key={index} style={styles.exampleCard}>
                {/* Removed HSK Level Badge and 考 tag */}
                
                {/* Example sentence */}
                <Text style={styles.exampleHanzi}>
                  {example.hanzi}
                </Text>
                <Text style={styles.examplePinyin}>
                  {example.pinyin}
                </Text>
                <Text style={styles.exampleTranslation}>
                  {example.gloss}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>
              Example sentences will appear here once generated.
            </Text>
          </View>
        )}
      </View>

      {/* Related words - enhanced with radical connections */}
      {characterBreakdown && characterBreakdown.some(char => char.relatedWords.length > 0) && (
        <View style={styles.tabSection}>
          <Text style={styles.tabSectionTitle}>Found in your vocabulary</Text>
          <View style={styles.relatedWordContainer}>
            {characterBreakdown
              .flatMap(char => char.relatedWords)
              .slice(0, 6)
              .map((relWord, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.relatedWordChip}
                >
                  <Text style={styles.relatedWordHanzi}>{relWord.hanzi}</Text>
                  <Text style={styles.relatedWordMeaning}>{relWord.meaning}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
} 