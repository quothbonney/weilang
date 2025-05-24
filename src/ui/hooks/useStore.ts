/**
 * Global state management with Zustand
 */

import { create } from "zustand";
import { Word, Example, WordProfile, ReviewQuality, ReviewSettings, ReviewSession, ReviewMode } from "../../domain/entities";
import { getWordRepository } from "../../platform/storageProvider";
import { AddWordUseCase } from "../../domain/usecases/addWord";
import { ReviewWordUseCase } from "../../domain/usecases/reviewWord";
import { GenerateExampleUseCase } from "../../domain/usecases/generateExample";
import { GenerateWordProfileUseCase } from "../../domain/usecases/generateWordProfile";
import { TogetherAdapter } from "../../infra/llm/togetherAdapter";
import { storage } from "../../platform/storageUtils";
import { DEFAULT_REVIEW_SETTINGS } from "../../domain/srs";

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
  lastGeneratedProfile: WordProfile | null;
  exampleGenerationMode: ExampleGenerationMode;
  selectedModel: ModelOption;
  
  // Review system state
  reviewSettings: ReviewSettings;
  currentSession: ReviewSession | null;
  reviewMode: ReviewMode;

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
  generateWordProfile: (wordId: string) => Promise<WordProfile | null>;
  setExampleGenerationMode: (mode: ExampleGenerationMode) => void;
  setSelectedModel: (model: ModelOption) => void;
  initializeSettings: () => Promise<void>;
  
  // Review system actions
  startReviewSession: (mode: ReviewMode) => Promise<void>;
  getNextCard: () => Word | null;
  advanceSession: () => void;
  updateReviewSettings: (settings: Partial<ReviewSettings>) => void;
  setReviewMode: (mode: ReviewMode) => void;
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
    lastGeneratedProfile: null,
    exampleGenerationMode: 'independent', // Default to independent for new users
    selectedModel: 'deepseek-ai/DeepSeek-V3',
    
    // Review system state
    reviewSettings: DEFAULT_REVIEW_SETTINGS,
    currentSession: null,
    reviewMode: 'mixed',

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

    // Generate comprehensive word profile
    generateWordProfile: async (wordId: string) => {
      const apiKey = get().apiKey;
      if (!apiKey) {
        set({ error: "API key not set. Please set it in settings." });
        return null;
      }

      set({ isLoading: true, error: null });
      try {
        const selectedModel = get().selectedModel;
        const adapter = new TogetherAdapter(apiKey, selectedModel);
        const useCase = new GenerateWordProfileUseCase(
          wordRepo,
          null as any, // no repository implementation yet
          adapter
        );

        const profile = await useCase.execute(wordId);
        set({ lastGeneratedProfile: profile, isLoading: false });
        return profile;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to generate profile",
          isLoading: false,
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
    
    // Review system actions
    startReviewSession: async (mode: ReviewMode) => {
      set({ isLoading: true, error: null });
      try {
        const settings = get().reviewSettings;
        
        // Load cards from repository according to mode
        let availableNewCards: Word[] = [];
        let availableLearningCards: Word[] = [];
        let availableReviewCards: Word[] = [];

        if (mode !== 'review-only') {
          availableNewCards = await wordRepo.listNewCards(settings.maxNewCardsPerDay);
        }

        if (mode !== 'new-only') {
          availableLearningCards = await wordRepo.listLearningCards();
          availableReviewCards = await wordRepo.listReviewCards(settings.maxReviewsPerDay);
        }
        
        // For learning-only mode, only show learning cards
        if (mode === 'learning-only') {
          availableNewCards = [];
          availableReviewCards = [];
        }
        
        // Create session based on mode
        const session: ReviewSession = {
          mode,
          newCards: availableNewCards,
          learningCards: availableLearningCards,
          reviewCards: availableReviewCards,
          currentBatch: [],
          batchIndex: 0,
          reviewed: 0,
          settings,
        };
        
        // Helper to fill a batch in priority order
        const fillBatch = () => {
          const batch: Word[] = [];
          while (batch.length < settings.batchSize && session.learningCards.length > 0) {
            batch.push(session.learningCards.shift()!);
          }
          while (batch.length < settings.batchSize && session.newCards.length > 0) {
            batch.push(session.newCards.shift()!);
          }
          while (batch.length < settings.batchSize && session.reviewCards.length > 0) {
            batch.push(session.reviewCards.shift()!);
          }
          return batch;
        };

        session.currentBatch = fillBatch();
        
        console.log('Session created:', {
          mode,
          totalCards: session.newCards.length + session.learningCards.length + session.reviewCards.length,
          newCards: session.newCards.length,
          learningCards: session.learningCards.length,
          reviewCards: session.reviewCards.length,
          batchSize: session.currentBatch.length
        });
        
        set({ currentSession: session, reviewMode: mode, isLoading: false });
      } catch (error) {
        console.error('Failed to start review session:', error);
        set({ 
          error: error instanceof Error ? error.message : "Failed to start review session",
          isLoading: false 
        });
      }
    },
    
    getNextCard: () => {
      const session = get().currentSession;
      if (!session || session.currentBatch.length === 0) {
        return null;
      }
      
      return session.currentBatch[0];
    },
    
    // Remove current card from batch and load next when needed
    advanceSession: () => {
      const session = get().currentSession;
      if (!session) return;

      let { newCards, learningCards, reviewCards, currentBatch, settings, batchIndex } = session;

      const current = currentBatch.shift();
      if (current) {
        newCards = newCards.filter(w => w.id !== current.id);
        learningCards = learningCards.filter(w => w.id !== current.id);
        reviewCards = reviewCards.filter(w => w.id !== current.id);
      }

      if (currentBatch.length === 0) {
        batchIndex += 1;

        const fillBatch = () => {
          while (currentBatch.length < settings.batchSize && learningCards.length > 0) {
            currentBatch.push(learningCards.shift()!);
          }
          while (currentBatch.length < settings.batchSize && newCards.length > 0) {
            currentBatch.push(newCards.shift()!);
          }
          while (currentBatch.length < settings.batchSize && reviewCards.length > 0) {
            currentBatch.push(reviewCards.shift()!);
          }
        };

        fillBatch();
      }

      const updatedSession: ReviewSession = {
        ...session,
        newCards,
        learningCards,
        reviewCards,
        currentBatch,
        batchIndex,
        reviewed: session.reviewed + 1,
      };

      set({ currentSession: updatedSession });
    },
    
    updateReviewSettings: (newSettings: Partial<ReviewSettings>) => {
      const currentSettings = get().reviewSettings;
      set({ reviewSettings: { ...currentSettings, ...newSettings } });
    },
    
    setReviewMode: (mode: ReviewMode) => {
      set({ reviewMode: mode });
    },
  };
}); 