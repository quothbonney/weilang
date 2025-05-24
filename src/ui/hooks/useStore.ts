/**
 * Global state management with Zustand
 */

import { create } from "zustand";
import { Word } from "../../domain/entities";
import { getWordRepository } from "../../platform/storageProvider";
import { AddWordUseCase } from "../../domain/usecases/addWord";
import { ReviewWordUseCase } from "../../domain/usecases/reviewWord";
import { ReviewQuality } from "../../domain/entities";

interface WeiLangStore {
  // State
  words: Word[];
  dueWords: Word[];
  isLoading: boolean;
  error: string | null;
  apiKey: string | null;

  // Actions
  loadWords: () => Promise<void>;
  loadDueWords: () => Promise<void>;
  addWord: (params: { hanzi: string; pinyin: string; meaning: string }) => Promise<void>;
  reviewWord: (wordId: string, quality: ReviewQuality) => Promise<void>;
  deleteWord: (wordId: string) => Promise<void>;
  setApiKey: (key: string | null) => void;
  clearError: () => void;
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
  };
}); 