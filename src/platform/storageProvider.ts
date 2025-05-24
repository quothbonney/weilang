/**
 * Storage provider - selects appropriate repository based on platform
 */

import { Platform } from "react-native";
import { WordRepository } from "../domain/repositories";
import { DexieWordRepository } from "../infra/storage/wordRepo.dexie";
import { SqliteWordRepository } from "../infra/storage/wordRepo.sqlite";

let wordRepository: WordRepository | null = null;

/**
 * Reset the repository cache - useful for testing or platform switches
 */
export function resetWordRepository(): void {
  wordRepository = null;
}

/**
 * Get the word repository instance for the current platform
 */
export function getWordRepository(): WordRepository {
  if (!wordRepository) {
    if (Platform.OS === "web") {
      console.log("🌐 Initializing Dexie repository for web platform");
      wordRepository = new DexieWordRepository();
    } else {
      console.log(`📱 Initializing SQLite repository for ${Platform.OS} platform`);
      wordRepository = new SqliteWordRepository();
    }
  }
  return wordRepository;
} 