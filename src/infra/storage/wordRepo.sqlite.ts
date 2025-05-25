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

// SQLite implementations for sentence translation repositories
import { SentenceExercise, TranslationAttempt, TranslationSession } from "../../domain/entities";
import { SentenceExerciseRepository, TranslationAttemptRepository, TranslationSessionRepository } from "../../domain/repositories";

export class SqliteSentenceExerciseRepository implements SentenceExerciseRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initialize();
    return this.initPromise;
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing SQLite database for sentence exercises...');
      this.db = await SQLite.openDatabaseAsync('weilang.db');
      
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sentence_exercises (
          id TEXT PRIMARY KEY,
          chinese_hanzi TEXT NOT NULL,
          chinese_pinyin TEXT NOT NULL,
          english TEXT NOT NULL,
          direction TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          used_words TEXT NOT NULL,
          context TEXT,
          created_at INTEGER NOT NULL,
          last_attempted INTEGER
        );
      `);

      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_sentence_exercises_difficulty ON sentence_exercises(difficulty);
        CREATE INDEX IF NOT EXISTS idx_sentence_exercises_direction ON sentence_exercises(direction);
        CREATE INDEX IF NOT EXISTS idx_sentence_exercises_created_at ON sentence_exercises(created_at);
      `);

      console.log('✅ SQLite SentenceExerciseRepository initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite SentenceExerciseRepository:', error);
      throw error;
    }
  }

  async get(id: string): Promise<SentenceExercise | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM sentence_exercises WHERE id = ?',
        [id]
      );

      if (!result) return null;
      return this.mapRowToSentenceExercise(result);
    } catch (error) {
      console.error('Failed to get sentence exercise:', error);
      return null;
    }
  }

  async save(exercise: SentenceExercise): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT INTO sentence_exercises (
          id, chinese_hanzi, chinese_pinyin, english, direction, difficulty,
          used_words, context, created_at, last_attempted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.id,
          exercise.chinese.hanzi,
          exercise.chinese.pinyin,
          exercise.english,
          exercise.direction,
          exercise.difficulty,
          JSON.stringify(exercise.usedWords),
          exercise.context || null,
          exercise.createdAt,
          exercise.lastAttempted || null
        ]
      );
    } catch (error) {
      console.error('Failed to save sentence exercise:', error);
      throw error;
    }
  }

  async update(exercise: SentenceExercise): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE sentence_exercises SET 
          chinese_hanzi = ?, chinese_pinyin = ?, english = ?, direction = ?,
          difficulty = ?, used_words = ?, context = ?, last_attempted = ?
        WHERE id = ?`,
        [
          exercise.chinese.hanzi,
          exercise.chinese.pinyin,
          exercise.english,
          exercise.direction,
          exercise.difficulty,
          JSON.stringify(exercise.usedWords),
          exercise.context || null,
          exercise.lastAttempted || null,
          exercise.id
        ]
      );
    } catch (error) {
      console.error('Failed to update sentence exercise:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM sentence_exercises WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete sentence exercise:', error);
      throw error;
    }
  }

  async listByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<SentenceExercise[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM sentence_exercises WHERE difficulty = ? ORDER BY created_at DESC',
        [difficulty]
      );

      return results.map(this.mapRowToSentenceExercise);
    } catch (error) {
      console.error('Failed to list sentence exercises by difficulty:', error);
      return [];
    }
  }

  async listRecent(limit = 20): Promise<SentenceExercise[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM sentence_exercises ORDER BY created_at DESC LIMIT ?',
        [limit]
      );

      return results.map(this.mapRowToSentenceExercise);
    } catch (error) {
      console.error('Failed to list recent sentence exercises:', error);
      return [];
    }
  }

  async findByUsedWords(words: string[]): Promise<SentenceExercise[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      // This is a simplified implementation - SQLite doesn't have great JSON querying
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM sentence_exercises ORDER BY created_at DESC'
      );

      return results
        .map(this.mapRowToSentenceExercise)
        .filter(exercise => 
          words.some(word => exercise.usedWords.includes(word))
        );
    } catch (error) {
      console.error('Failed to find sentence exercises by used words:', error);
      return [];
    }
  }

  private mapRowToSentenceExercise(row: any): SentenceExercise {
    return {
      id: row.id,
      chinese: {
        hanzi: row.chinese_hanzi,
        pinyin: row.chinese_pinyin
      },
      english: row.english,
      direction: row.direction as 'en-to-zh' | 'zh-to-en',
      difficulty: row.difficulty as 'beginner' | 'intermediate' | 'advanced',
      usedWords: JSON.parse(row.used_words),
      context: row.context || undefined,
      createdAt: row.created_at,
      lastAttempted: row.last_attempted || undefined
    };
  }
}

export class SqliteTranslationAttemptRepository implements TranslationAttemptRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initialize();
    return this.initPromise;
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing SQLite database for translation attempts...');
      this.db = await SQLite.openDatabaseAsync('weilang.db');
      
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS translation_attempts (
          id TEXT PRIMARY KEY,
          exercise_id TEXT NOT NULL,
          user_translation TEXT NOT NULL,
          llm_evaluation TEXT NOT NULL,
          attempted_at INTEGER NOT NULL
        );
      `);

      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_translation_attempts_exercise_id ON translation_attempts(exercise_id);
        CREATE INDEX IF NOT EXISTS idx_translation_attempts_attempted_at ON translation_attempts(attempted_at);
      `);

      console.log('✅ SQLite TranslationAttemptRepository initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite TranslationAttemptRepository:', error);
      throw error;
    }
  }

  async get(id: string): Promise<TranslationAttempt | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM translation_attempts WHERE id = ?',
        [id]
      );

      if (!result) return null;
      return this.mapRowToTranslationAttempt(result);
    } catch (error) {
      console.error('Failed to get translation attempt:', error);
      return null;
    }
  }

  async save(attempt: TranslationAttempt): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT INTO translation_attempts (
          id, exercise_id, user_translation, llm_evaluation, attempted_at
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          attempt.id,
          attempt.exerciseId,
          attempt.userTranslation,
          JSON.stringify(attempt.llmEvaluation),
          attempt.attemptedAt
        ]
      );
    } catch (error) {
      console.error('Failed to save translation attempt:', error);
      throw error;
    }
  }

  async getByExerciseId(exerciseId: string): Promise<TranslationAttempt[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM translation_attempts WHERE exercise_id = ? ORDER BY attempted_at DESC',
        [exerciseId]
      );

      return results.map(this.mapRowToTranslationAttempt);
    } catch (error) {
      console.error('Failed to get translation attempts by exercise ID:', error);
      return [];
    }
  }

  async getByDateRange(startDate: number, endDate: number): Promise<TranslationAttempt[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM translation_attempts WHERE attempted_at BETWEEN ? AND ? ORDER BY attempted_at DESC',
        [startDate, endDate]
      );

      return results.map(this.mapRowToTranslationAttempt);
    } catch (error) {
      console.error('Failed to get translation attempts by date range:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM translation_attempts WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete translation attempt:', error);
      throw error;
    }
  }

  private mapRowToTranslationAttempt(row: any): TranslationAttempt {
    return {
      id: row.id,
      exerciseId: row.exercise_id,
      userTranslation: row.user_translation,
      llmEvaluation: JSON.parse(row.llm_evaluation),
      attemptedAt: row.attempted_at
    };
  }
}

export class SqliteTranslationSessionRepository implements TranslationSessionRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initialize();
    return this.initPromise;
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing SQLite database for translation sessions...');
      this.db = await SQLite.openDatabaseAsync('weilang.db');
      
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS translation_sessions (
          id TEXT PRIMARY KEY,
          exercises TEXT NOT NULL,
          current_exercise_index INTEGER NOT NULL,
          attempts TEXT NOT NULL,
          started_at INTEGER NOT NULL,
          completed_at INTEGER,
          settings TEXT NOT NULL
        );
      `);

      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_translation_sessions_started_at ON translation_sessions(started_at);
        CREATE INDEX IF NOT EXISTS idx_translation_sessions_completed_at ON translation_sessions(completed_at);
      `);

      console.log('✅ SQLite TranslationSessionRepository initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite TranslationSessionRepository:', error);
      throw error;
    }
  }

  async get(id: string): Promise<TranslationSession | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM translation_sessions WHERE id = ?',
        [id]
      );

      if (!result) return null;
      return this.mapRowToTranslationSession(result);
    } catch (error) {
      console.error('Failed to get translation session:', error);
      return null;
    }
  }

  async save(session: TranslationSession): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT INTO translation_sessions (
          id, exercises, current_exercise_index, attempts, started_at, completed_at, settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          JSON.stringify(session.exercises),
          session.currentExerciseIndex,
          JSON.stringify(session.attempts),
          session.startedAt,
          session.completedAt || null,
          JSON.stringify(session.settings)
        ]
      );
    } catch (error) {
      console.error('Failed to save translation session:', error);
      throw error;
    }
  }

  async update(session: TranslationSession): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE translation_sessions SET 
          exercises = ?, current_exercise_index = ?, attempts = ?, 
          completed_at = ?, settings = ?
        WHERE id = ?`,
        [
          JSON.stringify(session.exercises),
          session.currentExerciseIndex,
          JSON.stringify(session.attempts),
          session.completedAt || null,
          JSON.stringify(session.settings),
          session.id
        ]
      );
    } catch (error) {
      console.error('Failed to update translation session:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM translation_sessions WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete translation session:', error);
      throw error;
    }
  }

  async listRecent(limit = 10): Promise<TranslationSession[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM translation_sessions ORDER BY started_at DESC LIMIT ?',
        [limit]
      );

      return results.map(this.mapRowToTranslationSession);
    } catch (error) {
      console.error('Failed to list recent translation sessions:', error);
      return [];
    }
  }

  async getActiveSession(): Promise<TranslationSession | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM translation_sessions WHERE completed_at IS NULL ORDER BY started_at DESC LIMIT 1'
      );

      if (!result) return null;
      return this.mapRowToTranslationSession(result);
    } catch (error) {
      console.error('Failed to get active translation session:', error);
      return null;
    }
  }

  private mapRowToTranslationSession(row: any): TranslationSession {
    return {
      id: row.id,
      exercises: JSON.parse(row.exercises),
      currentExerciseIndex: row.current_exercise_index,
      attempts: JSON.parse(row.attempts),
      startedAt: row.started_at,
      completedAt: row.completed_at || undefined,
      settings: JSON.parse(row.settings)
    };
  }
} 