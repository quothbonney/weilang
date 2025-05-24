/**
 * Cross-platform storage utilities
 */

import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Failed to get item from AsyncStorage:', error);
        return null;
      }
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Failed to set item in AsyncStorage:', error);
        throw error;
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove item from AsyncStorage:', error);
        throw error;
      }
    }
  },
}; 