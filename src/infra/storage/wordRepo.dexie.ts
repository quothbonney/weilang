/**
 * Dexie (IndexedDB) implementation of WordRepository for web platform
 */

import Dexie, { Table } from "dexie";
import { Word } from "../../domain/entities";
import { WordRepository } from "../../domain/repositories";

// Database schema
class WeiLangDatabase extends Dexie {
  words!: Table<Word>;

  constructor() {
    super("WeiLangDB");
    this.version(1).stores({
      words: "id, due, status, hanzi, learningStep, learningDue",
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