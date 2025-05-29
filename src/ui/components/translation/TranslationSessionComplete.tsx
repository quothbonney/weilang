import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { translationStyles } from './translationStyles';

interface SessionStats {
  completedExercises: number;
  averageScore: number;
  timeSpent: number;
}

interface TranslationSessionCompleteProps {
  sessionStats: SessionStats | null;
  onStartNewSession: () => void;
  onBackToDashboard: () => void;
}

export function TranslationSessionComplete({
  sessionStats,
  onStartNewSession,
  onBackToDashboard,
}: TranslationSessionCompleteProps) {
  return (
    <ScrollView style={translationStyles.container} contentContainerStyle={translationStyles.scrollContent}>
      <View style={translationStyles.header}>
        <TouchableOpacity style={translationStyles.backButton} onPress={onBackToDashboard}>
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={translationStyles.title}>Session Complete!</Text>
      </View>

      <View style={translationStyles.completionCard}>
        <CheckCircle size={64} color="#10b981" />
        <Text style={translationStyles.completionTitle}>Great Work!</Text>
        <Text style={translationStyles.completionText}>
          You've completed your translation practice session.
        </Text>

        {sessionStats && (
          <View style={translationStyles.statsSection}>
            <Text style={translationStyles.statsTitle}>Session Summary</Text>
            <View style={translationStyles.statsGrid}>
              <View style={translationStyles.statItem}>
                <Text style={translationStyles.statValue}>{sessionStats.completedExercises}</Text>
                <Text style={translationStyles.statLabel}>Exercises</Text>
              </View>
              <View style={translationStyles.statItem}>
                <Text style={translationStyles.statValue}>{Math.round(sessionStats.averageScore)}%</Text>
                <Text style={translationStyles.statLabel}>Avg Score</Text>
              </View>
              <View style={translationStyles.statItem}>
                <Text style={translationStyles.statValue}>{Math.round(sessionStats.timeSpent / 60000)}m</Text>
                <Text style={translationStyles.statLabel}>Time</Text>
              </View>
            </View>
          </View>
        )}

        <View style={translationStyles.actionButtons}>
          <TouchableOpacity
            style={translationStyles.newSessionButton}
            onPress={onStartNewSession}
          >
            <Text style={translationStyles.newSessionButtonText}>Start New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={translationStyles.backToDashboardButton}
            onPress={onBackToDashboard}
          >
            <Text style={translationStyles.backToDashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 