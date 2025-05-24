import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/ui/hooks/useStore";

export default function AddWordScreen() {
  const router = useRouter();
  const { addWord } = useStore();
  
  const [hanzi, setHanzi] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [meaning, setMeaning] = useState("");

  const handleSubmit = async () => {
    if (!hanzi.trim() || !pinyin.trim() || !meaning.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await addWord({ hanzi, pinyin, meaning });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to add word");
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">Chinese Character(s)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-lg"
            value={hanzi}
            onChangeText={setHanzi}
            placeholder="花"
            autoFocus
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">Pinyin</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={pinyin}
            onChangeText={setPinyin}
            placeholder="huā"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-semibold">Meaning</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={meaning}
            onChangeText={setMeaning}
            placeholder="flower"
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 rounded-lg py-3"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center font-semibold">Add Word</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 