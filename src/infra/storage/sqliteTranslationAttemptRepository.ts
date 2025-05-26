import * as SQLite from 'expo-sqlite';
import { TranslationAttempt } from "../../domain/entities";
import { TranslationAttemptRepository } from "../../domain/repositories";

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
