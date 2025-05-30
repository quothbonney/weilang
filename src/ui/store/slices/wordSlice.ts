import { getWordRepository } from '../../../platform/storageProvider';
import { AddWordUseCase } from '../../../domain/usecases/addWord';
import { ReviewWordUseCase } from '../../../domain/usecases/reviewWord';
const wordsData = require('../../../data/words_import.json') as Word[];
import { Word, ReviewQuality } from '../../../domain/entities';
import type { WeiLangStore } from '../useStore';

export interface WordSlice {
  words: Word[];
  dueWords: Word[];
  hasImported: boolean;
  loadWords: () => Promise<void>;
  loadDueWords: () => Promise<void>;
  addWord: (params: { hanzi: string; pinyin: string; meaning: string }) => Promise<void>;
  reviewWord: (wordId: string, quality: ReviewQuality) => Promise<Word>;
  deleteWord: (wordId: string) => Promise<void>;
  importWords: () => Promise<void>;
  toggleFavorite: (wordId: string) => Promise<void>;
}

export const createWordSlice = (set: any, get: any): WordSlice => ({
  words: [],
  dueWords: [],
  hasImported: false,

  loadWords: async () => {
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const words = await repo.listAll();
      set({ words, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load words', isLoading: false });
    }
  },

  loadDueWords: async () => {
    try {
      const repo = getWordRepository();
      const dueWords = await repo.getCardsByPriority(50);
      set({ dueWords });
    } catch (error) {
      console.error('Failed to load due words:', error);
    }
  },

  addWord: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const useCase = new AddWordUseCase(repo);
      const word = await useCase.execute(params);
      set({ words: [...get().words, word], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add word', isLoading: false });
    }
  },

  reviewWord: async (wordId, quality) => {
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const useCase = new ReviewWordUseCase(repo);
      const updated = await useCase.execute({ wordId, quality });
      const words = get().words.map((w: Word) => (w.id === wordId ? updated : w));
      set({ words, isLoading: false });
      return updated;
    } catch (error: any) {
      set({ error: error.message || 'Failed to review word', isLoading: false });
      throw error;
    }
  },

  deleteWord: async (wordId) => {
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      await repo.delete(wordId);
      set({
        words: get().words.filter((w: Word) => w.id !== wordId),
        dueWords: get().dueWords.filter((w: Word) => w.id !== wordId),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete word', isLoading: false });
    }
  },

  toggleFavorite: async (wordId: string) => {
    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const word = await repo.get(wordId);
      if (word) {
        const updatedWord = { ...word, isFavorite: !word.isFavorite };
        await repo.update(updatedWord);
        set({
          words: get().words.map((w: Word) => (w.id === wordId ? updatedWord : w)),
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to toggle favorite', isLoading: false });
    }
  },

  importWords: async () => {
    if (get().hasImported) return;

    set({ isLoading: true, error: null });
    try {
      const repo = getWordRepository();
      const existing = await repo.listAll();
      if (existing.length > 0) {
        set({ hasImported: true, isLoading: false });
        return;
      }

      for (const word of wordsData as Word[]) {
        try {
          await repo.save(word);
        } catch (error) {
          console.error('Failed to import word', error);
          throw error;
        }
      }
      const words = await repo.listAll();
      set({ words, hasImported: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to import words', isLoading: false });
    }
  }
});
