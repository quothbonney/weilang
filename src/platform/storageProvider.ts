/**
 * Storage provider - selects appropriate repository based on platform
 */

import { Platform } from "react-native";
import { WordRepository } from "../domain/repositories";
import { DexieWordRepository } from "../infra/storage/wordRepo.dexie";
import { SqliteWordRepository } from "../infra/storage/wordRepo.sqlite";

let wordRepository: WordRepository | null = null;

/**
 * Get the word repository instance for the current platform
 */
export function getWordRepository(): WordRepository {
  if (!wordRepository) {
    if (Platform.OS === "web") {
      wordRepository = new DexieWordRepository();
    } else {
      // For now, use Dexie on all platforms until SQLite is implemented
      // TODO: Switch to SqliteWordRepository in M5
      wordRepository = new DexieWordRepository();
    }
  }
  return wordRepository;
} 