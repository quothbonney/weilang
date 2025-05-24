import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WordProfileProvider } from "../../src/ui/components/profile/WordProfileProvider";
import { WordProfileTabs } from "../../src/ui/components/profile/WordProfileTabs";
import { WordProfileErrorBoundary } from "../../src/ui/components/profile/WordProfileErrorBoundary";
import { useStore } from "../../src/ui/hooks/useStore";

export default function WordProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { words } = useStore();
  
  const word = words.find(w => w.id === id);

  if (!word) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">Word not found</Text>
          <Text className="text-gray-600 text-center">The word you're looking for doesn't exist in your collection.</Text>
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
