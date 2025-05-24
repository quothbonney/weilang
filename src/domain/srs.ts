/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Enhanced with Anki-like learning steps
 */

import { Word, ReviewQuality, qualityToGrade, ReviewSettings } from "./entities";

export interface ReviewResult {
  ease: number;
  interval: number;
  due: number;
  status: Word["status"];
  learningStep: number;
  learningDue?: number;
}

// Default review settings (Anki-like)
export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  learningSteps: [1, 10],        // 1 minute, 10 minutes
  graduatingInterval: 1,         // 1 day
  easyInterval: 4,              // 4 days for easy new cards
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 100,
  batchSize: 10,
};

/**
 * Calculate next review parameters using enhanced SM-2 algorithm with learning steps
 */
export function calculateNextReview(
  word: Word,
  quality: ReviewQuality,
  settings: ReviewSettings = DEFAULT_REVIEW_SETTINGS
): ReviewResult {
  const grade = qualityToGrade[quality];
  const now = Date.now();
  
  // Handle "Again" - always goes to learning queue
  if (grade < 3) {
    return {
      ease: Math.max(1.3, word.ease - 0.2), // Reduce ease
      interval: 0,
      due: now,
      status: "learning",
      learningStep: 0, // Reset to first learning step
      learningDue: now + settings.learningSteps[0] * 60 * 1000, // First step in ms
    };
  }
  
  // Handle learning cards
  if (word.status === "learning" || word.learningStep > 0) {
    const currentStep = word.learningStep;
    
    if (grade === 5) { // Easy - graduate immediately
      return {
        ease: word.ease + 0.15,
        interval: settings.easyInterval,
        due: now + settings.easyInterval * 24 * 60 * 60 * 1000,
        status: "review",
        learningStep: 0,
        learningDue: undefined,
      };
    }
    
    const nextStep = currentStep + 1;
    
    // Still in learning steps
    if (nextStep < settings.learningSteps.length) {
      return {
        ease: word.ease,
        interval: 0,
        due: now,
        status: "learning",
        learningStep: nextStep,
        learningDue: now + settings.learningSteps[nextStep] * 60 * 1000,
      };
    }
    
    // Graduate from learning
    return {
      ease: word.ease,
      interval: settings.graduatingInterval,
      due: now + settings.graduatingInterval * 24 * 60 * 60 * 1000,
      status: "review",
      learningStep: 0,
      learningDue: undefined,
    };
  }
  
  // Handle new cards
  if (word.status === "new") {
    if (grade === 5) { // Easy
      return {
        ease: 2.5 + 0.15,
        interval: settings.easyInterval,
        due: now + settings.easyInterval * 24 * 60 * 60 * 1000,
        status: "review",
        learningStep: 0,
        learningDue: undefined,
      };
    }
    
    // Start learning sequence
    return {
      ease: 2.5,
      interval: 0,
      due: now,
      status: "learning",
      learningStep: 0,
      learningDue: now + settings.learningSteps[0] * 60 * 1000,
    };
  }
  
  // Handle review cards (existing logic enhanced)
  let newEase = word.ease + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  newEase = Math.max(1.3, newEase);
  
  let newInterval: number;
  
  if (grade === 1) { // Hard
    newInterval = Math.max(1, Math.round(word.interval * 1.2));
  } else if (grade === 3) { // Good
    newInterval = Math.round(word.interval * newEase);
  } else { // Easy (grade === 5)
    newInterval = Math.round(word.interval * newEase * 1.3);
    newEase += 0.15;
  }
  
  return {
    ease: newEase,
    interval: newInterval,
    due: now + newInterval * 24 * 60 * 60 * 1000,
    status: "review",
    learningStep: 0,
    learningDue: undefined,
  };
}

/**
 * Check if a word is due for review (either regular or learning)
 */
export function isDue(word: Word): boolean {
  const now = Date.now();
  
  // Check learning queue first
  if (word.learningStep > 0 && word.learningDue) {
    return word.learningDue <= now;
  }
  
  // Check regular review
  return word.due <= now;
}

/**
 * Get priority score for sorting cards (lower = higher priority)
 */
export function getCardPriority(word: Word): number {
  // Learning cards have highest priority
  if (word.learningStep > 0) {
    return 1;
  }
  
  // New cards have medium priority
  if (word.status === "new") {
    return 2;
  }
  
  // Review cards have lowest priority, sorted by how overdue they are
  const overdueDays = Math.max(0, (Date.now() - word.due) / (24 * 60 * 60 * 1000));
  return 3 + Math.min(overdueDays, 999); // Cap to prevent overflow
}

/**
 * Get initial SRS parameters for a new word
 */
export function getInitialSRSParams(): Pick<Word, "ease" | "interval" | "due" | "status" | "learningStep" | "learningDue"> {
  return {
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    status: "new",
    learningStep: 0,
    learningDue: undefined,
  };
} 