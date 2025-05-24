/**
 * Repository interfaces for data access
 */

import { Word, Example } from "./entities";

export interface WordRepository {
  get(id: string): Promise<Word | null>;
  listDue(): Promise<Word[]>;
  listAll(): Promise<Word[]>;
  save(word: Word): Promise<void>;
  update(word: Word): Promise<void>;
  delete(id: string): Promise<void>;
  getKnownWords(): Promise<string[]>; // Returns list of known Hanzi
}

export interface ExampleRepository {
  get(id: string): Promise<Example | null>;
  getByWordId(wordId: string): Promise<Example[]>;
  save(example: Example): Promise<void>;
  delete(id: string): Promise<void>;
} 