import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Image } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";
import { BookOpen, Brain, BarChart3, Settings, Calendar, Trophy, Target } from "lucide-react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const { words, dueWords, loadWords, loadDueWords, initializeSettings, currentSession } = useStore();
  
  // Calculate real stats from actual data
  const [stats, setStats] = useState({
    totalWords: 0,
    dueToday: 0,
    studiedToday: 0,
    currentStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0], // Last 7 days
    accuracy: 0,
  });

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
      id: 'flashcards',
      title: 'Flashcards',
      subtitle: `${dueWords.length} cards due`,
      icon: Brain,
      color: '#ef4444',
      backgroundColor: '#fef2f2',
      onPress: () => router.push('/flashcards'),
    },
    {
      id: 'deck',
      title: 'My Words',
      subtitle: `${words.length} words total`,
      icon: BookOpen,
      color: '#3b82f6',
      backgroundColor: '#eff6ff',
      onPress: () => router.push('/deck'),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure preferences',
      icon: Settings,
      color: '#f59e0b',
      backgroundColor: '#fffbeb',
      onPress: () => router.push('/settings'),
    },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const WeeklyChart = () => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Weekly Progress</Text>
      <View style={styles.chartContainer}>
        {stats.weeklyProgress.map((value, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={[styles.bar, { height: (value / 20) * 100 }]} />
            <Text style={styles.barLabel}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.chartSubtitle}>Cards reviewed per day</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
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
          {navigationCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.navigationCard, { backgroundColor: card.backgroundColor }]}
              onPress={card.onPress}
            >
              <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
                <card.icon size={24} color="white" />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
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
            color="#3b82f6"
          />
          <StatCard
            title="Due Today"
            value={stats.dueToday}
            icon={Calendar}
            color="#ef4444"
          />
          <StatCard
            title="Studied Today"
            value={stats.studiedToday}
            subtitle="cards completed"
            icon={Target}
            color="#10b981"
          />
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            subtitle="keep it up!"
            icon={Trophy}
            color="#8b5cf6"
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
            <BarChart3 size={24} color="#3b82f6" />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 52,
    height: 52,
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 36,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Roboto',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Roboto',
  },
  navigationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navigationCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Roboto',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Roboto',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Roboto',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Roboto',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Roboto',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  accuracyCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accuracyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  accuracyBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accuracyBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  accuracyBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 48,
  },
  accuracySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
}); 