/**
 * Profile cache service for storing WordProfileDTO with TTL
 * Uses file-based storage with memory cache for performance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordProfileDTO, ProfileCacheEntry } from '../../domain/entities';

export class ProfileCache {
  private memoryCache = new Map<string, ProfileCacheEntry>();
  private readonly ttl = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
  private readonly keyPrefix = 'profile_cache_';

  async get(hanzi: string): Promise<WordProfileDTO | null> {
    const cacheKey = this.getCacheKey(hanzi);

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.profile;
    }

    // Check persistent storage
    try {
      const stored = await AsyncStorage.getItem(cacheKey);
      if (stored) {
        const entry: ProfileCacheEntry = JSON.parse(stored);
        
        if (!this.isExpired(entry)) {
          // Update memory cache
          this.memoryCache.set(cacheKey, entry);
          return entry.profile;
        } else {
          // Remove expired entry
          await this.remove(hanzi);
        }
      }
    } catch (error) {
      console.error('Error reading from profile cache:', error);
    }

    return null;
  }

  async set(hanzi: string, profile: WordProfileDTO): Promise<void> {
    const cacheKey = this.getCacheKey(hanzi);
    const now = Date.now();
    
    const entry: ProfileCacheEntry = {
      hanzi,
      profile,
      cachedAt: now,
      expiresAt: now + this.ttl
    };

    // Update memory cache
    this.memoryCache.set(cacheKey, entry);

    // Update persistent storage
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.error('Error writing to profile cache:', error);
      // Don't throw - memory cache still works
    }
  }

  async remove(hanzi: string): Promise<void> {
    const cacheKey = this.getCacheKey(hanzi);

    // Remove from memory cache
    this.memoryCache.delete(cacheKey);

    // Remove from persistent storage
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error removing from profile cache:', error);
    }
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear persistent storage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key: string) => key.startsWith(this.keyPrefix));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing profile cache:', error);
    }
  }

  async getStats(): Promise<{ count: number; memoryCount: number; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key: string) => key.startsWith(this.keyPrefix));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        count: cacheKeys.length,
        memoryCount: this.memoryCache.size,
        totalSize
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { count: 0, memoryCount: this.memoryCache.size, totalSize: 0 };
    }
  }

  async cleanupExpired(): Promise<number> {
    let removedCount = 0;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key: string) => key.startsWith(this.keyPrefix));
      
      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const entry: ProfileCacheEntry = JSON.parse(stored);
          if (this.isExpired(entry)) {
            await AsyncStorage.removeItem(key);
            removedCount++;
          }
        }
      }

      // Clean memory cache too
      const memoryEntries = Array.from(this.memoryCache.entries());
      for (const [key, entry] of memoryEntries) {
        if (this.isExpired(entry)) {
          this.memoryCache.delete(key);
          removedCount++;
        }
      }
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }

    return removedCount;
  }

  async preloadProfiles(hanziList: string[]): Promise<void> {
    // Preload frequently used profiles into memory
    const promises = hanziList.slice(0, 50).map(async (hanzi: string) => {
      const profile = await this.get(hanzi);
      // Profile is already loaded into memory cache if it exists
    });

    await Promise.all(promises);
  }

  private getCacheKey(hanzi: string): string {
    return `${this.keyPrefix}${hanzi}`;
  }

  private isExpired(entry: ProfileCacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }
} 