import React, { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";

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

    return (    <View style={styles.container}>      <TouchableOpacity         style={styles.settingsButton}        onPress={() => router.push('/settings')}      >        <Text style={styles.settingsButtonText}>⚙️</Text>      </TouchableOpacity>      {words.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading your deck...</Text>
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.wordCard}
              onPress={() => handleWordPress(item.id)}
            >
              <Text style={styles.hanzi}>{item.hanzi}</Text>
              <Text style={styles.pinyin}>{item.pinyin}</Text>
              <Text style={styles.meaning}>{item.meaning}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>
            </TouchableOpacity>
          )}
        />
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
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hanzi: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pinyin: {
    color: '#6b7280',
  },
  meaning: {
    color: '#9ca3af',
  },
    status: {    color: '#6b7280',    fontSize: 12,    marginTop: 4,  },  settingsButton: {    position: 'absolute',    top: 16,    right: 16,    zIndex: 10,    padding: 8,  },  settingsButtonText: {    fontSize: 24,  },}); 