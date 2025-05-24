/**
 * Use case for adding new words to the deck
 */

import { Word } from "../entities";
import { WordRepository } from "../repositories";
import { getInitialSRSParams } from "../srs";

export class AddWordUseCase {
  constructor(private wordRepository: WordRepository) {}

  async execute(params: {
    hanzi: string;
    pinyin: string;
    meaning: string;
  }): Promise<Word> {
    // Generate unique ID - use timestamp + random for compatibility
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new word with initial SRS parameters
    const newWord: Word = {
      id,
      hanzi: params.hanzi,
      pinyin: params.pinyin,
      meaning: params.meaning,
      createdAt: Date.now(),
      repetitions: 0,
      ...getInitialSRSParams(),
    };

    // Save to repository
    await this.wordRepository.save(newWord);
    
    return newWord;
  }
} 