import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Volume2, Heart, Share, Info, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useWordProfile } from "./WordProfileProvider";
import { useStore } from "../../hooks/useStore";
import { speakWithAzure } from "../../../infra/tts/azureTts";
import * as Speech from "expo-speech";
import { useProfileStyles, useTheme } from "../../theme";

interface WordProfileHeaderProps {
  isCollapsed?: boolean;
}

export function WordProfileHeader({ isCollapsed = false }: WordProfileHeaderProps) {
  const router = useRouter();
  const { word, profile, isLoading, error } = useWordProfile();
  const { apiKey } = useStore();
  const styles = useProfileStyles();
  const { theme } = useTheme();

  const speakWord = async () => {
    if (word) {
      const success = await speakWithAzure(word.hanzi);
      if (!success) {
        Speech.speak(word.hanzi, { language: 'zh-CN' });
      }
    }
  };

  const getDifficultyStyle = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return styles.difficultyColors.easy;
      case 'intermediate': 
      case 'medium': return styles.difficultyColors.medium;
      case 'hard': return styles.difficultyColors.hard;
      default: return styles.difficultyColors.medium;
    }
  };

  // Collapsed header - compact bar at top
  if (isCollapsed) {
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerHanzi}>{word.hanzi}</Text>
          <Text style={styles.headerPinyin}>{word.pinyin}</Text>
        </View>
        <TouchableOpacity 
          style={styles.speakerButton}
          onPress={speakWord}
        >
          <Volume2 size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    );
  }

  if (!apiKey) {
    return (
      <View style={styles.profileContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.layout.xl }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={theme.typography.h5}>Word Profile</Text>
        </View>
        
        <View style={styles.warningBanner}>
          <View style={styles.warningContent}>
            <Info size={20} color={theme.colors.status.warning} />
            <Text style={styles.warningTitle}>API Key Required</Text>
          </View>
          <Text style={styles.warningText}>
            Configure your API keys in settings to generate comprehensive word profiles.
          </Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Expanded header - tighter version
  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h5, { color: theme.colors.text.primary }]}>Word Profile</Text>
        <View style={{ flexDirection: 'row', gap: theme.layout.xs }}>
          <TouchableOpacity style={styles.iconButton}>
            <Heart size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Share size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Word Display - Tighter spacing */}
      <View style={styles.profileContainer}>
        {/* Character Display - smaller than before */}
        <Text style={styles.profileHanzi}>
          {word.hanzi}
        </Text>
        
        {/* Pinyin with audio */}
        <View style={styles.profilePinyinRow}>
          <Text style={styles.profilePinyin}>
            {word.pinyin}
          </Text>
          <TouchableOpacity 
            style={styles.speakerButton}
            onPress={speakWord}
          >
            <Volume2 size={18} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        {/* Meaning */}
        <Text style={styles.profileMeaning}>
          {word.meaning}
        </Text>

        {/* Large Practice Button */}
        <TouchableOpacity 
          style={styles.practiceButton}
          onPress={() => router.push(`/review/${word.id}`)}
        >
          <Text style={styles.practiceButtonText}>Practice</Text>
        </TouchableOpacity>

        {/* Status badges - smaller and more compact */}
        <View style={styles.badgeContainer}>
          {profile?.difficulty && (
            <View style={[styles.difficultyBadge, getDifficultyStyle(profile.difficulty)]}>
              <Text style={[styles.badgeText, { color: getDifficultyStyle(profile.difficulty).color }]}>
                {profile.difficulty}
              </Text>
            </View>
          )}
          {profile?.frequency && (
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>
                {profile.frequency}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={[styles.warningBanner, { backgroundColor: theme.colors.status.infoBackground, borderColor: theme.colors.status.infoBorder }]}>
          <View style={styles.warningContent}>
            <ActivityIndicator size="small" color={theme.colors.status.info} />
            <Text style={[styles.warningTitle, { color: theme.colors.status.info }]}>
              Generating profile...
            </Text>
          </View>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
} 