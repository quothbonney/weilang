import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

// Import nativewind
import "react-native-gesture-handler";

// Setup nativewind for web
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.tailwindcss = { config: {} };
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize any global setup here
    console.log("WeiLang App Started!");
    
    // Initialize settings from storage and .env
    import("../src/ui/hooks/useStore").then(({ useStore }) => {
      useStore.getState().initializeSettings();
    });
  }, []);

  return (
    <GluestackUIProvider config={config}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f5f5f5",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Dashboard",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="deck" 
          options={{ 
            title: "My Words",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="flashcards" 
          options={{ 
            title: "Flashcards",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="add" 
          options={{ 
            title: "Add Word",
            presentation: "modal" 
          }} 
        />
        <Stack.Screen 
          name="review/[id]" 
          options={{ 
            title: "Review",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="profile/[id]" 
          options={{ 
            title: "Word Profile",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="example/[id]" 
          options={{ 
            title: "Example",
            presentation: "modal" 
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: "Settings" 
          }} 
        />
      </Stack>
    </GluestackUIProvider>
  );
}
