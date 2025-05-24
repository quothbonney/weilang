/**
 * Core domain entities for WeiLang
 */

export interface Word {
  id: string;            // uuid
  hanzi: string;
  pinyin: string;
  meaning: string;
  addedAt: number;       // epoch ms
  ease: number;          // SM-2 factor (default 2.5)
  interval: number;      // days until next review
  due: number;           // epoch ms when due for review
  status: "new" | "learning" | "review";
}

export interface Example {
  id: string;
  wordId: string;
  hanzi: string;
  pinyin: string;
  gloss: string;
  createdAt: number;
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