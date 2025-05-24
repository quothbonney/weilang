import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";
import { BookOpen, Brain, BarChart3, Settings, Calendar, Trophy, Target } from "lucide-react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const { words, dueWords, loadWords, loadDueWords, initializeSettings } = useStore();
  
  // Mock data for stats - in real app this would come from the store
  const [stats, setStats] = useState({
    totalWords: 0,
    dueToday: 0,
    studiedToday: 12,
    currentStreak: 7,
    weeklyProgress: [5, 8, 12, 15, 10, 7, 12], // Last 7 days
    accuracy: 85,
  });

  useEffect(() => {
    initializeSettings();
    loadWords();
    loadDueWords();
  }, []);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalWords: words.length,
      dueToday: dueWords.length,
    }));
  }, [words.length, dueWords.length]);

  const navigationCards = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      subtitle: `${dueWords.length} cards due`,
      icon: Brain,
      color: '#3b82f6',
      onPress: () => router.push('/flashcards'),
    },
    {
      id: 'deck',
      title: 'My Words',
      subtitle: `${words.length} words total`,
      icon: BookOpen,
      color: '#10b981',
      onPress: () => router.push('/deck'),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure app preferences',
      icon: Settings,
      color: '#6b7280',
      onPress: () => router.push('/settings'),
    },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={styles.statHeader}>
        <Icon size={24} color={color} />
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WeiLang Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back! Ready to learn some Chinese?</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.navigationGrid}>
          {navigationCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.navigationCard}
              onPress={card.onPress}
            >
              <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
                <card.icon size={28} color="white" />
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
            subtitle="in your deck"
            icon={BookOpen}
            color="#3b82f6"
          />
          <StatCard
            title="Due Today"
            value={stats.dueToday}
            subtitle="cards to review"
            icon={Calendar}
            color="#f59e0b"
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
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  navigationCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
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