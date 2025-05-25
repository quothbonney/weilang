/**
 * Storage provider - selects appropriate repository based on platform
 */

import { Platform } from "react-native";
import { WordRepository, SentenceExerciseRepository, TranslationAttemptRepository, TranslationSessionRepository } from "../domain/repositories";
import { DexieWordRepository, DexieSentenceExerciseRepository, DexieTranslationAttemptRepository, DexieTranslationSessionRepository } from "../infra/storage/wordRepo.dexie";
import { SqliteWordRepository, SqliteSentenceExerciseRepository, SqliteTranslationAttemptRepository, SqliteTranslationSessionRepository } from "../infra/storage/wordRepo.sqlite";

let wordRepository: WordRepository | null = null;
let sentenceExerciseRepository: SentenceExerciseRepository | null = null;
let translationAttemptRepository: TranslationAttemptRepository | null = null;
let translationSessionRepository: TranslationSessionRepository | null = null;

/**
 * Reset the repository cache - useful for testing or platform switches
 */
export function resetWordRepository(): void {
  wordRepository = null;
}

export function resetSentenceTranslationRepositories(): void {
  sentenceExerciseRepository = null;
  translationAttemptRepository = null;
  translationSessionRepository = null;
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

/**
 * Get the sentence exercise repository instance for the current platform
 */
export function getSentenceExerciseRepository(): SentenceExerciseRepository {
  if (!sentenceExerciseRepository) {
    if (Platform.OS === "web") {
      console.log("🌐 Initializing Dexie SentenceExerciseRepository for web platform");
      sentenceExerciseRepository = new DexieSentenceExerciseRepository();
    } else {
      console.log(`📱 Initializing SQLite SentenceExerciseRepository for ${Platform.OS} platform`);
      sentenceExerciseRepository = new SqliteSentenceExerciseRepository();
    }
  }
  return sentenceExerciseRepository;
}

/**
 * Get the translation attempt repository instance for the current platform
 */
export function getTranslationAttemptRepository(): TranslationAttemptRepository {
  if (!translationAttemptRepository) {
    if (Platform.OS === "web") {
      console.log("🌐 Initializing Dexie TranslationAttemptRepository for web platform");
      translationAttemptRepository = new DexieTranslationAttemptRepository();
    } else {
      console.log(`📱 Initializing SQLite TranslationAttemptRepository for ${Platform.OS} platform`);
      translationAttemptRepository = new SqliteTranslationAttemptRepository();
    }
  }
  return translationAttemptRepository;
}

/**
 * Get the translation session repository instance for the current platform
 */
export function getTranslationSessionRepository(): TranslationSessionRepository {
  if (!translationSessionRepository) {
    if (Platform.OS === "web") {
      console.log("🌐 Initializing Dexie TranslationSessionRepository for web platform");
      translationSessionRepository = new DexieTranslationSessionRepository();
    } else {
      console.log(`📱 Initializing SQLite TranslationSessionRepository for ${Platform.OS} platform`);
      translationSessionRepository = new SqliteTranslationSessionRepository();
    }
  }
  return translationSessionRepository;
} 