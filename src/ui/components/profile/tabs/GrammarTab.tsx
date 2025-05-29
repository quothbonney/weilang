import React from "react";
import { View, Text } from "react-native";
import { Book } from "lucide-react-native";
import { useWordProfile } from "../WordProfileProvider";
import { useProfileStyles, useTheme } from "../../../theme";

export function GrammarTab() {
  const { profile } = useWordProfile();
  const styles = useProfileStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.tabContent}>
      {/* Dictionary Information */}
      {profile?.dictionary && (
        <View style={styles.exampleCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.layout.xl }}>
            <Book size={24} color={theme.colors.text.secondary} />
            <Text style={[styles.tabSectionTitle, { marginBottom: 0, marginLeft: theme.layout.cardGap }]}>
              Dictionary ({profile.dictionary.source})
            </Text>
          </View>
          
          {profile.dictionary.definitions.length > 0 && (
            <View style={{ marginBottom: theme.layout.xl }}>
              <Text style={[theme.typography.bodyLarge, { fontWeight: theme.typography.label.fontWeight, color: theme.colors.text.primary, marginBottom: theme.layout.lg }]}>
                Definitions
              </Text>
              <View>
                {profile.dictionary.definitions.map((def, idx) => (
                  <Text key={idx} style={[theme.typography.bodyLarge, { color: theme.colors.text.secondary, lineHeight: 26, marginBottom: theme.layout.sm }]}>
                    • {def}
                  </Text>
                ))}
              </View>
            </View>
          )}
          
          {profile.dictionary.synonyms.length > 0 && (
            <View style={{ marginBottom: theme.layout.xl }}>
              <Text style={[theme.typography.bodyLarge, { fontWeight: theme.typography.label.fontWeight, color: theme.colors.text.primary, marginBottom: theme.layout.lg }]}>
                Synonyms
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {profile.dictionary.synonyms.map((syn, idx) => (
                  <View key={idx} style={[styles.frequencyBadge, { marginRight: theme.layout.sm, marginBottom: theme.layout.sm }]}>
                    <Text style={styles.frequencyText}>{syn}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {profile.dictionary.antonyms.length > 0 && (
            <View>
              <Text style={[theme.typography.bodyLarge, { fontWeight: theme.typography.label.fontWeight, color: theme.colors.text.primary, marginBottom: theme.layout.lg }]}>
                Antonyms
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {profile.dictionary.antonyms.map((ant, idx) => (
                  <View key={idx} style={[styles.difficultyBadge, styles.difficultyColors.hard, { marginRight: theme.layout.sm, marginBottom: theme.layout.sm }]}>
                    <Text style={[styles.badgeText, { color: styles.difficultyColors.hard.color }]}>{ant}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Part of Speech */}
      {profile?.partOfSpeech && (
        <View style={[styles.exampleCard, { marginTop: theme.layout.lg }]}>
          <Text style={styles.tabSectionTitle}>Part of Speech</Text>
          <View style={[styles.difficultyBadge, styles.difficultyColors.easy, { alignSelf: 'flex-start' }]}>
            <Text style={[theme.typography.bodyLarge, { fontWeight: theme.typography.label.fontWeight, color: styles.difficultyColors.easy.color }]}>
              {profile.partOfSpeech}
            </Text>
          </View>
        </View>
      )}

      {/* Frequency Information */}
      {profile?.frequency && (
        <View style={[styles.exampleCard, { marginTop: theme.layout.lg }]}>
          <Text style={styles.tabSectionTitle}>Frequency</Text>
          <View style={{ backgroundColor: theme.colors.status.infoBackground, borderWidth: 1, borderColor: theme.colors.status.infoBorder, borderRadius: theme.borderRadius.lg, padding: theme.layout.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[theme.typography.bodyLarge, { color: theme.colors.status.info, fontWeight: theme.typography.label.fontWeight }]}>
                Usage Frequency
              </Text>
              <Text style={[theme.typography.h3, { color: theme.colors.status.info }]}>
                {profile.frequency}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Difficulty Level */}
      {profile?.difficulty && (
        <View style={[styles.exampleCard, { marginTop: theme.layout.lg }]}>
          <Text style={styles.tabSectionTitle}>Difficulty Level</Text>
          <View style={[
            styles.difficultyBadge, 
            profile.difficulty.toLowerCase() === 'easy' ? styles.difficultyColors.easy :
            profile.difficulty.toLowerCase() === 'intermediate' || profile.difficulty.toLowerCase() === 'medium' ? styles.difficultyColors.medium :
            styles.difficultyColors.hard,
            { alignSelf: 'flex-start', paddingHorizontal: theme.layout.lg, paddingVertical: theme.layout.cardGap }
          ]}>
            <Text style={[
              theme.typography.bodyLarge,
              { 
                fontWeight: theme.typography.label.fontWeight,
                color: profile.difficulty.toLowerCase() === 'easy' ? styles.difficultyColors.easy.color :
                       profile.difficulty.toLowerCase() === 'intermediate' || profile.difficulty.toLowerCase() === 'medium' ? styles.difficultyColors.medium.color :
                       styles.difficultyColors.hard.color
              }
            ]}>
              {profile.difficulty}
            </Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!profile?.dictionary && !profile?.partOfSpeech && !profile?.frequency && !profile?.difficulty && (
        <View style={styles.emptyStateCard}>
          <View style={{ alignItems: 'center' }}>
            <Book size={48} color={theme.colors.text.tertiary} />
            <Text style={[styles.emptyStateText, { marginTop: theme.layout.lg, fontSize: theme.typography.bodyLarge.fontSize }]}>
              Grammar and dictionary information will appear here once the profile is generated.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 