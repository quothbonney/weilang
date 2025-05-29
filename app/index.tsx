import React, { useEffect, useState } from "react";
import { View, ScrollView, Platform, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";
import { BookOpen, Brain, BarChart3, Settings, Calendar, Trophy, Target, Languages } from "lucide-react-native";
import { useThemedStyles, useTheme } from "../src/ui/theme";
import { Text, Button, Card, Screen } from "../src/ui/components/themed";

export default function DashboardScreen() {
  const router = useRouter();
  const { words, dueWords, loadWords, loadDueWords, initializeSettings, currentSession } = useStore();
  const { theme } = useTheme();
  
  // Calculate real stats from actual data
  const [stats, setStats] = useState({
    totalWords: 0,
    dueToday: 0,
    studiedToday: 0,
    currentStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0], // Last 7 days
    accuracy: 0,
  });

  const styles = useThemedStyles((theme, helpers) => ({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.layout.lg,
    },
    header: {
      paddingTop: theme.dimensions.headerHeight,
      paddingHorizontal: theme.layout.screenPaddingLarge,
      paddingBottom: theme.layout.xl,
      backgroundColor: theme.colors.background.primary,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 52,
      height: 52,
      marginRight: theme.layout.md,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    section: {
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.layout.sectionGap,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
    },
    navigationGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.layout.cardGap,
      marginBottom: theme.layout.cardGap,
    },
    navigationCard: {
      flex: 1,
      padding: theme.layout.lg,
      borderRadius: theme.borderRadius.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      marginHorizontal: 2,
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.layout.cardGap,
    },
    cardTitle: {
      ...theme.typography.label,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.xs,
      textAlign: 'center',
    },
    cardSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    statsGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: theme.layout.cardGap,
    },
    statCard: {
      flex: 1,
      minWidth: 150,
      backgroundColor: theme.colors.surface.secondary,
      padding: theme.layout.lg,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    statHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.layout.cardGap,
    },
    statTitle: {
      ...theme.typography.label,
      color: theme.colors.text.secondary,
      marginLeft: theme.layout.sm,
    },
    statValue: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.xs,
    },
    statSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.text.tertiary,
    },
    chartCard: {
      ...helpers.cardElevated,
    },
    chartTitle: {
      ...theme.typography.h5,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.md,
    },
    chartContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-end' as const,
      height: 60,
      marginBottom: theme.layout.sm,
      overflow: 'hidden' as const,
    },
    barContainer: {
      alignItems: 'center' as const,
      flex: 1,
    },
    bar: {
      width: 24,
      backgroundColor: theme.colors.interactive.primary,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.layout.sm,
      maxHeight: 60,
    },
    barLabel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
    },
    chartSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.text.tertiary,
      textAlign: 'center' as const,
    },
    accuracyCard: {
      ...helpers.cardElevated,
    },
    accuracyHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.layout.md,
    },
    accuracyTitle: {
      ...theme.typography.h5,
      color: theme.colors.text.primary,
      marginLeft: theme.layout.sm,
    },
    accuracyBarContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.layout.sm,
    },
    accuracyBarBackground: {
      flex: 1,
      height: 12,
      backgroundColor: theme.colors.border.primary,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden' as const,
      marginRight: theme.layout.cardGap,
    },
    accuracyBarFill: {
      height: '100%',
      backgroundColor: theme.colors.status.success,
      borderRadius: theme.borderRadius.sm,
    },
    accuracyValue: {
      ...theme.typography.body,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
      minWidth: 48,
    },
    accuracySubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    },
    footer: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingVertical: theme.layout.md,
      alignItems: 'center' as const,
    },
    footerSettingsButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: theme.layout.cardGap,
      paddingHorizontal: theme.layout.lg,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    footerSettingsButtonText: {
      ...theme.typography.body,
      marginLeft: theme.layout.sm,
      color: theme.colors.text.secondary,
    },
  }));

  useEffect(() => {
    initializeSettings();
    loadWords();
    loadDueWords();
  }, []);

  useEffect(() => {
    // Calculate real statistics
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Calculate studied today (words with updatedAt today)
    const studiedToday = words.filter(w => 
      w.updatedAt && w.updatedAt >= today
    ).length;
    
    // Calculate current streak (consecutive days with reviews)
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayStart = today - (i * oneDay);
      const dayEnd = dayStart + oneDay;
      const hasReviews = words.some(w => 
        w.updatedAt && w.updatedAt >= dayStart && w.updatedAt < dayEnd
      );
      if (hasReviews) {
        currentStreak++;
      } else if (i > 0) { // Don't break on today if no reviews yet
        break;
      }
    }
    
    // Calculate weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = today - (i * oneDay);
      const dayEnd = dayStart + oneDay;
      const dayCount = words.filter(w => 
        w.updatedAt && w.updatedAt >= dayStart && w.updatedAt < dayEnd
      ).length;
      weeklyProgress.push(dayCount);
    }
    
    // Calculate accuracy (successful reviews vs total reviews)
    const reviewedWords = words.filter(w => w.repetitions > 0);
    const totalReviews = reviewedWords.reduce((sum, w) => sum + w.repetitions, 0);
    const successfulWords = reviewedWords.filter(w => w.ease >= 2.5).length;
    const accuracy = totalReviews > 0 ? Math.round((successfulWords / reviewedWords.length) * 100) : 0;
    
    setStats({
      totalWords: words.length,
      dueToday: dueWords.length,
      studiedToday,
      currentStreak,
      weeklyProgress,
      accuracy,
    });
  }, [words, dueWords]);

  const navigationCards = [
    {
      id: 'translation',
      title: 'Translation',
      subtitle: 'Practice sentences',
      icon: Languages,
      color: theme.colors.chinese.accent,
      backgroundColor: theme.colors.surface.secondary,
      onPress: () => router.push('/translation'),
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      subtitle: `${dueWords.length} cards due`,
      icon: Brain,
      color: theme.colors.status.error,
      backgroundColor: theme.colors.status.errorBackground,
      onPress: () => router.push('/flashcards'),
    },
    {
      id: 'deck',
      title: 'My Words',
      subtitle: `${words.length} words total`,
      icon: BookOpen,
      color: theme.colors.interactive.primary,
      backgroundColor: theme.colors.status.infoBackground,
      onPress: () => router.push('/deck'),
    },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon size={theme.dimensions.iconSize.md} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const WeeklyChart = () => {
    const maxValue = Math.max(...stats.weeklyProgress, 1);
    const chartHeight = 60;
    
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Progress</Text>
        <View style={styles.chartContainer}>
          {stats.weeklyProgress.map((value, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height: Math.max((value / maxValue) * chartHeight, 2) }]} />
              <Text style={styles.barLabel}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.chartSubtitle}>Cards reviewed per day</Text>
      </View>
    );
  };

  return (
    <Screen scrollable safeArea={false}>
      <ScrollView 
        style={{ backgroundColor: theme.colors.background.primary }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={require('../assets/logo-transparent.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Welcome Jack! Ready to learn some Chinese?</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.navigationGrid}>
            {navigationCards.map((card) => {
              return (
                <TouchableOpacity
                  key={card.id}
                  style={[styles.navigationCard, { backgroundColor: card.backgroundColor }]}
                  onPress={card.onPress}
                >
                  <View style={[styles.cardIcon, { backgroundColor: card.color }]}> 
                    {card.icon && <card.icon size={28} color={theme.colors.text.inverse} />}
                  </View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Today's Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Words"
              value={stats.totalWords}
              icon={BookOpen}
              color={theme.colors.interactive.primary}
            />
            <StatCard
              title="Due Today"
              value={stats.dueToday}
              icon={Calendar}
              color={theme.colors.status.error}
            />
            <StatCard
              title="Studied Today"
              value={stats.studiedToday}
              subtitle="cards completed"
              icon={Target}
              color={theme.colors.status.success}
            />
            <StatCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              subtitle="keep it up!"
              icon={Trophy}
              color={theme.colors.chinese.accent}
            />
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.section}>
          <WeeklyChart />
        </View>

        {/* Accuracy Progress */}
        <View style={styles.section}>
          <View style={styles.accuracyCard}>
            <View style={styles.accuracyHeader}>
              <BarChart3 size={theme.dimensions.iconSize.lg} color={theme.colors.interactive.primary} />
              <Text style={styles.accuracyTitle}>Overall Accuracy</Text>
            </View>
            <View style={styles.accuracyBarContainer}>
              <View style={styles.accuracyBarBackground}>
                <View style={[styles.accuracyBarFill, { width: `${stats.accuracy}%` }]} />
              </View>
              <Text style={styles.accuracyValue}>{stats.accuracy}%</Text>
            </View>
            <Text style={styles.accuracySubtitle}>
              You're getting {stats.accuracy}% of your reviews correct!
            </Text>
          </View>
        </View>

        {/* Footer Settings Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerSettingsButton}
            onPress={() => router.push('/settings')}
          >
            <Settings size={theme.dimensions.iconSize.lg} color={theme.colors.text.secondary} />
            <Text style={styles.footerSettingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
} 