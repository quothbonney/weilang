import * as SQLite from 'expo-sqlite';
import { TranslationSession } from "../../domain/entities";
import { TranslationSessionRepository } from "../../domain/repositories";

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
