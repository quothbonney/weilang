/**
 * Unihan database repository for character data access
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { UnihanEntry } from '../../domain/entities';

export interface RadicalInfo {
  number: number;
  character: string;
  strokes: number;
  meaning: string;
  pinyin: string;
}

export class UnihanRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbPath: string;
  private isWebPlatform: boolean;
  private initializationError: string | null = null;

  constructor(dbPath: string = 'unihan.db') {
    this.dbPath = dbPath;
    this.isWebPlatform = Platform.OS === 'web';
  }

  async initialize(): Promise<void> {
    // Skip SQLite initialization on web platform for now
    if (this.isWebPlatform) {
      console.warn('UnihanRepository: SQLite not supported on web platform, using fallback data');
      this.initializationError = 'SQLite not supported on web platform';
      return;
    }

    try {
      this.db = await SQLite.openDatabaseAsync(this.dbPath);
      await this.createIndexes();
      this.initializationError = null;
    } catch (error) {
      console.error('Failed to initialize Unihan database:', error);
      this.initializationError = error instanceof Error ? error.message : 'Unknown database error';
      // Don't throw - allow graceful degradation
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Ensure indexes exist for performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_character ON unihan(character);
      CREATE INDEX IF NOT EXISTS idx_radical ON unihan(radical);
      CREATE INDEX IF NOT EXISTS idx_strokes ON unihan(total_strokes);
    `);
  }

  private getFallbackCharacterData(character: string): UnihanEntry | null {
    // Provide basic fallback data for common characters
    const fallbackData: Record<string, UnihanEntry> = {
      '说': {
        codepoint: 'U+8BF4',
        character: '说',
        radical: 149,
        totalStrokes: 9,
        pinyin: 'shuō',
        definition: 'speak, say, talk'
      },
      '你': {
        codepoint: 'U+4F60',
        character: '你',
        radical: 9,
        totalStrokes: 7,
        pinyin: 'nǐ',
        definition: 'you'
      },
      '好': {
        codepoint: 'U+597D',
        character: '好',
        radical: 38,
        totalStrokes: 6,
        pinyin: 'hǎo',
        definition: 'good, well'
      },
      '我': {
        codepoint: 'U+6211',
        character: '我',
        radical: 62,
        totalStrokes: 7,
        pinyin: 'wǒ',
        definition: 'I, me'
      },
      '他': {
        codepoint: 'U+4ED6',
        character: '他',
        radical: 9,
        totalStrokes: 5,
        pinyin: 'tā',
        definition: 'he, him'
      }
    };

    return fallbackData[character] || null;
  }

  private getFallbackRadicalInfo(radicalNumber: number): RadicalInfo | null {
    // Provide basic fallback data for common radicals
    const fallbackRadicals: Record<number, RadicalInfo> = {
      1: { number: 1, character: '一', strokes: 1, meaning: 'one', pinyin: 'yī' },
      9: { number: 9, character: '人', strokes: 2, meaning: 'person', pinyin: 'rén' },
      38: { number: 38, character: '女', strokes: 3, meaning: 'woman', pinyin: 'nǚ' },
      62: { number: 62, character: '戈', strokes: 4, meaning: 'spear', pinyin: 'gē' },
      149: { number: 149, character: '言', strokes: 7, meaning: 'speech', pinyin: 'yán' }
    };

    return fallbackRadicals[radicalNumber] || null;
  }

  async getCharacterData(character: string): Promise<UnihanEntry | null> {
    if (this.isWebPlatform || this.initializationError) {
      return this.getFallbackCharacterData(character);
    }

    if (!this.db) await this.initialize();
    if (!this.db) return this.getFallbackCharacterData(character);

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM unihan WHERE character = ?',
        [character]
      );

      if (!result) return this.getFallbackCharacterData(character);

      return {
        codepoint: result.codepoint,
        character: result.character,
        radical: result.radical,
        totalStrokes: result.total_strokes,
        pinyin: result.pinyin || '',
        definition: result.definition || ''
      };
    } catch (error) {
      console.error('Failed to get character data:', error);
      return this.getFallbackCharacterData(character);
    }
  }

  async getRadicalInfo(radicalNumber: number): Promise<RadicalInfo | null> {
    if (this.isWebPlatform || this.initializationError) {
      return this.getFallbackRadicalInfo(radicalNumber);
    }

    if (!this.db) await this.initialize();
    if (!this.db) return this.getFallbackRadicalInfo(radicalNumber);

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM radicals WHERE number = ?',
        [radicalNumber]
      );

      if (!result) return this.getFallbackRadicalInfo(radicalNumber);

      return {
        number: result.number,
        character: result.character,
        strokes: result.strokes,
        meaning: result.meaning || '',
        pinyin: result.pinyin || ''
      };
    } catch (error) {
      console.error('Failed to get radical info:', error);
      return this.getFallbackRadicalInfo(radicalNumber);
    }
  }

  async getCharactersByRadical(radicalNumber: number, limit = 50): Promise<UnihanEntry[]> {
    if (this.isWebPlatform || this.initializationError) {
      // Return empty array for now on web platform
      return [];
    }

    if (!this.db) await this.initialize();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM unihan WHERE radical = ? LIMIT ?',
        [radicalNumber, limit]
      );

      return results.map(result => ({
        codepoint: result.codepoint,
        character: result.character,
        radical: result.radical,
        totalStrokes: result.total_strokes,
        pinyin: result.pinyin || '',
        definition: result.definition || ''
      }));
    } catch (error) {
      console.error('Failed to get characters by radical:', error);
      return [];
    }
  }

  async getCharactersByStrokeCount(strokes: number, limit = 50): Promise<UnihanEntry[]> {
    if (this.isWebPlatform || this.initializationError) {
      // Return empty array for now on web platform
      return [];
    }

    if (!this.db) await this.initialize();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM unihan WHERE total_strokes = ? LIMIT ?',
        [strokes, limit]
      );

      return results.map(result => ({
        codepoint: result.codepoint,
        character: result.character,
        radical: result.radical,
        totalStrokes: result.total_strokes,
        pinyin: result.pinyin || '',
        definition: result.definition || ''
      }));
    } catch (error) {
      console.error('Failed to get characters by stroke count:', error);
      return [];
    }
  }

  async searchCharacters(query: string, limit = 20): Promise<UnihanEntry[]> {
    if (this.isWebPlatform || this.initializationError) {
      // Return empty array for now on web platform
      return [];
    }

    if (!this.db) await this.initialize();
    if (!this.db) return [];

    try {
      // Search by character, pinyin, or definition
      const results = await this.db.getAllAsync<any>(
        `SELECT * FROM unihan 
         WHERE character LIKE ? 
            OR pinyin LIKE ? 
            OR definition LIKE ? 
         LIMIT ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`, limit]
      );

      return results.map(result => ({
        codepoint: result.codepoint,
        character: result.character,
        radical: result.radical,
        totalStrokes: result.total_strokes,
        pinyin: result.pinyin || '',
        definition: result.definition || ''
      }));
    } catch (error) {
      console.error('Failed to search characters:', error);
      return [];
    }
  }

  async getAllRadicals(): Promise<RadicalInfo[]> {
    if (this.isWebPlatform || this.initializationError) {
      // Return basic radicals for web platform
      return [
        { number: 1, character: '一', strokes: 1, meaning: 'one', pinyin: 'yī' },
        { number: 9, character: '人', strokes: 2, meaning: 'person', pinyin: 'rén' },
        { number: 38, character: '女', strokes: 3, meaning: 'woman', pinyin: 'nǚ' },
        { number: 62, character: '戈', strokes: 4, meaning: 'spear', pinyin: 'gē' },
        { number: 149, character: '言', strokes: 7, meaning: 'speech', pinyin: 'yán' }
      ];
    }

    if (!this.db) await this.initialize();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM radicals ORDER BY number'
      );

      return results.map(result => ({
        number: result.number,
        character: result.character,
        strokes: result.strokes,
        meaning: result.meaning || '',
        pinyin: result.pinyin || ''
      }));
    } catch (error) {
      console.error('Failed to get all radicals:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  // Utility method to check if database is available
  isAvailable(): boolean {
    return !this.isWebPlatform && !this.initializationError && this.db !== null;
  }

  // Get status information for debugging
  getStatus(): { platform: string; available: boolean; error: string | null } {
    return {
      platform: this.isWebPlatform ? 'web' : 'native',
      available: this.isAvailable(),
      error: this.initializationError
    };
  }
} 