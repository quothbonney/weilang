/**
 * Repository interfaces for data access
 */

import { Word, Example, WordProfile } from "./entities";

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