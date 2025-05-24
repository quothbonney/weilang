/**
 * Global state management with Zustand
 */

import { create } from "zustand";
import { Word, Example, ReviewQuality, ReviewSettings, ReviewSession, ReviewMode } from "../../domain/entities";
import { getWordRepository } from "../../platform/storageProvider";
import { AddWordUseCase } from "../../domain/usecases/addWord";
import { ReviewWordUseCase } from "../../domain/usecases/reviewWord";
import { GenerateExampleUseCase } from "../../domain/usecases/generateExample";
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
        
        // Get all available cards (not just due ones for now)
        const allWords = await wordRepo.listAll();
        
        // Filter cards based on availability and mode
        let availableNewCards: Word[] = [];
        let availableLearningCards: Word[] = [];
        let availableReviewCards: Word[] = [];
        
        if (mode !== 'review-only') {
          // New cards - status is 'new'
          availableNewCards = allWords
            .filter(w => w.status === 'new')
            .slice(0, settings.maxNewCardsPerDay);
        }
        
        if (mode !== 'new-only') {
          // Learning cards - have learningStep > 0 and are due
          const now = Date.now();
          availableLearningCards = allWords.filter(w => 
            w.learningStep > 0 && 
            w.learningDue !== undefined && 
            w.learningDue <= now
          );
          
          // Review cards - status is 'review' and are due
          availableReviewCards = allWords.filter(w => 
            w.status === 'review' && 
            w.due <= now
          );
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
        
        // Fill first batch with priority: learning > new > review
        const batchCards: Word[] = [];
        
        // Add learning cards first (highest priority)
        batchCards.push(...session.learningCards.slice(0, settings.batchSize));
        
        // Add new cards if there's space
        const remainingSpace = settings.batchSize - batchCards.length;
        if (remainingSpace > 0) {
          batchCards.push(...session.newCards.slice(0, remainingSpace));
        }
        
        // Add review cards if there's still space
        const finalSpace = settings.batchSize - batchCards.length;
        if (finalSpace > 0) {
          batchCards.push(...session.reviewCards.slice(0, finalSpace));
        }
        
        session.currentBatch = batchCards;
        
        console.log('Session created:', {
          mode,
          totalCards: allWords.length,
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
    
    // Remove current card from batch and update session
    advanceSession: () => {
      const session = get().currentSession;
      if (!session) return;
      
      // Remove the first card from current batch
      const updatedSession = {
        ...session,
        currentBatch: session.currentBatch.slice(1),
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