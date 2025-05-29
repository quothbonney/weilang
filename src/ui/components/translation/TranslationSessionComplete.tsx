import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { useTranslationStyles, useTheme } from '../../theme';

interface TranslationSessionCompleteProps {
  sessionStats: {
    totalExercises: number;
    completedExercises: number;
    averageScore: number;
  };
  onStartNewSession: () => void;
  onBackToDashboard: () => void;
}

export function TranslationSessionComplete({
  sessionStats,
  onStartNewSession,
  onBackToDashboard,
}: TranslationSessionCompleteProps) {
  const styles = useTranslationStyles();
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.completionCard}>
        <Trophy size={48} color={theme.colors.status.success} />
        <Text style={styles.completionTitle}>Session Complete!</Text>
        <Text style={styles.completionText}>
          Great work on completing your translation practice session.
        </Text>

        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Session Summary</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessionStats.completedExercises}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessionStats.averageScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessionStats.totalExercises}</Text>
              <Text style={styles.statLabel}>Total Exercises</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.newSessionButton}
            onPress={onStartNewSession}
          >
            <Text style={styles.newSessionButtonText}>Start New Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backToDashboardButton}
            onPress={onBackToDashboard}
          >
            <Text style={styles.backToDashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 