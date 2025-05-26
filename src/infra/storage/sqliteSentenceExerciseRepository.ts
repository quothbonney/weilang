// SQLite implementations for sentence translation repositories
import * as SQLite from 'expo-sqlite';
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
