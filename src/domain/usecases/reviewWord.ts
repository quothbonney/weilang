/**
 * Use case for reviewing words with spaced repetition
 */

import { Word, ReviewQuality } from "../entities";
import { WordRepository } from "../repositories";
import { calculateNextReview } from "../srs";

export class ReviewWordUseCase {
  constructor(private wordRepository: WordRepository) {}

  async execute(params: {
    wordId: string;
    quality: ReviewQuality;
  }): Promise<Word> {
    // Get the word
    const word = await this.wordRepository.get(params.wordId);
    if (!word) {
      throw new Error(`Word with id ${params.wordId} not found`);
    }

    // Calculate next review parameters
    const reviewResult = calculateNextReview(word, params.quality);

    // Update the word with new SRS parameters
    const updatedWord: Word = {
      ...word,
      ease: reviewResult.ease,
      interval: reviewResult.interval,
      due: reviewResult.due,
      status: reviewResult.status,
    };

    // Save updated word
    await this.wordRepository.update(updatedWord);
    
    return updatedWord;
  }
} 