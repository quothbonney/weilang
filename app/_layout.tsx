import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "../global.css";
import { ThemeProvider, useTheme } from "../src/ui/theme";

// Import nativewind
import "react-native-gesture-handler";

// Setup nativewind for web
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.tailwindcss = { config: {} };
}

const AppStack = () => {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    // Initialize any global setup here
    console.log(`WeiLang App Started on ${Platform.OS}!`);
    
    // Initialize settings from storage and .env
    import("../src/ui/hooks/useStore").then(({ useStore }) => {
      useStore.getState().initializeSettings();
    });
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface.primary,
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            fontWeight: "600",
            color: theme.colors.text.primary,
          },
          // Ensure proper touch handling on mobile
          gestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Dashboard",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="deck" 
          options={{ 
            title: "My Words",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="flashcards" 
          options={{ 
            title: "Flashcards",
            headerShown: false 
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
            headerShown: false 
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
        <Stack.Screen 
          name="translation" 
          options={{ 
            title: "Translation",
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppStack />
    </ThemeProvider>
  );
} 