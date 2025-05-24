/**
 * Cross-platform storage utilities
 */

import { Platform } from "react-native";

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      // For native, we'd use AsyncStorage but for now return null
      // This would be implemented when we add SQLite support
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      // For native, we'd use AsyncStorage
      // This would be implemented when we add SQLite support
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      // For native, we'd use AsyncStorage
      // This would be implemented when we add SQLite support
    }
  },
}; 