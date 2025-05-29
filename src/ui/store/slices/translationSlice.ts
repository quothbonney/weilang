import { getWordRepository, getSentenceExerciseRepository, getTranslationAttemptRepository, getTranslationSessionRepository } from '../../../platform/storageProvider';
import { SentenceTranslationService } from '../../../infra/services/sentenceTranslationService';
import { TogetherAdapter } from '../../../infra/llm/togetherAdapter';
import { TOGETHER_KEY } from '../../../../env';
import type { WeiLangStore } from '../useStore';
import type { SentenceExercise, TranslationAttempt, TranslationSession, TranslationEvaluation } from '../../../domain/entities';

export interface TranslationSlice {
  sentenceTranslationService: SentenceTranslationService | null;
  currentTranslationSession: TranslationSession | null;
  lastTranslationEvaluation: TranslationEvaluation | null;
  initializeSentenceTranslationService: () => void;
  startTranslationSession: (difficulty: 'beginner' | 'intermediate' | 'advanced', direction: 'en-to-zh' | 'zh-to-en', exerciseCount?: number) => Promise<TranslationSession>;
  submitTranslation: (sessionId: string, exerciseId: string, userTranslation: string) => Promise<{ attempt: TranslationAttempt; evaluation: TranslationEvaluation; isSessionComplete: boolean }>;
  getCurrentTranslationExercise: () => SentenceExercise | null;
  getTranslationSessionStats: (sessionId: string) => Promise<any>;
  getActiveTranslationSession: () => Promise<TranslationSession | null>;
}

export const createTranslationSlice = (set: any, get: any): TranslationSlice => ({
  sentenceTranslationService: null,
  currentTranslationSession: null,
  lastTranslationEvaluation: null,

  initializeSentenceTranslationService: () => {
    const { apiKey } = get();
    if (!apiKey && !TOGETHER_KEY) {
      console.warn('No API key available for sentence translation service');
      return;
    }
    try {
      const wordRepo = getWordRepository();
      const exerciseRepo = getSentenceExerciseRepository();
      const attemptRepo = getTranslationAttemptRepository();
      const sessionRepo = getTranslationSessionRepository();
      const translationModel = 'Qwen/Qwen2.5-7B-Instruct-Turbo';
      const adapter = new TogetherAdapter(apiKey || TOGETHER_KEY, translationModel, wordRepo);
      const service = new SentenceTranslationService({
        wordRepository: wordRepo,
        sentenceExerciseRepository: exerciseRepo,
        translationAttemptRepository: attemptRepo,
        translationSessionRepository: sessionRepo,
        llmAdapter: adapter
      });
      set({ sentenceTranslationService: service });
    } catch (error) {
      console.error('Failed to initialize sentence translation service:', error);
      set({ error: 'Failed to initialize sentence translation service' });
    }
  },

  startTranslationSession: async (difficulty, direction, exerciseCount = 5) => {
    let service = get().sentenceTranslationService;
    if (!service) {
      get().initializeSentenceTranslationService();
      service = get().sentenceTranslationService;
      if (!service) throw new Error('Failed to initialize sentence translation service');
    }
    set({ isLoading: true, error: null });
    try {
      const session = await service.startSession(difficulty, direction, exerciseCount);
      set({ currentTranslationSession: session, isLoading: false });
      return session;
    } catch (error: any) {
      set({ error: error.message || 'Failed to start translation session', isLoading: false });
      throw error;
    }
  },

  submitTranslation: async (sessionId, exerciseId, userTranslation) => {
    const service = get().sentenceTranslationService;
    if (!service) throw new Error('Sentence translation service not initialized');
    set({ isLoading: true, error: null });
    try {
      const result = await service.submitTranslation(sessionId, exerciseId, userTranslation);
      const currentSession = get().currentTranslationSession;
      if (currentSession && currentSession.id === sessionId) {
        const updated = await service.getActiveSession();
        set({ currentTranslationSession: updated });
      }
      set({ lastTranslationEvaluation: result.evaluation, isLoading: false });
      return result;
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit translation', isLoading: false });
      throw error;
    }
  },

  getCurrentTranslationExercise: () => {
    const service = get().sentenceTranslationService;
    const session = get().currentTranslationSession;
    if (!service || !session) return null;
    return service.getCurrentExercise(session);
  },

  getTranslationSessionStats: async (sessionId) => {
    const service = get().sentenceTranslationService;
    if (!service) throw new Error('Sentence translation service not initialized');
    return service.getSessionStats(sessionId);
  },

  getActiveTranslationSession: async () => {
    const service = get().sentenceTranslationService;
    if (!service) return null;
    const session = await service.getActiveSession();
    set({ currentTranslationSession: session });
    return session;
  }
});
