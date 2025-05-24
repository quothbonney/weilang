import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface CompletionStateProps {
  onStartNewSession: () => void;
  onBackToDashboard: () => void;
}

export const CompletionState: React.FC<CompletionStateProps> = ({
  onStartNewSession,
  onBackToDashboard,
}) => {
  return (
    <View style={styles.container}>
      <CheckCircle size={64} color="#10b981" />
      <Text style={styles.congratsTitle}>Session Complete!</Text>
      <Text style={styles.congratsText}>
        Great work! You've finished this review session.
      </Text>
      
      <TouchableOpacity 
        style={styles.newSessionButton}
        onPress={onStartNewSession}
      >
        <Text style={styles.newSessionButtonText}>Start New Session</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackToDashboard}
      >
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  congratsText: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 32,
  },
  newSessionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  newSessionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 16,
  },
}); 