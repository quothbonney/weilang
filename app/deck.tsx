import React, { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";
import { Settings, Heart } from "lucide-react-native";
import { useDeckStyles, useTheme } from "../src/ui/theme";

export default function DeckScreen() {
  const { words, isLoading, error, loadWords, importWords } = useStore();
  const router = useRouter();
  const styles = useDeckStyles();
  const { theme } = useTheme();

  useEffect(() => {
    // Import words from CSV data on first load
    importWords().then(() => {
      loadWords();
    });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
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
    router.push(`/profile/${wordId}` as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Words</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color={theme.colors.text.secondary} />
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
            showsVerticalScrollIndicator={false}
            bounces={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: theme.layout.lg }}
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
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: theme.layout.xs
                  }}>
                    {item.isFavorite && (
                      <View style={[
                        styles.favoriteBadge, 
                        { 
                          marginBottom: 0,
                          marginRight: theme.layout.xs
                        }
                      ]}>
                        <Text style={styles.favoriteText}>Favorite</Text>
                      </View>
                    )}
                    <View style={[
                      styles.statusBadge,
                      styles.statusColors[item.status as 'new' | 'learning' | 'review'],
                      { marginBottom: 0 }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: styles.statusColors[item.status as 'new' | 'learning' | 'review'].color }
                      ]}>{item.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.intervalText}>
                    {item.interval}d
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
} 