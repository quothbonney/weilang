import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FileText, Volume2 } from "lucide-react-native";
import { useWordProfile } from "../WordProfileProvider";
import { speakWithAzure } from "../../../../infra/tts/azureTts";
import * as Speech from "expo-speech";
import { useProfileStyles, useTheme } from "../../../theme";

export function ExamplesTab() {
  const { profile, word } = useWordProfile();
  const styles = useProfileStyles();
  const { theme } = useTheme();

  const speakExample = async (text: string) => {
    const success = await speakWithAzure(text);
    if (!success) {
      Speech.speak(text, { language: 'zh-CN' });
    }
  };

  return (
    <View style={styles.tabContent}>
      {/* Example Sentences Section */}
      {profile?.examples && profile.examples.length > 0 ? (
        <View>
          {profile.examples.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleCard}
              onPress={() => speakExample(example.hanzi)}
              activeOpacity={0.7}
            >
              {/* HSK Level and Tags */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.layout.lg }}>
                <View style={[styles.difficultyBadge, { backgroundColor: theme.colors.chinese.accent + '20', marginRight: theme.layout.cardGap }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.chinese.accent }]}>HSK 5</Text>
                </View>
                <View style={[styles.frequencyBadge]}>
                  <Text style={styles.frequencyText}>考</Text>
                </View>
              </View>
              
              {/* Example sentence content */}
              <View style={{ marginBottom: theme.layout.lg }}>
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

              {/* Audio button */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity 
                  style={[styles.speakerButton, { backgroundColor: theme.colors.chinese.accent + '10' }]}
                  onPress={() => speakExample(example.hanzi)}
                >
                  <Volume2 size={20} color={theme.colors.chinese.accent} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* Placeholder matching the design */
        <View style={styles.exampleCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.layout.lg }}>
            <View style={[styles.difficultyBadge, { backgroundColor: theme.colors.chinese.accent + '20', marginRight: theme.layout.cardGap }]}>
              <Text style={[styles.badgeText, { color: theme.colors.chinese.accent }]}>HSK 5</Text>
            </View>
            <View style={[styles.frequencyBadge]}>
              <Text style={styles.frequencyText}>考</Text>
            </View>
          </View>
          
          <Text style={styles.exampleHanzi}>
            他是该大学的优秀科研人员。
          </Text>
          <Text style={styles.examplePinyin}>
            Tā shì gāi dàxué de yōuxiù kēyán rényuán.
          </Text>
          <Text style={styles.exampleTranslation}>
            He is an outstanding scientific researcher of the university.
          </Text>
        </View>
      )}

      {/* Usage Notes */}
      {profile?.usage && (
        <View style={[styles.exampleCard, { marginTop: theme.layout.xl }]}>
          <Text style={styles.tabSectionTitle}>Usage Notes</Text>
          <View style={{ backgroundColor: theme.colors.status.warningBackground, borderRadius: theme.borderRadius.lg, padding: theme.layout.lg }}>
            <Text style={[theme.typography.bodyLarge, { color: theme.colors.status.warning, lineHeight: 26 }]}>{profile.usage}</Text>
          </View>
        </View>
      )}

      {/* Cultural Context */}
      {profile?.culturalNotes && (
        <View style={[styles.exampleCard, { marginTop: theme.layout.xl }]}>
          <Text style={styles.tabSectionTitle}>Cultural Context</Text>
          <View style={{ backgroundColor: theme.colors.status.successBackground, borderRadius: theme.borderRadius.lg, padding: theme.layout.lg }}>
            <Text style={[theme.typography.bodyLarge, { color: theme.colors.status.success, lineHeight: 26 }]}>{profile.culturalNotes}</Text>
          </View>
        </View>
      )}

      {/* Empty state if no examples or notes */}
      {!profile?.examples?.length && !profile?.usage && !profile?.culturalNotes && (
        <View style={styles.emptyStateCard}>
          <View style={{ alignItems: 'center' }}>
            <FileText size={48} color={theme.colors.text.tertiary} />
            <Text style={[styles.emptyStateText, { marginTop: theme.layout.lg, fontSize: theme.typography.bodyLarge.fontSize }]}>
              Examples and usage notes will appear here once the profile is generated.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 