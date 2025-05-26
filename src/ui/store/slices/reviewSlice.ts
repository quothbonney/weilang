import { getWordRepository } from '../../../platform/storageProvider';
import { DEFAULT_REVIEW_SETTINGS, getCardPriority } from '../../../domain/srs';
import type { WeiLangStore } from '../useStore';
import type { Word, ReviewQuality, ReviewSettings, ReviewSession, ReviewMode } from '../../../domain/entities';
import type { SessionTracking } from '../types';

export interface ReviewSlice {
  reviewSettings: ReviewSettings;
  currentSession: ReviewSession | null;
  reviewMode: ReviewMode;
  sessionTracking: SessionTracking | null;
  startReviewSession: (mode: ReviewMode) => Promise<void>;
  getNextCard: () => Word | null;
  advanceSession: () => void;
  requeueCard: (card: Word) => void;
  updateReviewSettings: (settings: Partial<ReviewSettings>) => void;
  setReviewMode: (mode: ReviewMode) => void;
  startSessionTracking: () => void;
  addReviewedWord: (word: Word, prev: { status: string; ease: number; interval: number }, quality: ReviewQuality) => void;
  getSessionSummary: () => { reviewedWords: SessionTracking['reviewedWords']; sessionStats: { totalReviewed: number; correctAnswers: number; sessionDuration: number } } | null;
  resetSessionTracking: () => void;
}

export const createReviewSlice = (set: any, get: any): ReviewSlice => ({
  reviewSettings: DEFAULT_REVIEW_SETTINGS,
  currentSession: null,
  reviewMode: 'mixed',
  sessionTracking: null,

  startReviewSession: async (mode) => {
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const settings = get().reviewSettings;
      let newCards: Word[] = [];
      let learningCards: Word[] = [];
      let reviewCards: Word[] = [];
      if (mode === 'mixed' || mode === 'new-only') newCards = await repo.listNewCards(settings.maxNewCardsPerDay);
      if (mode === 'mixed' || mode === 'learning-only') learningCards = await repo.listLearningCards();
      if (mode === 'mixed' || mode === 'review-only') reviewCards = await repo.listReviewCards(settings.maxReviewsPerDay);
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
      set({ currentSession: session, reviewMode: mode, isLoading: false, sessionTracking: { startTime: Date.now(), reviewedWords: [], correctAnswers: 0 } });
    } catch (error: any) {
      set({ error: error.message || 'Failed to start review session', isLoading: false });
    }
  },

  getNextCard: () => {
    const session = get().currentSession;
    if (!session) return null;
    if (session.currentBatch.length === 0 && session.queue.length > 0) {
      const newBatch = session.queue.slice(0, session.settings.batchSize);
      const queue = session.queue.slice(newBatch.length);
      const batchIndex = session.batchIndex + 1;
      set({ currentSession: { ...session, currentBatch: newBatch, queue, batchIndex } });
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
    set({ currentSession: { ...session, currentBatch: batch, queue, batchIndex, reviewed } });
  },

  requeueCard: (card) => {
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
    set({ currentSession: { ...session, currentBatch: [...batch, card], queue, batchIndex } });
  },

  updateReviewSettings: (settings) => {
    const current = get().reviewSettings;
    set({ reviewSettings: { ...current, ...settings } });
  },

  setReviewMode: (mode) => set({ reviewMode: mode }),

  startSessionTracking: () => set({ sessionTracking: { startTime: Date.now(), reviewedWords: [], correctAnswers: 0 } }),

  addReviewedWord: (word, prev, quality) => {
    const tracking = get().sessionTracking;
    if (!tracking) return;
    const reviewedWord = { word, previousStatus: prev.status, previousEase: prev.ease, previousInterval: prev.interval, qualityRating: quality, reviewedAt: Date.now() };
    set({ sessionTracking: { ...tracking, reviewedWords: [...tracking.reviewedWords, reviewedWord], correctAnswers: tracking.correctAnswers + (quality !== 'again' ? 1 : 0) } });
  },

  getSessionSummary: () => {
    const tracking = get().sessionTracking;
    if (!tracking) return null;
    const reviewedWords = tracking.reviewedWords;
    const sessionStats = { totalReviewed: reviewedWords.length, correctAnswers: tracking.correctAnswers, sessionDuration: Date.now() - tracking.startTime };
    return { reviewedWords, sessionStats };
  },

  resetSessionTracking: () => set({ sessionTracking: null })
});
