import React, { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";
import { Settings } from "lucide-react-native";

export default function DeckScreen() {
  const { words, isLoading, error, loadWords, seedDatabase } = useStore();
  const router = useRouter();

  useEffect(() => {
    // Seed database with sample words on first load
    seedDatabase().then(() => {
      loadWords();
    });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleWordPress = (wordId: string) => {
    router.push(`/profile/${wordId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Words</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {words.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading your deck...</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>
              {words.length} words • {words.filter(w => w.status === 'new').length} new • {words.filter(w => w.status === 'learning').length} learning
            </Text>
          </View>
          
          <FlatList
            data={words}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.wordCard}
                onPress={() => handleWordPress(item.id)}
              >
                <View style={styles.wordContent}>
                  <Text style={styles.hanzi}>{item.hanzi}</Text>
                  <View style={styles.wordDetails}>
                    <Text style={styles.pinyin}>{item.pinyin}</Text>
                    <Text style={styles.meaning}>{item.meaning}</Text>
                  </View>
                </View>
                <View style={styles.wordMeta}>
                  <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                  <Text style={styles.intervalText}>
                    {item.interval}d
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  settingsButton: {
    padding: 8,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 18,
    marginBottom: 16,
  },
  wordCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  wordContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hanzi: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 16,
    color: '#1f2937',
  },
  wordDetails: {
    flex: 1,
  },
  pinyin: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  meaning: {
    fontSize: 14,
    color: '#9ca3af',
  },
  wordMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusnew: {
    backgroundColor: '#dbeafe',
  },
  statuslearning: {
    backgroundColor: '#fef3c7',
  },
  statusreview: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  intervalText: {
    fontSize: 12,
    color: '#9ca3af',
  },
}); 