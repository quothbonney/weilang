import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WordProfileProvider } from "../../src/ui/components/profile/WordProfileProvider";
import { WordProfileTabs } from "../../src/ui/components/profile/WordProfileTabs";
import { WordProfileErrorBoundary } from "../../src/ui/components/profile/WordProfileErrorBoundary";
import { useStore } from "../../src/ui/hooks/useStore";
import { useProfileStyles } from "../../src/ui/theme";

export default function WordProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { words } = useStore();
  const styles = useProfileStyles();
  
  const word = words.find(w => w.id === id);

  if (!word) {
    return (
      <View style={styles.notFoundContainer}>
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>Word not found</Text>
          <Text style={styles.notFoundText}>The word you're looking for doesn't exist in your collection.</Text>
        </View>
      </View>
    );
  }

  return (
    <WordProfileErrorBoundary>
      <WordProfileProvider word={word}>
        <WordProfileTabs />
      </WordProfileProvider>
    </WordProfileErrorBoundary>
  );
} 
