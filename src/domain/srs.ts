/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on SuperMemo 2 algorithm
 */

import { Word, ReviewQuality, qualityToGrade } from "./entities";

export interface ReviewResult {
  ease: number;
  interval: number;
  due: number;
  status: Word["status"];
}

/**
 * Calculate next review parameters using SM-2 algorithm
 * @param word - The word being reviewed
 * @param quality - Review quality rating
 * @returns Updated SRS parameters
 */
export function calculateNextReview(
  word: Word,
  quality: ReviewQuality
): ReviewResult {
  const grade = qualityToGrade[quality];
  
  // Calculate new ease factor
  let newEase = word.ease + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  newEase = Math.max(1.3, newEase); // Minimum ease factor is 1.3
  
  let newInterval: number;
  let newStatus: Word["status"] = word.status;
  
  if (grade < 3) {
    // Failed review - reset to learning
    newInterval = 1;
    newStatus = "learning";
  } else {
    // Successful review
    if (word.status === "new" || word.interval === 0) {
      // First review
      newInterval = 1;
      newStatus = "learning";
    } else if (word.interval === 1) {
      // Second review
      newInterval = 6;
      newStatus = "review";
    } else {
      // Subsequent reviews
      newInterval = Math.round(word.interval * newEase);
      newStatus = "review";
    }
  }
  
  // Calculate due date (in milliseconds)
  const now = Date.now();
  const dueDate = now + newInterval * 24 * 60 * 60 * 1000;
  
  return {
    ease: newEase,
    interval: newInterval,
    due: dueDate,
    status: newStatus,
  };
}

/**
 * Check if a word is due for review
 * @param word - The word to check
 * @returns true if the word is due
 */
export function isDue(word: Word): boolean {
  return word.due <= Date.now();
}

/**
 * Get initial SRS parameters for a new word
 */
export function getInitialSRSParams(): Pick<Word, "ease" | "interval" | "due" | "status"> {
  return {
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    status: "new",
  };
} 