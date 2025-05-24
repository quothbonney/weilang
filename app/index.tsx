import React, { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";

export default function DeckScreen() {
  const { words, isLoading, error, loadWords } = useStore();

  useEffect(() => {
    loadWords();
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

  return (
    <View style={styles.container}>
      {words.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No words in your deck yet</Text>
          <Link href="/add" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.buttonText}>Add First Word</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.wordCard}>
              <Text style={styles.hanzi}>{item.hanzi}</Text>
              <Text style={styles.pinyin}>{item.pinyin}</Text>
              <Text style={styles.meaning}>{item.meaning}</Text>
            </View>
          )}
        />
      )}
      
      {words.length > 0 && (
        <Link href="/add" asChild>
          <TouchableOpacity style={styles.fab}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </Link>
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
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3b82f6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
  },
}); 