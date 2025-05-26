import { TogetherAdapter } from '../../../infra/llm/togetherAdapter';
import { WordProfileService, WordProfileConfig } from '../../../infra/services/wordProfileService';
import { GenerateExampleUseCase } from '../../../domain/usecases/generateExample';
import { GenerateWordProfileUseCase } from '../../../domain/usecases/generateWordProfile';
import { getWordRepository } from '../../../platform/storageProvider';
import { TOGETHER_KEY, LINGVANEX_KEY, UNIHAN_DB_PATH, STROKE_ORDER_BASE_URL } from '../../../../env';
import type { WeiLangStore } from '../useStore';
import type { Example, WordProfile, WordProfileDTO } from '../../../domain/entities';

export interface ProfileSlice {
  lastGeneratedExample: Example | null;
  lastGeneratedProfile: WordProfile | null;
  lastEnhancedProfile: WordProfileDTO | null;
  wordProfileService: WordProfileService | null;
  generateExample: (wordId: string) => Promise<Example | null>;
  generateWordProfile: (wordId: string) => Promise<WordProfile | null>;
  generateEnhancedProfile: (wordId: string) => Promise<WordProfileDTO | null>;
  generateEnhancedProfileProgressive: (wordId: string, onUpdate?: (p: WordProfileDTO) => void) => Promise<WordProfileDTO | null>;
  initializeProfileService: () => void;
  clearProfileCache: () => Promise<void>;
  getProfileCacheStats: () => Promise<{ count: number; memoryCount: number; totalSize: number }>;
  testProfileConnections: () => Promise<{ unihan: boolean; lingvanex: boolean; llm: boolean }>;
}

export const createProfileSlice = (set: any, get: any): ProfileSlice => ({
  lastGeneratedExample: null,
  lastGeneratedProfile: null,
  lastEnhancedProfile: null,
  wordProfileService: null,

  generateExample: async (wordId) => {
    const apiKey = get().apiKey;
    if (!apiKey) {
      set({ error: 'API key not set. Please set it in settings.' });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const adapter = new TogetherAdapter(apiKey, get().selectedModel);
      const useCase = new GenerateExampleUseCase(repo, null as any, adapter);
      const example = await useCase.execute(wordId, get().exampleGenerationMode);
      set({ lastGeneratedExample: example, isLoading: false });
      return example;
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate example', isLoading: false });
      return null;
    }
  },

  generateWordProfile: async (wordId) => {
    const apiKey = get().apiKey;
    if (!apiKey) {
      set({ error: 'API key not set. Please set it in settings.' });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const adapter = new TogetherAdapter(apiKey, get().selectedModel);
      const useCase = new GenerateWordProfileUseCase(repo, null as any, adapter);
      const profile = await useCase.execute(wordId);
      set({ lastGeneratedProfile: profile, isLoading: false });
      return profile;
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate word profile', isLoading: false });
      return null;
    }
  },

  generateEnhancedProfile: async (wordId) => {
    const { wordProfileService } = get();
    if (!wordProfileService) {
      set({ error: 'Profile service not initialized. Please check your API keys.' });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const word = await repo.get(wordId);
      if (!word) throw new Error('Word not found');
      const profile = await wordProfileService.generateProfile(word);
      set({ lastEnhancedProfile: profile, isLoading: false });
      return profile;
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate enhanced profile', isLoading: false });
      return null;
    }
  },

  generateEnhancedProfileProgressive: async (wordId, onUpdate) => {
    const { wordProfileService } = get();
    if (!wordProfileService) {
      set({ error: 'Profile service not initialized. Please check your API keys.' });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const word = await repo.get(wordId);
      if (!word) throw new Error('Word not found');
      const partial = await wordProfileService.generateProfileProgressive(word, (p) => {
        set({ lastEnhancedProfile: p });
        onUpdate?.(p);
      });
      set({ lastEnhancedProfile: partial, isLoading: false });
      return partial;
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate enhanced profile', isLoading: false });
      return null;
    }
  },

  initializeProfileService: () => {
    const { apiKey } = get();
    const config: WordProfileConfig = {
      togetherApiKey: apiKey || TOGETHER_KEY,
      lingvanexApiKey: LINGVANEX_KEY,
      unihanDbPath: UNIHAN_DB_PATH,
      enableCache: true,
      strokeOrderBaseUrl: STROKE_ORDER_BASE_URL
    };
    try {
      const service = new WordProfileService(config);
      set({ wordProfileService: service });
    } catch (error) {
      console.error('Failed to create WordProfileService:', error);
      set({ error: 'Failed to initialize profile service' });
    }
  },

  clearProfileCache: async () => {
    const { wordProfileService } = get();
    if (wordProfileService) await wordProfileService.clearCache();
  },

  getProfileCacheStats: async () => {
    const { wordProfileService } = get();
    if (wordProfileService) return wordProfileService.getCacheStats();
    return { count: 0, memoryCount: 0, totalSize: 0 };
  },

  testProfileConnections: async () => {
    const { wordProfileService } = get();
    if (wordProfileService) return wordProfileService.testConnections();
    return { unihan: false, lingvanex: false, llm: false };
  }
});
