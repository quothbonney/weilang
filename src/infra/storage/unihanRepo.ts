/**
 * Unihan database repository for character data access
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { UnihanEntry } from '../../domain/entities';
import { DatabaseInitializer } from './databaseInitializer';
import { UNIHAN_DB_PATH } from '../../../env';

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

  constructor(dbPath: string = UNIHAN_DB_PATH) {
    this.dbPath = dbPath;
    this.isWebPlatform = Platform.OS === 'web';
  }

  private async ensureTablesExist(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Check if unihan table exists
      const tableExists = await this.db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='unihan'"
      );

      if (!tableExists) {
        console.warn('⚠️  Unihan table not found. Database may be empty or corrupted.');
        console.warn('📍 Database path:', this.dbPath);
        console.warn('🔧 This usually means the app created an empty database instead of using the populated one.');
        console.warn('💡 Solutions:');
        console.warn('   1. Move database to assets/ and copy to documents directory');
        console.warn('   2. Use absolute path to existing database');
        console.warn('   3. Run ETL script to populate the current database');
        
        throw new Error(`Unihan table not found in database at ${this.dbPath}. The app may be creating an empty database instead of using the populated one.`);
      }

      // Check table has data
      const rowCount = await this.db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM unihan');
      if (!rowCount || rowCount.count === 0) {
        throw new Error('Unihan table exists but is empty. Run ETL script to populate database.');
      }

      console.log(`✅ Unihan database verified: ${rowCount.count} characters loaded`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('no such table')) {
        throw new Error(`Database table 'unihan' not found. This usually means Expo SQLite created an empty database instead of using your populated database file. Check database path: ${this.dbPath}`);
      }
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log(`Initializing Unihan database: ${this.dbPath} on ${this.isWebPlatform ? 'web' : 'native'} platform`);
      
      // For mobile platforms, use DatabaseInitializer to get the correct path
      let actualDbPath = this.dbPath;
      if (!this.isWebPlatform) {
        try {
          actualDbPath = await DatabaseInitializer.initializeDatabase(
            this.dbPath.split('/').pop() || 'unihan.db'
          );
          console.log(`📱 Using mobile database path: ${actualDbPath}`);
        } catch (error) {
          console.warn('⚠️  Failed to initialize mobile database, falling back to default path:', error);
          // Fall back to original path
        }
      }
      
      this.db = await SQLite.openDatabaseAsync(actualDbPath);
      
      // IMPORTANT: Check tables exist before creating indexes
      await this.ensureTablesExist();
      await this.createIndexes();
      
      this.initializationError = null;
      console.log('Unihan database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Unihan database:', error);
      this.initializationError = error instanceof Error ? error.message : 'Unknown database error';
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Ensure indexes exist for performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_character ON unihan(character);
        CREATE INDEX IF NOT EXISTS idx_radical ON unihan(radical);
        CREATE INDEX IF NOT EXISTS idx_strokes ON unihan(total_strokes);
      `);
    } catch (error) {
      console.error('Failed to create indexes:', error);
      // Don't throw here - indexes are nice to have but not essential
    }
  }

  async getCharacterData(character: string): Promise<UnihanEntry | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM unihan WHERE character = ?',
        [character]
      );

      if (!result) return null;

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
      return null;
    }
  }

  async getRadicalInfo(radicalNumber: number): Promise<RadicalInfo | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM radicals WHERE number = ?',
        [radicalNumber]
      );

      if (!result) return null;

      return {
        number: result.number,
        character: result.character,
        strokes: result.strokes,
        meaning: result.meaning || '',
        pinyin: result.pinyin || ''
      };
    } catch (error) {
      console.error('Failed to get radical info:', error);
      return null;
    }
  }

  async getCharactersByRadical(radicalNumber: number, limit = 50): Promise<UnihanEntry[]> {
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
    return this.db !== null && !this.initializationError;
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