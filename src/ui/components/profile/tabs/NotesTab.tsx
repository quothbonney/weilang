import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Lightbulb, TrendingUp, RotateCcw, RefreshCw, Play } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useWordProfile } from "../WordProfileProvider";
import { useProfileStyles, useTheme } from "../../../theme";

export function NotesTab() {
  const router = useRouter();
  const { word, profile, refreshProfile, clearCache, isLoading } = useWordProfile();
  const styles = useProfileStyles();
  const { theme } = useTheme();

  const getMasteryPercentage = () => {
    return Math.min(Math.round((word.repetitions / 10) * 100), 100);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'new': return styles.difficultyColors.medium;
      case 'learning': return styles.difficultyColors.medium;
      case 'mature': return styles.difficultyColors.easy;
      default: return styles.difficultyColors.medium;
    }
  };

  const getNextReviewText = () => {
    if (word.due <= Date.now()) return 'Due now';
    const days = Math.ceil((word.due - Date.now()) / (1000 * 60 * 60 * 24));
    return `${days} day${days === 1 ? '' : 's'}`;
  };

  return (
    <View style={styles.tabContent}>
      {/* Memory Aids */}
      {profile?.memoryAids && (
        <View style={styles.exampleCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.layout.lg }}>
            <Lightbulb size={24} color={theme.colors.status.warning} />
            <Text style={[styles.tabSectionTitle, { marginBottom: 0, marginLeft: theme.layout.cardGap }]}>Memory Aids</Text>
          </View>
          
          <View style={{ backgroundColor: theme.colors.status.warningBackground, borderRadius: theme.borderRadius.lg, padding: theme.layout.lg }}>
            <Text style={[theme.typography.bodyLarge, { color: theme.colors.status.warning, lineHeight: 26 }]}>{profile.memoryAids}</Text>
          </View>
        </View>
      )}

      {/* Cultural Context */}
      {profile?.culturalNotes && (
        <View style={[styles.exampleCard, { marginTop: theme.layout.lg }]}>
          <Text style={styles.tabSectionTitle}>Cultural Context</Text>
          <View style={{ backgroundColor: theme.colors.status.successBackground, borderRadius: theme.borderRadius.lg, padding: theme.layout.lg }}>
            <Text style={[theme.typography.bodyLarge, { color: theme.colors.status.success, lineHeight: 26 }]}>{profile.culturalNotes}</Text>
          </View>
        </View>
      )}

      {/* Learning Progress */}
      <View style={[styles.exampleCard, { marginTop: theme.layout.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.layout.xl }}>
          <TrendingUp size={24} color={theme.colors.status.success} />
          <Text style={[styles.tabSectionTitle, { marginBottom: 0, marginLeft: theme.layout.cardGap }]}>Learning Progress</Text>
        </View>
        
        <View>
          {/* Mastery Level with improved styling */}
          <View style={{ marginBottom: theme.layout.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.layout.lg }}>
              <Text style={[theme.typography.bodyLarge, { fontWeight: theme.typography.label.fontWeight, color: theme.colors.text.primary }]}>Mastery Level</Text>
              <Text style={[theme.typography.h2, { color: theme.colors.text.primary }]}>{getMasteryPercentage()}%</Text>
            </View>
            <View style={{ backgroundColor: theme.colors.border.primary, height: 16, borderRadius: theme.borderRadius.full, overflow: 'hidden' }}>
              <View 
                style={{
                  backgroundColor: theme.colors.status.success,
                  height: '100%',
                  borderRadius: theme.borderRadius.full,
                  width: `${getMasteryPercentage()}%`
                }} 
              />
            </View>
          </View>
          
          {/* Status and Stats Grid */}
          <View style={{ backgroundColor: theme.colors.surface.secondary, borderRadius: theme.borderRadius.lg, padding: theme.layout.lg, marginBottom: theme.layout.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text.primary, marginBottom: theme.layout.xs }]}>{word.repetitions}</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.text.secondary, fontWeight: theme.typography.label.fontWeight }]}>Reviews</Text>
              </View>
              <View style={{ width: 1, height: 32, backgroundColor: theme.colors.border.primary }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text.primary, marginBottom: theme.layout.xs }]}>{Math.round(word.ease * 10) / 10}</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.text.secondary, fontWeight: theme.typography.label.fontWeight }]}>Ease</Text>
              </View>
              <View style={{ width: 1, height: 32, backgroundColor: theme.colors.border.primary }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text.primary, marginBottom: theme.layout.xs }]}>{word.interval}</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.text.secondary, fontWeight: theme.typography.label.fontWeight }]}>Interval</Text>
              </View>
            </View>
          </View>
          
          {/* Status and Next Review */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.layout.lg, borderTopWidth: 1, borderTopColor: theme.colors.border.subtle }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary, fontWeight: theme.typography.label.fontWeight, marginBottom: theme.layout.sm }]}>Status</Text>
              <View style={[styles.difficultyBadge, getStatusStyle(word.status)]}>
                <Text style={[styles.badgeText, { color: getStatusStyle(word.status).color, textTransform: 'capitalize' }]}>{word.status}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary, fontWeight: theme.typography.label.fontWeight, marginBottom: theme.layout.sm }]}>Next Review</Text>
              <Text style={[theme.typography.bodyLarge, { fontWeight: 'bold', color: theme.colors.text.primary }]}>{getNextReviewText()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons - improved styling */}
      <View style={{ marginTop: theme.layout.xl }}>
        <TouchableOpacity 
          style={[styles.practiceButton, { paddingVertical: theme.layout.lg, flexDirection: 'row' }]}
          onPress={() => router.push(`/review/${word.id}`)}
        >
          <Play size={22} color={theme.colors.text.inverse} />
          <Text style={[styles.practiceButtonText, { marginLeft: theme.layout.cardGap }]}>Practice</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: theme.layout.lg, marginTop: theme.layout.lg }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: theme.colors.chinese.accent,
              paddingVertical: theme.layout.cardGap,
              borderRadius: theme.borderRadius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              ...theme.shadows.sm,
            }}
            onPress={refreshProfile}
            disabled={isLoading}
          >
            <RefreshCw size={18} color={theme.colors.text.inverse} />
            <Text style={[theme.typography.label, { color: theme.colors.text.inverse, marginLeft: theme.layout.sm }]}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: theme.colors.status.error,
              paddingVertical: theme.layout.cardGap,
              borderRadius: theme.borderRadius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              ...theme.shadows.sm,
            }}
            onPress={clearCache}
            disabled={isLoading}
          >
            <RotateCcw size={18} color={theme.colors.text.inverse} />
            <Text style={[theme.typography.label, { color: theme.colors.text.inverse, marginLeft: theme.layout.sm }]}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty State for Memory Aids */}
      {!profile?.memoryAids && !profile?.culturalNotes && (
        <View style={[styles.emptyStateCard, { marginTop: theme.layout.lg }]}>
          <View style={{ alignItems: 'center' }}>
            <Lightbulb size={48} color={theme.colors.text.tertiary} />
            <Text style={[styles.emptyStateText, { marginTop: theme.layout.lg, fontSize: theme.typography.bodyLarge.fontSize }]}>
              Memory aids and cultural notes will appear here once the profile is generated.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 