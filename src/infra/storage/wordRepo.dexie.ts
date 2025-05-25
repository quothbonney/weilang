/**
 * Dexie (IndexedDB) implementation of WordRepository for web platform
 */

import Dexie, { Table } from "dexie";
import { Word, SentenceExercise, TranslationAttempt, TranslationSession } from "../../domain/entities";
import { WordRepository } from "../../domain/repositories";

// Database schema
class WeiLangDatabase extends Dexie {
  words!: Table<Word>;
  sentenceExercises!: Table<SentenceExercise>;
  translationAttempts!: Table<TranslationAttempt>;
  translationSessions!: Table<TranslationSession>;

  constructor() {
    super("WeiLangDB");
    
    // Version 1: Original schema
    this.version(1).stores({
      words: "id, due, status, hanzi, learningStep, learningDue",
    });
    
    // Version 2: Add sentence translation tables
    this.version(2).stores({
      words: "id, due, status, hanzi, learningStep, learningDue",
      sentenceExercises: "id, difficulty, direction, createdAt, lastAttempted",
      translationAttempts: "id, exerciseId, attemptedAt",
      translationSessions: "id, startedAt, completedAt",
    });
  }
}

export class DexieWordRepository implements WordRepository {
  private db: WeiLangDatabase;

  constructor() {
    this.db = new WeiLangDatabase();
  }

  async get(id: string): Promise<Word | null> {
    const word = await this.db.words.get(id);
    return word || null;
  }

  async listDue(): Promise<Word[]> {
    const now = Date.now();
    return this.db.words
      .where("due")
      .belowOrEqual(now)
      .toArray();
  }

  async listAll(): Promise<Word[]> {
    return this.db.words.toArray();
  }

  async save(word: Word): Promise<void> {
    await this.db.words.add(word);
  }

  async update(word: Word): Promise<void> {
    await this.db.words.put(word);
  }

  async delete(id: string): Promise<void> {
    await this.db.words.delete(id);
  }

  async getKnownWords(): Promise<string[]> {
    // Words are "known" if they've been successfully reviewed at least once
    const knownWords = await this.db.words
      .where("status")
      .anyOf("learning", "review")
      .toArray();
    
    return knownWords.map(word => word.hanzi);
  }

  async listLearningCards(): Promise<Word[]> {
    const now = Date.now();
    
    // Get cards that are in learning queue and due for review
    return this.db.words
      .where("learningStep")
      .above(0)
      .filter(word => word.learningDue !== undefined && word.learningDue <= now)
      .sortBy("learningDue");
  }

  async listNewCards(limit = 20): Promise<Word[]> {
    return this.db.words
      .where("status")
      .equals("new")
      .limit(limit)
      .toArray();
  }

  async listReviewCards(limit = 100): Promise<Word[]> {
    const now = Date.now();
    
    return this.db.words
      .where("status")
      .equals("review")
      .filter(word => word.due <= now)
      .sortBy("due");
  }

  async getCardsByPriority(limit = 50): Promise<Word[]> {
    const now = Date.now();
    
    // Get all due cards
    const learningCards = await this.listLearningCards();
    const newCards = await this.listNewCards(20);
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
  }

  async clearAllWords(): Promise<void> {
    try {
      console.log('🗑️ Clearing all words from Dexie database...');
      await this.db.words.clear();
      console.log('✅ All words cleared successfully');
    } catch (error) {
      console.error('Failed to clear all words:', error);
      throw error;
    }
  }
}

// Export the database instance for use by other repositories
export const getDatabase = () => new WeiLangDatabase();

// Sentence Exercise Repository Implementation
export class DexieSentenceExerciseRepository {
  private db: WeiLangDatabase;

  constructor() {
    this.db = new WeiLangDatabase();
  }

  async get(id: string): Promise<SentenceExercise | null> {
    const exercise = await this.db.sentenceExercises.get(id);
    return exercise || null;
  }

  async save(exercise: SentenceExercise): Promise<void> {
    await this.db.sentenceExercises.add(exercise);
  }

  async update(exercise: SentenceExercise): Promise<void> {
    await this.db.sentenceExercises.put(exercise);
  }

  async delete(id: string): Promise<void> {
    await this.db.sentenceExercises.delete(id);
  }

  async listByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<SentenceExercise[]> {
    return this.db.sentenceExercises
      .where("difficulty")
      .equals(difficulty)
      .toArray();
  }

  async listRecent(limit = 20): Promise<SentenceExercise[]> {
    return this.db.sentenceExercises
      .orderBy("createdAt")
      .reverse()
      .limit(limit)
      .toArray();
  }

  async findByUsedWords(words: string[]): Promise<SentenceExercise[]> {
    // This is a simplified implementation - in a real scenario you might want more sophisticated filtering
    const allExercises = await this.db.sentenceExercises.toArray();
    return allExercises.filter(exercise => 
      words.some(word => exercise.usedWords.includes(word))
    );
  }
}

// Translation Attempt Repository Implementation
export class DexieTranslationAttemptRepository {
  private db: WeiLangDatabase;

  constructor() {
    this.db = new WeiLangDatabase();
  }

  async get(id: string): Promise<TranslationAttempt | null> {
    const attempt = await this.db.translationAttempts.get(id);
    return attempt || null;
  }

  async save(attempt: TranslationAttempt): Promise<void> {
    await this.db.translationAttempts.add(attempt);
  }

  async getByExerciseId(exerciseId: string): Promise<TranslationAttempt[]> {
    return this.db.translationAttempts
      .where("exerciseId")
      .equals(exerciseId)
      .toArray();
  }

  async getByDateRange(startDate: number, endDate: number): Promise<TranslationAttempt[]> {
    return this.db.translationAttempts
      .where("attemptedAt")
      .between(startDate, endDate)
      .toArray();
  }

  async delete(id: string): Promise<void> {
    await this.db.translationAttempts.delete(id);
  }
}

// Translation Session Repository Implementation
export class DexieTranslationSessionRepository {
  private db: WeiLangDatabase;

  constructor() {
    this.db = new WeiLangDatabase();
  }

  async get(id: string): Promise<TranslationSession | null> {
    const session = await this.db.translationSessions.get(id);
    return session || null;
  }

  async save(session: TranslationSession): Promise<void> {
    await this.db.translationSessions.add(session);
  }

  async update(session: TranslationSession): Promise<void> {
    await this.db.translationSessions.put(session);
  }

  async delete(id: string): Promise<void> {
    await this.db.translationSessions.delete(id);
  }

  async listRecent(limit = 10): Promise<TranslationSession[]> {
    return this.db.translationSessions
      .orderBy("startedAt")
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getActiveSession(): Promise<TranslationSession | null> {
    const allSessions = await this.db.translationSessions.toArray();
    const activeSessions = allSessions.filter(session => !session.completedAt);
    
    return activeSessions.length > 0 ? activeSessions[0] : null;
  }
} 