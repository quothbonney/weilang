/** * Global state management with Zustand */import React from 'react';import { create } from "zustand";
import { Word, Example, WordProfile, WordProfileDTO, ReviewQuality, ReviewSettings, ReviewSession, ReviewMode, SentenceExercise, TranslationAttempt, TranslationSession, TranslationEvaluation } from "../../domain/entities";
import { getWordRepository, getSentenceExerciseRepository, getTranslationAttemptRepository, getTranslationSessionRepository } from "../../platform/storageProvider";
import { AddWordUseCase } from "../../domain/usecases/addWord";
import { ReviewWordUseCase } from "../../domain/usecases/reviewWord";
import { GenerateExampleUseCase } from "../../domain/usecases/generateExample";
import { GenerateWordProfileUseCase } from "../../domain/usecases/generateWordProfile";
import { TogetherAdapter } from "../../infra/llm/togetherAdapter";
import { WordProfileService, WordProfileConfig } from "../../infra/services/wordProfileService";
import { SentenceTranslationService } from "../../infra/services/sentenceTranslationService";
import { storage } from "../../platform/storageUtils";
import { DEFAULT_REVIEW_SETTINGS, getCardPriority } from "../../domain/srs";
import { TOGETHER_KEY, LINGVANEX_KEY, OPENAI_KEY, UNIHAN_DB_PATH, STROKE_ORDER_BASE_URL } from '../../../env';

// Import 300 words from CSV data
import wordsData from '../../data/words_import.json';

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type ExampleGenerationMode = 'strict' | 'some-ood' | 'many-ood' | 'independent';

export type ModelOption = 'deepseek-ai/DeepSeek-V3' | 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo' | 'Qwen/Qwen2.5-72B-Instruct-Turbo' | 'Qwen/Qwen2.5-7B-Instruct-Turbo';

interface FlashcardSettings {
  showPinyin: boolean;
  deckFlipped: boolean; // true = show English, answer with Chinese; false = show Chinese, answer with English
  typingMode: boolean; // true = require typing in flipped mode; false = just show answer
  handwritingMode: boolean; // true = draw characters with stylus in flipped mode
  autoPlayTTS: boolean; // true = auto-play TTS when answer is revealed in en-to-zh mode
}

interface SessionTracking {
  startTime: number;
  reviewedWords: Array<{
    word: Word;
    previousStatus: string;
    previousEase: number;
    previousInterval: number;
    qualityRating: string;
    reviewedAt: number;
  }>;
  correctAnswers: number;
}

interface WeiLangStore {
  // State
  words: Word[];
  dueWords: Word[];
  isLoading: boolean;
  error: string | null;
  apiKey: string | null;
  ttsApiKey: string | null;
  hasImported: boolean;
  lastGeneratedExample: Example | null;
  lastGeneratedProfile: WordProfile | null;
  lastEnhancedProfile: WordProfileDTO | null;
  exampleGenerationMode: ExampleGenerationMode;
  selectedModel: ModelOption;
  flashcardSettings: FlashcardSettings;
  
  // Review system state
  reviewSettings: ReviewSettings;
  currentSession: ReviewSession | null;
  reviewMode: ReviewMode;
  sessionTracking: SessionTracking | null;

  // Services
  wordProfileService: WordProfileService | null;
  sentenceTranslationService: SentenceTranslationService | null;

  // Sentence translation state
  currentTranslationSession: TranslationSession | null;
  lastTranslationEvaluation: TranslationEvaluation | null;

  // Actions
  loadWords: () => Promise<void>;
  loadDueWords: () => Promise<void>;
  addWord: (params: { hanzi: string; pinyin: string; meaning: string }) => Promise<void>;
  reviewWord: (wordId: string, quality: ReviewQuality) => Promise<Word>;
  deleteWord: (wordId: string) => Promise<void>;
  setApiKey: (key: string | null) => void;
  setTtsApiKey: (key: string | null) => void;
  clearError: () => void;
  importWords: () => Promise<void>;
  generateExample: (wordId: string) => Promise<Example | null>;
    generateWordProfile: (wordId: string) => Promise<WordProfile | null>;  generateEnhancedProfile: (wordId: string) => Promise<WordProfileDTO | null>;  generateEnhancedProfileProgressive: (wordId: string, onUpdate?: (profile: WordProfileDTO) => void) => Promise<WordProfileDTO | null>;  setExampleGenerationMode: (mode: ExampleGenerationMode) => void;
  setSelectedModel: (model: ModelOption) => void;
  setFlashcardSettings: (settings: Partial<FlashcardSettings>) => void;
  initializeSettings: () => Promise<void>;
  initializeProfileService: () => void;
  
  // Review system actions
  startReviewSession: (mode: ReviewMode) => Promise<void>;
  getNextCard: () => Word | null;
  advanceSession: () => void;
  requeueCard: (card: Word) => void;
  updateReviewSettings: (settings: Partial<ReviewSettings>) => void;
  setReviewMode: (mode: ReviewMode) => void;

  // Session tracking actions
  startSessionTracking: () => void;
  addReviewedWord: (word: Word, previousState: { status: string; ease: number; interval: number }, quality: ReviewQuality) => void;
  getSessionSummary: () => { reviewedWords: SessionTracking['reviewedWords']; sessionStats: { totalReviewed: number; correctAnswers: number; sessionDuration: number } } | null;
  resetSessionTracking: () => void;

  // New profile service actions
  clearProfileCache: () => Promise<void>;
  getProfileCacheStats: () => Promise<{ count: number; memoryCount: number; totalSize: number }>;
  testProfileConnections: () => Promise<{ unihan: boolean; lingvanex: boolean; llm: boolean }>;

  // Sentence translation actions
  initializeSentenceTranslationService: () => void;
  startTranslationSession: (difficulty: 'beginner' | 'intermediate' | 'advanced', direction: 'en-to-zh' | 'zh-to-en', exerciseCount?: number) => Promise<TranslationSession>;
  submitTranslation: (sessionId: string, exerciseId: string, userTranslation: string) => Promise<{ attempt: TranslationAttempt; evaluation: TranslationEvaluation; isSessionComplete: boolean }>;
  getCurrentTranslationExercise: () => SentenceExercise | null;
  getTranslationSessionStats: (sessionId: string) => Promise<any>;
  getActiveTranslationSession: () => Promise<TranslationSession | null>;
}

const API_KEY_STORAGE_KEY = 'weilang_api_key';
const TTS_KEY_STORAGE_KEY = 'weilang_tts_key';
const GENERATION_MODE_STORAGE_KEY = 'weilang_generation_mode';
const SELECTED_MODEL_STORAGE_KEY = 'weilang_selected_model';
const FLASHCARD_SETTINGS_STORAGE_KEY = 'weilang_flashcard_settings';

const DEFAULT_FLASHCARD_SETTINGS: FlashcardSettings = {
  showPinyin: true,
  deckFlipped: false,
  typingMode: false, // Default to just showing answer, not typing
  handwritingMode: false, // Default to no drawing input
  autoPlayTTS: false, // Default to manual TTS
};

export const useStore = create<WeiLangStore>((set, get) => {
  // Helper function to get repository (lazy initialization)
  const getWordRepo = () => getWordRepository();
  
  return {
    // Initial state
    words: [],
    dueWords: [],
    isLoading: false,
    error: null,
    apiKey: null,
    ttsApiKey: null,
    hasImported: false,
    lastGeneratedExample: null,
    lastGeneratedProfile: null,
    lastEnhancedProfile: null,
    exampleGenerationMode: 'independent', // Default to independent for new users
    selectedModel: 'deepseek-ai/DeepSeek-V3',
    flashcardSettings: DEFAULT_FLASHCARD_SETTINGS,
    
    // Review system state
    reviewSettings: DEFAULT_REVIEW_SETTINGS,
    currentSession: null,
    reviewMode: 'mixed',
    sessionTracking: null,

    // Services
    wordProfileService: null,
    sentenceTranslationService: null,

    // Sentence translation state
    currentTranslationSession: null,
    lastTranslationEvaluation: null,

    // Load words from repository
    loadWords: async () => {
      set({ isLoading: true, error: null });
      try {
        const wordRepo = getWordRepo();
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
      try {
        const wordRepo = getWordRepo();
        const dueWords = await wordRepo.getCardsByPriority(50);
        set({ dueWords });
      } catch (error) {
        console.error("Failed to load due words:", error);
      }
    },

    // Add new word
    addWord: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const wordRepo = getWordRepo();
        const addWordUseCase = new AddWordUseCase(wordRepo);
        const word = await addWordUseCase.execute(params);
        const words = [...get().words, word];
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
        const wordRepo = getWordRepo();
        const reviewWordUseCase = new ReviewWordUseCase(wordRepo);
        const updatedWord = await reviewWordUseCase.execute({ wordId, quality });
        
        // Update words in state
        const words = get().words.map(w => 
          w.id === wordId ? updatedWord : w
        );
        set({ words, isLoading: false });
        
        return updatedWord;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to review word",
          isLoading: false 
        });
        throw error;
      }
    },

    // Delete word
    deleteWord: async (wordId) => {
      set({ isLoading: true, error: null });
      try {
        const wordRepo = getWordRepo();
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

    // Set API key and reinitialize services
    setApiKey: (key) => {
      set({ apiKey: key });
      // Reinitialize profile service with new API key
      get().initializeProfileService();
    },

    setTtsApiKey: (key) => {
      set({ ttsApiKey: key });
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
        const wordRepo = getWordRepo();
        // Check if we already have words in the database
        const existingWords = await wordRepo.listAll();
        if (existingWords.length > 0) {
          set({ hasImported: true, isLoading: false });
          return;
        }

        console.log(`📥 Starting import of ${wordsData.length} words...`);

        // Bulk import all words with error handling
        let importedCount = 0;
        for (const wordData of wordsData) {
          try {
            await wordRepo.save(wordData as Word);
            importedCount++;
          } catch (error) {
            console.error(`Failed to import word ${wordData.hanzi}:`, error);
            
            // If we get constraint errors, it might be corrupted data
            if (error instanceof Error && error.message.includes('constraint')) {
              console.log('🔄 Constraint error detected, clearing database and retrying...');
              
              // Clear the database and try again
              if (wordRepo.clearAllWords) {
                await wordRepo.clearAllWords();
                // Reset the loop to try importing again
                importedCount = 0;
                continue;
              }
            }
            throw error; // Re-throw if we can't handle it
          }
        }
        
        // Reload words
        const words = await wordRepo.listAll();
        set({ words, hasImported: true, isLoading: false });
        console.log(`✅ Successfully imported ${importedCount} words from CSV data`);
      } catch (error) {
        console.error('Import failed:', error);
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
        const wordRepo = getWordRepo();
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

    // Generate word profile
    generateWordProfile: async (wordId: string) => {
      const apiKey = get().apiKey;
      if (!apiKey) {
        set({ error: "API key not set. Please set it in settings." });
        return null;
      }

      set({ isLoading: true, error: null });
      try {
        const wordRepo = getWordRepo();
        const selectedModel = get().selectedModel;
        const togetherAdapter = new TogetherAdapter(apiKey, selectedModel);
        const useCase = new GenerateWordProfileUseCase(
          wordRepo,
          null as any, // We don't have profile repository yet  
          togetherAdapter
        );
        
        const profile = await useCase.execute(wordId);
        set({ lastGeneratedProfile: profile, isLoading: false });
        return profile;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to generate word profile",
          isLoading: false 
        });
        return null;
      }
    },

    // Generate enhanced profile    
    generateEnhancedProfile: async (wordId: string) => {      
      const { wordProfileService } = get();      
      if (!wordProfileService) {        
        set({ error: "Profile service not initialized. Please check your API keys." });        
        return null;      
      }      
      
      set({ isLoading: true, error: null });      
      try {
        const wordRepo = getWordRepo();        
        const word = await wordRepo.get(wordId);        
        if (!word) {          
          throw new Error("Word not found");        
        }        
        const profile = await wordProfileService.generateProfile(word);        
        set({ lastEnhancedProfile: profile, isLoading: false });        
        return profile;      
      } catch (error) {        
        set({           
          error: error instanceof Error ? error.message : "Failed to generate enhanced profile",          
          isLoading: false         
        });        
        return null;      
      }    
    },    
    
    // Generate enhanced profile progressively (API data first, LLM later)    
    generateEnhancedProfileProgressive: async (      
      wordId: string,       
      onUpdate?: (profile: WordProfileDTO) => void    
    ) => {      
      const { wordProfileService } = get();      
      if (!wordProfileService) {        
        set({ error: "Profile service not initialized. Please check your API keys." });        
        return null;      
      }      
      
      set({ isLoading: true, error: null });      
      try {
        const wordRepo = getWordRepo();        
        const word = await wordRepo.get(wordId);        
        if (!word) {          
          throw new Error("Word not found");        
        }        
        
        // Get partial profile immediately (API data only)        
        const partialProfile = await wordProfileService.generateProfileProgressive(          
          word,           
          (enhancedProfile) => {            
            // Update when LLM data is ready            
            set({ lastEnhancedProfile: enhancedProfile });            
            onUpdate?.(enhancedProfile);          
          }        
        );                
        
        set({ lastEnhancedProfile: partialProfile, isLoading: false });        
        return partialProfile;      
      } catch (error) {        
        set({           
          error: error instanceof Error ? error.message : "Failed to generate enhanced profile",          
          isLoading: false         
        });        
        return null;      
      }    
    },

    // Initialize profile service
    initializeProfileService: () => {
      const { apiKey } = get();
      
      console.log('🔍 Store: Initializing profile service with:', {
        hasStoreApiKey: !!apiKey,
        storeApiKeyLength: apiKey?.length || 0,
        hasTogetherKey: !!TOGETHER_KEY,
        togetherKeyLength: TOGETHER_KEY.length,
        hasLingvanexKey: !!LINGVANEX_KEY,
        lingvanexKeyLength: LINGVANEX_KEY.length,
        unihanDbPath: UNIHAN_DB_PATH
      });
      
      const config: WordProfileConfig = {
        togetherApiKey: apiKey || TOGETHER_KEY,
        lingvanexApiKey: LINGVANEX_KEY,
        unihanDbPath: UNIHAN_DB_PATH,
        enableCache: true,
        strokeOrderBaseUrl: STROKE_ORDER_BASE_URL
      };

      console.log('🔍 Store: Profile service config:', {
        hasTogetherApiKey: !!config.togetherApiKey,
        togetherApiKeyLength: config.togetherApiKey?.length || 0,
        hasLingvanexApiKey: !!config.lingvanexApiKey,
        lingvanexApiKeyLength: config.lingvanexApiKey?.length || 0,
        unihanDbPath: config.unihanDbPath,
        enableCache: config.enableCache
      });

      try {
        const service = new WordProfileService(config);
        set({ wordProfileService: service });
        console.log('🔍 Store: WordProfileService created successfully');
      } catch (error) {
        console.error('🔍 Store: Failed to create WordProfileService:', error);
        set({ error: 'Failed to initialize profile service' });
      }
    },

    // Profile service utility methods
    clearProfileCache: async () => {
      const { wordProfileService } = get();
      if (wordProfileService) {
        await wordProfileService.clearCache();
      }
    },

    getProfileCacheStats: async () => {
      const { wordProfileService } = get();
      if (wordProfileService) {
        return await wordProfileService.getCacheStats();
      }
      return { count: 0, memoryCount: 0, totalSize: 0 };
    },

    testProfileConnections: async () => {
      const { wordProfileService } = get();
      if (wordProfileService) {
        return await wordProfileService.testConnections();
      }
      return { unihan: false, lingvanex: false, llm: false };
    },

    // Set example generation mode
    setExampleGenerationMode: (mode: ExampleGenerationMode) => {
      set({ exampleGenerationMode: mode });
    },

    // Set selected model
    setSelectedModel: (model: ModelOption) => {
      set({ selectedModel: model });
    },

    // Set flashcard settings
    setFlashcardSettings: (settings: Partial<FlashcardSettings>) => {
      const current = get().flashcardSettings;
      const updated = { ...current, ...settings };
      set({ flashcardSettings: updated });
    },

    // Initialize settings
    initializeSettings: async () => {
      try {
        // Load API key
        const apiKey = await storage.getItem(API_KEY_STORAGE_KEY);
        if (apiKey) {
          set({ apiKey });
        }

        const ttsKey = await storage.getItem(TTS_KEY_STORAGE_KEY);
        if (ttsKey) {
          set({ ttsApiKey: ttsKey });
        }

        // Load generation mode
        const mode = await storage.getItem(GENERATION_MODE_STORAGE_KEY);
        if (mode) {
          set({ exampleGenerationMode: mode as ExampleGenerationMode });
        }

        // Load selected model
        const model = await storage.getItem(SELECTED_MODEL_STORAGE_KEY);
        if (model) {
          set({ selectedModel: model as ModelOption });
        }

        // Load flashcard settings
        const flashcardSettings = await storage.getItem(FLASHCARD_SETTINGS_STORAGE_KEY);
        if (flashcardSettings) {
          set({ flashcardSettings: JSON.parse(flashcardSettings) });
        }

        // Initialize profile service
        get().initializeProfileService();
        
        // Initialize sentence translation service
        get().initializeSentenceTranslationService();
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      }
    },

    // Review system methods
    startReviewSession: async (mode: ReviewMode) => {
      set({ isLoading: true, error: null });

      try {
        const wordRepo = getWordRepo();
        const settings = get().reviewSettings;

        let newCards: Word[] = [];
        let learningCards: Word[] = [];
        let reviewCards: Word[] = [];

        if (mode === 'mixed' || mode === 'new-only') {
          newCards = await wordRepo.listNewCards(settings.maxNewCardsPerDay);
        }
        if (mode === 'mixed' || mode === 'learning-only') {
          learningCards = await wordRepo.listLearningCards();
        }
        if (mode === 'mixed' || mode === 'review-only') {
          reviewCards = await wordRepo.listReviewCards(settings.maxReviewsPerDay);
        }

        const allCards = [...learningCards, ...newCards, ...reviewCards];
        allCards.sort((a, b) => getCardPriority(a) - getCardPriority(b));

        const batchSize = settings.batchSize;
        const initialBatch = allCards.slice(0, batchSize);
        const queue = allCards.slice(batchSize);

        const session: ReviewSession = {
          mode,
          newCards,
          learningCards,
          reviewCards,
          queue,
          currentBatch: initialBatch,
          batchIndex: 0,
          reviewed: 0,
          settings,
        };

        set({ currentSession: session, reviewMode: mode, isLoading: false });
        
        // Start session tracking
        set({ sessionTracking: { startTime: Date.now(), reviewedWords: [], correctAnswers: 0 } });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : 'Failed to start review session',
          isLoading: false,
        });
      }
    },

    getNextCard: () => {
      const session = get().currentSession;
      if (!session) return null;

      if (session.currentBatch.length === 0 && session.queue.length > 0) {
        const newBatch = session.queue.slice(0, session.settings.batchSize);
        const queue = session.queue.slice(newBatch.length);
        const batchIndex = session.batchIndex + 1;

        const updatedSession: ReviewSession = {
          ...session,
          currentBatch: newBatch,
          queue,
          batchIndex,
        };

        set({ currentSession: updatedSession });
        return newBatch[0] || null;
      }

      if (session.currentBatch.length === 0) return null;
      return session.currentBatch[0];
    },

    advanceSession: () => {
      const session = get().currentSession;
      if (!session) return;

      let batch = session.currentBatch.slice(1);
      let queue = session.queue;
      let batchIndex = session.batchIndex;
      const reviewed = session.reviewed + 1;

      if (batch.length === 0 && queue.length > 0) {
        batch = queue.slice(0, session.settings.batchSize);
        queue = queue.slice(batch.length);
        batchIndex += 1;
      }

      set({
        currentSession: {
          ...session,
          currentBatch: batch,
          queue,
          batchIndex,
          reviewed,
        },
      });
    },

    requeueCard: (card: Word) => {
      const session = get().currentSession;
      if (!session) return;

      let batch = session.currentBatch.slice(1);
      let queue = session.queue;
      let batchIndex = session.batchIndex;

      if (batch.length === 0 && queue.length > 0) {
        batch = queue.slice(0, session.settings.batchSize);
        queue = queue.slice(batch.length);
        batchIndex += 1;
      }

      const updatedBatch = [...batch, card];

      set({
        currentSession: {
          ...session,
          currentBatch: updatedBatch,
          queue,
          batchIndex,
        },
      });
    },

    updateReviewSettings: (settings: Partial<ReviewSettings>) => {
      const current = get().reviewSettings;
      const updated = { ...current, ...settings };
      set({ reviewSettings: updated });
    },

    setReviewMode: (mode: ReviewMode) => {
      set({ reviewMode: mode });
    },

    // Session tracking actions
    startSessionTracking: () => {
      set({ sessionTracking: { startTime: Date.now(), reviewedWords: [], correctAnswers: 0 } });
    },

    addReviewedWord: (word: Word, previousState: { status: string; ease: number; interval: number }, quality: ReviewQuality) => {
      const sessionTracking = get().sessionTracking;
      if (!sessionTracking) return;

      const reviewedWord = {
        word,
        previousStatus: previousState.status,
        previousEase: previousState.ease,
        previousInterval: previousState.interval,
        qualityRating: quality,
        reviewedAt: Date.now(),
      };

      set({
        sessionTracking: {
          ...sessionTracking,
          reviewedWords: [...sessionTracking.reviewedWords, reviewedWord],
          correctAnswers: sessionTracking.correctAnswers + (quality !== 'again' ? 1 : 0),
        },
      });
    },

    getSessionSummary: () => {
      const sessionTracking = get().sessionTracking;
      if (!sessionTracking) return null;

      const reviewedWords = sessionTracking.reviewedWords;
      const sessionStats = {
        totalReviewed: reviewedWords.length,
        correctAnswers: sessionTracking.correctAnswers,
        sessionDuration: Date.now() - sessionTracking.startTime,
      };

      return { reviewedWords, sessionStats };
    },

    resetSessionTracking: () => {
      set({ sessionTracking: null });
    },

    // Sentence translation actions
    initializeSentenceTranslationService: () => {
      const { apiKey, selectedModel } = get();
      
      if (!apiKey && !TOGETHER_KEY) {
        console.warn('No API key available for sentence translation service');
        return;
      }

      try {
        const wordRepo = getWordRepo();
        const exerciseRepo = getSentenceExerciseRepository();
        const attemptRepo = getTranslationAttemptRepository();
        const sessionRepo = getTranslationSessionRepository();
        // Use Qwen/Qwen2.5-7B-Instruct-Turbo for translation for better performance
        const translationModel = 'Qwen/Qwen2.5-7B-Instruct-Turbo';
        const llmAdapter = new TogetherAdapter(apiKey || TOGETHER_KEY, translationModel);

        const service = new SentenceTranslationService({
          wordRepository: wordRepo,
          sentenceExerciseRepository: exerciseRepo,
          translationAttemptRepository: attemptRepo,
          translationSessionRepository: sessionRepo,
          llmAdapter
        });

        set({ sentenceTranslationService: service });
        console.log('✅ Sentence translation service initialized');
      } catch (error) {
        console.error('Failed to initialize sentence translation service:', error);
        set({ error: 'Failed to initialize sentence translation service' });
      }
    },

    startTranslationSession: async (difficulty, direction, exerciseCount = 5) => {
      const { sentenceTranslationService } = get();
      
      if (!sentenceTranslationService) {
        get().initializeSentenceTranslationService();
        const service = get().sentenceTranslationService;
        if (!service) {
          throw new Error('Failed to initialize sentence translation service');
        }
      }

      set({ isLoading: true, error: null });
      
      try {
        const session = await sentenceTranslationService!.startSession(difficulty, direction, exerciseCount);
        set({ currentTranslationSession: session, isLoading: false });
        return session;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to start translation session",
          isLoading: false 
        });
        throw error;
      }
    },

    submitTranslation: async (sessionId, exerciseId, userTranslation) => {
      const { sentenceTranslationService } = get();
      
      if (!sentenceTranslationService) {
        throw new Error('Sentence translation service not initialized');
      }

      set({ isLoading: true, error: null });
      
      try {
        const result = await sentenceTranslationService.submitTranslation(sessionId, exerciseId, userTranslation);
        
        // Update the current session if it matches
        const currentSession = get().currentTranslationSession;
        if (currentSession && currentSession.id === sessionId) {
          const updatedSession = await sentenceTranslationService.getActiveSession();
          set({ currentTranslationSession: updatedSession });
        }
        
        set({ lastTranslationEvaluation: result.evaluation, isLoading: false });
        return result;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to submit translation",
          isLoading: false 
        });
        throw error;
      }
    },

    getCurrentTranslationExercise: () => {
      const { sentenceTranslationService, currentTranslationSession } = get();
      
      if (!sentenceTranslationService || !currentTranslationSession) {
        return null;
      }

      return sentenceTranslationService.getCurrentExercise(currentTranslationSession);
    },

    getTranslationSessionStats: async (sessionId) => {
      const { sentenceTranslationService } = get();
      
      if (!sentenceTranslationService) {
        throw new Error('Sentence translation service not initialized');
      }

      return sentenceTranslationService.getSessionStats(sessionId);
    },

    getActiveTranslationSession: async () => {
      const { sentenceTranslationService } = get();
      
      if (!sentenceTranslationService) {
        return null;
      }

      const session = await sentenceTranslationService.getActiveSession();
      set({ currentTranslationSession: session });
      return session;
    },
  };
});

// Helper hook for accessing the enhanced profile
export const useEnhancedProfile = (wordId: string) => {
  const { generateEnhancedProfile, lastEnhancedProfile, isLoading, error } = useStore();
  
  const [profile, setProfile] = React.useState<WordProfileDTO | null>(null);
  
  React.useEffect(() => {
    if (wordId) {
      generateEnhancedProfile(wordId).then(setProfile);
    }
  }, [wordId, generateEnhancedProfile]);

  return {
    profile: profile || lastEnhancedProfile,
    isLoading,
    error,
    refresh: () => generateEnhancedProfile(wordId).then(setProfile)
  };
}; 