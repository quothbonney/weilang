/**
 * Repository interfaces for data access
 */

import { Word, Example, WordProfile, SentenceExercise, TranslationAttempt, TranslationSession } from "./entities";

export interface WordRepository {
  get(id: string): Promise<Word | null>;
  listDue(): Promise<Word[]>;
  listAll(): Promise<Word[]>;
  save(word: Word): Promise<void>;
  update(word: Word): Promise<void>;
  delete(id: string): Promise<void>;
  getKnownWords(): Promise<string[]>; // Returns list of known Hanzi
  
  // Enhanced methods for Anki-like queues
  listLearningCards(): Promise<Word[]>;
  listNewCards(limit?: number): Promise<Word[]>;
  listReviewCards(limit?: number): Promise<Word[]>;
  getCardsByPriority(limit?: number): Promise<Word[]>;
  
  // Utility methods
  clearAllWords?(): Promise<void>; // Optional method for clearing all data
}

export interface ExampleRepository {
  get(id: string): Promise<Example | null>;
  getByWordId(wordId: string): Promise<Example[]>;
  save(example: Example): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface WordProfileRepository {
  get(id: string): Promise<WordProfile | null>;
  getByWordId(wordId: string): Promise<WordProfile | null>;
  save(profile: WordProfile): Promise<void>;
  update(profile: WordProfile): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SentenceExerciseRepository {
  get(id: string): Promise<SentenceExercise | null>;
  save(exercise: SentenceExercise): Promise<void>;
  update(exercise: SentenceExercise): Promise<void>;
  delete(id: string): Promise<void>;
  listByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<SentenceExercise[]>;
  listRecent(limit?: number): Promise<SentenceExercise[]>;
  findByUsedWords(words: string[]): Promise<SentenceExercise[]>;
}

export interface TranslationAttemptRepository {
  get(id: string): Promise<TranslationAttempt | null>;
  save(attempt: TranslationAttempt): Promise<void>;
  getByExerciseId(exerciseId: string): Promise<TranslationAttempt[]>;
  getByDateRange(startDate: number, endDate: number): Promise<TranslationAttempt[]>;
  delete(id: string): Promise<void>;
}

export interface TranslationSessionRepository {
  get(id: string): Promise<TranslationSession | null>;
  save(session: TranslationSession): Promise<void>;
  update(session: TranslationSession): Promise<void>;
  delete(id: string): Promise<void>;
  listRecent(limit?: number): Promise<TranslationSession[]>;
  getActiveSession(): Promise<TranslationSession | null>;
} 