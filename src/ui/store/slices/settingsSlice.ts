import { storage } from '../../../platform/storageUtils';
import type { WeiLangStore } from '../useStore';
import type { ExampleGenerationMode, ModelOption } from '../../../infra/llm/togetherAdapter';
import type { FlashcardSettings } from '../types';

const API_KEY_STORAGE_KEY = 'weilang_api_key';
const TTS_KEY_STORAGE_KEY = 'weilang_tts_key';
const GENERATION_MODE_STORAGE_KEY = 'weilang_generation_mode';
const SELECTED_MODEL_STORAGE_KEY = 'weilang_selected_model';
const FLASHCARD_SETTINGS_STORAGE_KEY = 'weilang_flashcard_settings';

const DEFAULT_FLASHCARD_SETTINGS: FlashcardSettings = {
  showPinyin: true,
  deckFlipped: false,
  typingMode: false,
  handwritingMode: false,
  autoPlayTTS: false,
};

export interface SettingsSlice {
  apiKey: string | null;
  ttsApiKey: string | null;
  exampleGenerationMode: ExampleGenerationMode;
  selectedModel: ModelOption;
  flashcardSettings: FlashcardSettings;
  setApiKey: (key: string | null) => void;
  setTtsApiKey: (key: string | null) => void;
  setExampleGenerationMode: (mode: ExampleGenerationMode) => void;
  setSelectedModel: (model: ModelOption) => void;
  setFlashcardSettings: (settings: Partial<FlashcardSettings>) => void;
  clearError: () => void;
  initializeSettings: () => Promise<void>;
}

export const createSettingsSlice = (set: any, get: any): SettingsSlice => ({
  apiKey: null,
  ttsApiKey: null,
  exampleGenerationMode: 'independent',
  selectedModel: 'deepseek-ai/DeepSeek-V3',
  flashcardSettings: DEFAULT_FLASHCARD_SETTINGS,

  setApiKey: (key) => {
    set({ apiKey: key });
    get().initializeProfileService();
  },

  setTtsApiKey: (key) => {
    set({ ttsApiKey: key });
  },

  setExampleGenerationMode: (mode) => set({ exampleGenerationMode: mode }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  setFlashcardSettings: (settings) => {
    const current = get().flashcardSettings;
    set({ flashcardSettings: { ...current, ...settings } });
  },

  clearError: () => set({ error: null }),

  initializeSettings: async () => {
    try {
      const apiKey = await storage.getItem(API_KEY_STORAGE_KEY);
      if (apiKey) set({ apiKey });

      const ttsKey = await storage.getItem(TTS_KEY_STORAGE_KEY);
      if (ttsKey) set({ ttsApiKey: ttsKey });

      const mode = await storage.getItem(GENERATION_MODE_STORAGE_KEY);
      if (mode) set({ exampleGenerationMode: mode as ExampleGenerationMode });

      const model = await storage.getItem(SELECTED_MODEL_STORAGE_KEY);
      if (model) set({ selectedModel: model as ModelOption });

      const flashcardSettings = await storage.getItem(FLASHCARD_SETTINGS_STORAGE_KEY);
      if (flashcardSettings) set({ flashcardSettings: JSON.parse(flashcardSettings) });

      get().initializeProfileService();
      get().initializeSentenceTranslationService();
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }
  },
});
