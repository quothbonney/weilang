import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";

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
    
    // Load API key from environment if available
    import("../env").then(({ TOGETHER_KEY }) => {
      if (TOGETHER_KEY) {
        import("../src/ui/hooks/useStore").then(({ useStore }) => {
          useStore.getState().setApiKey(TOGETHER_KEY);
        });
      }
    });
  }, []);

  return (
    <>
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
            title: "My Deck",
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
    </>
  );
} 