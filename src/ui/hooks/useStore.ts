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
import { storage } from "../../platform/storageUtils";

// Import 300 words from CSV data
import wordsData from '../../data/words_import.json';

export type ExampleGenerationMode = 'strict' | 'some-ood' | 'many-ood' | 'independent';

export type ModelOption = 'deepseek-ai/DeepSeek-V3' | 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo' | 'Qwen/Qwen2.5-72B-Instruct-Turbo';

interface WeiLangStore {
  // State
  words: Word[];
  dueWords: Word[];
  isLoading: boolean;
  error: string | null;
  apiKey: string | null;
  hasImported: boolean;
  lastGeneratedExample: Example | null;
  exampleGenerationMode: ExampleGenerationMode;
  selectedModel: ModelOption;

  // Actions
  loadWords: () => Promise<void>;
  loadDueWords: () => Promise<void>;
  addWord: (params: { hanzi: string; pinyin: string; meaning: string }) => Promise<void>;
  reviewWord: (wordId: string, quality: ReviewQuality) => Promise<void>;
  deleteWord: (wordId: string) => Promise<void>;
  setApiKey: (key: string | null) => void;
  clearError: () => void;
  importWords: () => Promise<void>;
  generateExample: (wordId: string) => Promise<Example | null>;
  setExampleGenerationMode: (mode: ExampleGenerationMode) => void;
  setSelectedModel: (model: ModelOption) => void;
  initializeSettings: () => Promise<void>;
}

const API_KEY_STORAGE_KEY = 'weilang_api_key';
const GENERATION_MODE_STORAGE_KEY = 'weilang_generation_mode';
const SELECTED_MODEL_STORAGE_KEY = 'weilang_selected_model';

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
    hasImported: false,
    lastGeneratedExample: null,
    exampleGenerationMode: 'independent', // Default to independent for new users
    selectedModel: 'deepseek-ai/DeepSeek-V3',

    // Initialize settings from storage and .env
    initializeSettings: async () => {
      try {
        // Load API key from storage first, then .env as fallback
        let apiKey = await storage.getItem(API_KEY_STORAGE_KEY);
        if (!apiKey) {
          // Try to load from .env
          try {
            const envModule = await import("../../../env");
            if (envModule.TOGETHER_KEY) {
              apiKey = envModule.TOGETHER_KEY;
              // Save to storage for persistence
              if (apiKey) {
                await storage.setItem(API_KEY_STORAGE_KEY, apiKey);
              }
            }
          } catch (e) {
            console.log("No .env file found or TOGETHER_KEY not set");
          }
        }
        
        if (apiKey) {
          set({ apiKey });
        }

        // Load generation mode
        const storedMode = await storage.getItem(GENERATION_MODE_STORAGE_KEY);
        if (storedMode) {
          set({ exampleGenerationMode: storedMode as ExampleGenerationMode });
        }

        // Load selected model
        const storedModel = await storage.getItem(SELECTED_MODEL_STORAGE_KEY);
        if (storedModel) {
          set({ selectedModel: storedModel as ModelOption });
        }
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      }
    },

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

    // Import words from CSV data
    importWords: async () => {
      if (get().hasImported) return;
      
      set({ isLoading: true, error: null });
      try {
        // Check if we already have words in the database
        const existingWords = await wordRepo.listAll();
        if (existingWords.length > 0) {
          set({ hasImported: true, isLoading: false });
          return;
        }

        // Bulk import all words
        for (const wordData of wordsData) {
          await wordRepo.save(wordData as Word);
        }
        
        // Reload words
        const words = await wordRepo.listAll();
        set({ words, hasImported: true, isLoading: false });
        console.log(`Successfully imported ${wordsData.length} words from CSV data`);
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to import words",
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
        const selectedModel = get().selectedModel;
        const togetherAdapter = new TogetherAdapter(apiKey, selectedModel);
        const generateExampleUseCase = new GenerateExampleUseCase(
          wordRepo,
          null as any, // We don't have example repository yet
          togetherAdapter
        );
        
        const mode = get().exampleGenerationMode;
        const example = await generateExampleUseCase.execute(wordId, mode);
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

    // Set example generation mode
    setExampleGenerationMode: (mode: ExampleGenerationMode) => {
      set({ exampleGenerationMode: mode });
    },

    // Set selected model
    setSelectedModel: (model: ModelOption) => {
      set({ selectedModel: model });
    },
  };
}); 