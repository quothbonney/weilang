/**
 * Core domain entities for WeiLang
 */

export interface Word {
  id: string;            // uuid
  hanzi: string;
  pinyin: string;
  meaning: string;
  
  // Spaced repetition fields
  ease: number;          // SM-2 factor (default 2.5)
  interval: number;      // days until next review
  repetitions: number;   // number of successful reviews
  nextReview: number;    // epoch ms when due for review
  status: "new" | "learning" | "review";
  
  createdAt: number;     // epoch ms
  updatedAt?: number;    // epoch ms
}

export interface Example {
  id: string;
  wordId: string;
  hanzi: string;
  pinyin: string;
  gloss: string;
  createdAt: number;
}

export interface WordProfile {
  id: string;
  wordId: string;
  partOfSpeech: string;
  detailedMeaning: string;
  exampleSentences: {
    hanzi: string;
    pinyin: string;
    gloss: string;
  }[];
  etymology?: string;
  usage?: string;
  createdAt: number;
  updatedAt?: number;
}

// Review quality ratings for SM-2
export type ReviewQuality = "again" | "hard" | "good" | "easy";

// Map review quality to SM-2 grade
export const qualityToGrade: Record<ReviewQuality, number> = {
  again: 0,
  hard: 1,
  good: 3,
  easy: 5,
}; 