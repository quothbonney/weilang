/**
 * SQLite implementation of WordRepository for native platform
 */

import * as SQLite from 'expo-sqlite';
import { Word } from "@/domain/entities";
import { WordRepository } from "@/domain/repositories";

export class SqliteWordRepository implements WordRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private initializationError: string | null = null;

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initialize();
    return this.initPromise;
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing SQLite database for words...');
      this.db = await SQLite.openDatabaseAsync('weilang.db');
      
      // Check if we need to recreate the table due to schema changes
      try {
        await this.db.getFirstAsync('SELECT * FROM words LIMIT 1');
      } catch (tableError) {
        console.log('📝 Table needs to be created or recreated...');
        await this.dropAndRecreateTable();
      }
      
      // Create the words table if it doesn't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS words (
          id TEXT PRIMARY KEY,
          hanzi TEXT NOT NULL,
          pinyin TEXT NOT NULL,
          meaning TEXT NOT NULL,
          ease REAL NOT NULL DEFAULT 2.5,
          interval INTEGER NOT NULL DEFAULT 1,
          repetitions INTEGER NOT NULL DEFAULT 0,
          due INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'new',
          learningStep INTEGER NOT NULL DEFAULT 0,
          learningDue INTEGER,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER
        );
      `);

      // Create indexes for performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_words_due ON words(due);
        CREATE INDEX IF NOT EXISTS idx_words_status ON words(status);
        CREATE INDEX IF NOT EXISTS idx_words_learning_step ON words(learningStep);
        CREATE INDEX IF NOT EXISTS idx_words_learning_due ON words(learningDue);
      `);

      console.log('✅ SQLite WordRepository initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite WordRepository:', error);
      this.initializationError = error instanceof Error ? error.message : 'Unknown database error';
      throw error;
    }
  }

  private async dropAndRecreateTable(): Promise<void> {
    if (!this.db) return;
    
    try {
      console.log('🗑️ Dropping existing words table...');
      await this.db.execAsync('DROP TABLE IF EXISTS words;');
      console.log('✅ Table dropped successfully');
    } catch (error) {
      console.error('Failed to drop table:', error);
      // Continue anyway - table might not exist
    }
  }

  async get(id: string): Promise<Word | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM words WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return this.mapRowToWord(result);
    } catch (error) {
      console.error('Failed to get word:', error);
      return null;
    }
  }

  async listDue(): Promise<Word[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const now = Date.now();
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM words WHERE due <= ? ORDER BY due ASC',
        [now]
      );

      return results.map(this.mapRowToWord);
    } catch (error) {
      console.error('Failed to list due words:', error);
      return [];
    }
  }

  async listAll(): Promise<Word[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM words ORDER BY createdAt DESC'
      );

      return results.map(this.mapRowToWord);
    } catch (error) {
      console.error('Failed to list all words:', error);
      return [];
    }
  }

  async save(word: Word): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Ensure all required fields have valid values
      const safeWord = {
        id: word.id,
        hanzi: word.hanzi,
        pinyin: word.pinyin,
        meaning: word.meaning,
        ease: word.ease ?? 2.5,
        interval: word.interval ?? 0,
        repetitions: word.repetitions ?? 0,
        due: word.due,
        status: word.status ?? 'new',
        learningStep: word.learningStep ?? 0,  // Default to 0 if missing
        learningDue: word.learningDue || null,
        createdAt: word.createdAt,
        updatedAt: word.updatedAt || null
      };

      await this.db.runAsync(
        `INSERT INTO words (
          id, hanzi, pinyin, meaning, ease, interval, repetitions, 
          due, status, learningStep, learningDue, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          safeWord.id,
          safeWord.hanzi,
          safeWord.pinyin,
          safeWord.meaning,
          safeWord.ease,
          safeWord.interval,
          safeWord.repetitions,
          safeWord.due,
          safeWord.status,
          safeWord.learningStep,
          safeWord.learningDue,
          safeWord.createdAt,
          safeWord.updatedAt
        ]
      );
    } catch (error) {
      console.error('Failed to save word:', error);
      throw error;
    }
  }

  async update(word: Word): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Ensure all required fields have valid values
      const safeWord = {
        hanzi: word.hanzi,
        pinyin: word.pinyin,
        meaning: word.meaning,
        ease: word.ease ?? 2.5,
        interval: word.interval ?? 0,
        repetitions: word.repetitions ?? 0,
        due: word.due,
        status: word.status ?? 'new',
        learningStep: word.learningStep ?? 0,  // Default to 0 if missing
        learningDue: word.learningDue || null,
        updatedAt: Date.now(),
        id: word.id
      };

      await this.db.runAsync(
        `UPDATE words SET 
          hanzi = ?, pinyin = ?, meaning = ?, ease = ?, interval = ?, 
          repetitions = ?, due = ?, status = ?, learningStep = ?, 
          learningDue = ?, updatedAt = ?
        WHERE id = ?`,
        [
          safeWord.hanzi,
          safeWord.pinyin,
          safeWord.meaning,
          safeWord.ease,
          safeWord.interval,
          safeWord.repetitions,
          safeWord.due,
          safeWord.status,
          safeWord.learningStep,
          safeWord.learningDue,
          safeWord.updatedAt,
          safeWord.id
        ]
      );
    } catch (error) {
      console.error('Failed to update word:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM words WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete word:', error);
      throw error;
    }
  }

  async clearAllWords(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('🗑️ Clearing all words from database...');
      await this.db.runAsync('DELETE FROM words');
      console.log('✅ All words cleared successfully');
    } catch (error) {
      console.error('Failed to clear all words:', error);
      throw error;
    }
  }

  async getKnownWords(): Promise<string[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        "SELECT hanzi FROM words WHERE status IN ('learning', 'review')"
      );

      return results.map(row => row.hanzi);
    } catch (error) {
      console.error('Failed to get known words:', error);
      return [];
    }
  }

  async listLearningCards(): Promise<Word[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const now = Date.now();
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM words WHERE learningStep > 0 AND learningDue <= ? ORDER BY learningDue ASC',
        [now]
      );

      return results.map(this.mapRowToWord);
    } catch (error) {
      console.error('Failed to list learning cards:', error);
      return [];
    }
  }

  async listNewCards(limit = 20): Promise<Word[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM words WHERE status = ? LIMIT ?',
        ['new', limit]
      );

      return results.map(this.mapRowToWord);
    } catch (error) {
      console.error('Failed to list new cards:', error);
      return [];
    }
  }

  async listReviewCards(limit = 100): Promise<Word[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const now = Date.now();
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM words WHERE status = ? AND due <= ? ORDER BY due ASC LIMIT ?',
        ['review', now, limit]
      );

      return results.map(this.mapRowToWord);
    } catch (error) {
      console.error('Failed to list review cards:', error);
      return [];
    }
  }

  async getCardsByPriority(limit = 50): Promise<Word[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const now = Date.now();
      
      // Get learning cards first (highest priority)
      const learningCards = await this.listLearningCards();
      
      // Get new cards (medium priority)
      const newCards = await this.listNewCards(20);
      
      // Get review cards (lowest priority)
      const reviewCards = await this.listReviewCards(100);
      
      // Combine and sort by priority
      const allCards = [...learningCards, ...newCards, ...reviewCards];
      
      // Sort by priority (learning > new > review, then by due time)
      allCards.sort((a, b) => {
        // Learning cards first
        if (a.learningStep > 0 && b.learningStep === 0) return -1;
        if (a.learningStep === 0 && b.learningStep > 0) return 1;
        
        // Both learning - sort by learning due time
        if (a.learningStep > 0 && b.learningStep > 0) {
          const aDue = a.learningDue || 0;
          const bDue = b.learningDue || 0;
          return aDue - bDue;
        }
        
        // New cards next
        if (a.status === "new" && b.status !== "new") return -1;
        if (a.status !== "new" && b.status === "new") return 1;
        
        // Review cards by how overdue they are
        return a.due - b.due;
      });
      
      return allCards.slice(0, limit);
    } catch (error) {
      console.error('Failed to get cards by priority:', error);
      return [];
    }
  }

  private mapRowToWord(row: any): Word {
    return {
      id: row.id,
      hanzi: row.hanzi,
      pinyin: row.pinyin,
      meaning: row.meaning,
      ease: row.ease ?? 2.5,
      interval: row.interval ?? 0,
      repetitions: row.repetitions ?? 0,
      due: row.due,
      status: row.status ?? 'new',
      learningStep: row.learningStep ?? 0,  // Default to 0 if null/undefined
      learningDue: row.learningDue || undefined,  // Keep as undefined if null
      createdAt: row.createdAt,
      updatedAt: row.updatedAt || undefined  // Keep as undefined if null
    };
  }
} 