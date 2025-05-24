/**
 * SQLite implementation of WordRepository for native platform
 * Will be implemented in M5
 */

import { Word } from "@/domain/entities";
import { WordRepository } from "@/domain/repositories";

export class SqliteWordRepository implements WordRepository {
  async get(id: string): Promise<Word | null> {
    // TODO: Implement in M5
    throw new Error("SQLite repository not yet implemented");
  }

  async listDue(): Promise<Word[]> {
    // TODO: Implement in M5
    throw new Error("SQLite repository not yet implemented");
  }

  async listAll(): Promise<Word[]> {
    // TODO: Implement in M5
    throw new Error("SQLite repository not yet implemented");
  }

  async save(word: Word): Promise<void> {
    // TODO: Implement in M5
    throw new Error("SQLite repository not yet implemented");
  }

  async update(word: Word): Promise<void> {
    // TODO: Implement in M5
    throw new Error("SQLite repository not yet implemented");
  }

  async delete(id: string): Promise<void> {
    // TODO: Implement in M5
    throw new Error("SQLite repository not yet implemented");
  }

  async getKnownWords(): Promise<string[]> {
    // TODO: Implement in M5
    throw new Error("SQLite repository not yet implemented");
  }
} 