import type { ExampleGenerationMode, ModelOption } from '../../infra/llm/togetherAdapter';
import type { Word } from '../../domain/entities';

export interface FlashcardSettings {
  showPinyin: boolean;
  deckFlipped: boolean;
  typingMode: boolean;
  handwritingMode: boolean;
  autoPlayTTS: boolean;
}

export interface SessionTracking {
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
