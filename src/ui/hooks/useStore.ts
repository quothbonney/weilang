/**
 * Global state management with Zustand
 */

import { create } from "zustand";
import { Word, Example, ReviewQuality } from "../../domain/entities";
import { getWordRepository } from "../../platform/storageProvider";
import { AddWordUseCase } from "../../domain/usecases/addWord";
import { ReviewWordUseCase } from "../../domain/usecases/reviewWord";
import { GenerateExampleUseCase } from "../../domain/usecases/generateExample";
import { TogetherAdapter } from "../../infra/llm/togetherAdapter";

// Sample words for initial seeding
const SAMPLE_WORDS = [
  { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "hello" },
  { hanzi: "谢谢", pinyin: "xiè xie", meaning: "thank you" },
  { hanzi: "再见", pinyin: "zài jiàn", meaning: "goodbye" },
  { hanzi: "水", pinyin: "shuǐ", meaning: "water" },
  { hanzi: "吃", pinyin: "chī", meaning: "to eat" },
  { hanzi: "喝", pinyin: "hē", meaning: "to drink" },
  { hanzi: "大", pinyin: "dà", meaning: "big" },
  { hanzi: "小", pinyin: "xiǎo", meaning: "small" },
  { hanzi: "好", pinyin: "hǎo", meaning: "good" },
  { hanzi: "不", pinyin: "bù", meaning: "not" },
];

interface WeiLangStore {
  // State
  words: Word[];
  dueWords: Word[];
  isLoading: boolean;
  error: string | null;
  apiKey: string | null;
  hasSeeded: boolean;
  lastGeneratedExample: Example | null;

  // Actions
  loadWords: () => Promise<void>;
  loadDueWords: () => Promise<void>;
  addWord: (params: { hanzi: string; pinyin: string; meaning: string }) => Promise<void>;
  reviewWord: (wordId: string, quality: ReviewQuality) => Promise<void>;
  deleteWord: (wordId: string) => Promise<void>;
  setApiKey: (key: string | null) => void;
  clearError: () => void;
  seedDatabase: () => Promise<void>;
  generateExample: (wordId: string) => Promise<Example | null>;
}

export const useStore = create<WeiLangStore>((set, get) => {
  const wordRepo = getWordRepository();
  const addWordUseCase = new AddWordUseCase(wordRepo);
  const reviewWordUseCase = new ReviewWordUseCase(wordRepo);

  return {
    // Initial state
    words: [],
    dueWords: [],
    isLoading: false,
    error: null,
    apiKey: null,
    hasSeeded: false,
    lastGeneratedExample: null,

    // Load all words
    loadWords: async () => {
      set({ isLoading: true, error: null });
      try {
        const words = await wordRepo.listAll();
        set({ words, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to load words",
          isLoading: false 
        });
      }
    },

    // Load due words
    loadDueWords: async () => {
      set({ isLoading: true, error: null });
      try {
        const dueWords = await wordRepo.listDue();
        set({ dueWords, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to load due words",
          isLoading: false 
        });
      }
    },

    // Add new word
    addWord: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const newWord = await addWordUseCase.execute(params);
        const words = [...get().words, newWord];
        set({ words, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to add word",
          isLoading: false 
        });
      }
    },

    // Review word
    reviewWord: async (wordId, quality) => {
      set({ isLoading: true, error: null });
      try {
        const updatedWord = await reviewWordUseCase.execute({ wordId, quality });
        const words = get().words.map(w => w.id === wordId ? updatedWord : w);
        const dueWords = get().dueWords.filter(w => w.id !== wordId);
        set({ words, dueWords, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to review word",
          isLoading: false 
        });
      }
    },

    // Delete word
    deleteWord: async (wordId) => {
      set({ isLoading: true, error: null });
      try {
        await wordRepo.delete(wordId);
        const words = get().words.filter(w => w.id !== wordId);
        const dueWords = get().dueWords.filter(w => w.id !== wordId);
        set({ words, dueWords, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to delete word",
          isLoading: false 
        });
      }
    },

    // Set API key
    setApiKey: (key) => {
      set({ apiKey: key });
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Seed database
    seedDatabase: async () => {
      if (get().hasSeeded) return;
      
      set({ isLoading: true, error: null });
      try {
        // Add each sample word
        for (const word of SAMPLE_WORDS) {
          await addWordUseCase.execute(word);
        }
        
        // Reload words
        const words = await wordRepo.listAll();
        set({ words, hasSeeded: true, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to seed database",
          isLoading: false 
        });
      }
    },

    // Generate example
    generateExample: async (wordId: string) => {
      const apiKey = get().apiKey;
      if (!apiKey) {
        set({ error: "API key not set. Please set it in settings." });
        return null;
      }

      set({ isLoading: true, error: null });
      try {
        const togetherAdapter = new TogetherAdapter(apiKey);
        const generateExampleUseCase = new GenerateExampleUseCase(
          wordRepo,
          null as any, // We don't have example repository yet
          togetherAdapter
        );
        
        const example = await generateExampleUseCase.execute(wordId);
        set({ lastGeneratedExample: example, isLoading: false });
        return example;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to generate example",
          isLoading: false 
        });
        return null;
      }
    },
  };
}); 