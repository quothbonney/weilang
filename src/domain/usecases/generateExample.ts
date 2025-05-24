/**
 * Use case for generating example sentences using known words
 */

import { Example, Word } from "../entities";
import { WordRepository, ExampleRepository } from "../repositories";
import { TogetherAdapter } from "../../infra/llm/togetherAdapter";

export type ExampleGenerationMode = 'strict' | 'some-ood' | 'many-ood' | 'independent';

export class GenerateExampleUseCase {
  constructor(
    private wordRepository: WordRepository,
    private exampleRepository: ExampleRepository,
    private togetherAdapter: TogetherAdapter
  ) {}

  async execute(wordId: string, mode: ExampleGenerationMode = 'strict'): Promise<Example> {
    // Load the target word
    const targetWord = await this.wordRepository.get(wordId);
    if (!targetWord) {
      throw new Error("Word not found");
    }

    // Get known words
    const knownWords = await this.wordRepository.getKnownWords();
    
    // Handle different generation modes
    let wordsToUse: string[];
    switch (mode) {
      case 'strict':
        if (knownWords.length === 0) {
          throw new Error("No known words available. Review some words first, or change generation mode in settings!");
        }
        wordsToUse = [targetWord.hanzi, ...knownWords];
        break;
      
      case 'some-ood':
        // Allow some out-of-distribution words, but prefer known words
        if (knownWords.length === 0) {
          wordsToUse = [targetWord.hanzi, '你好', '谢谢', '水']; // Basic fallback words
        } else {
          wordsToUse = [targetWord.hanzi, ...knownWords];
        }
        break;
      
      case 'many-ood':
        // Allow many out-of-distribution words
        wordsToUse = knownWords.length > 0 ? [targetWord.hanzi, ...knownWords] : [targetWord.hanzi, '你好', '谢谢', '水', '吃', '好'];
        break;
      
      case 'independent':
        // Generate completely independent examples
        wordsToUse = [targetWord.hanzi];
        break;
      
      default:
        wordsToUse = knownWords;
    }

    // Generate sentence using Together API
    const generated = await this.togetherAdapter.generateSentence(targetWord, wordsToUse, mode);

    // Create example entity
    const example: Example = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wordId,
      hanzi: generated.hanzi,
      pinyin: generated.pinyin,
      gloss: generated.gloss,
      createdAt: Date.now(),
    };

    // Save to repository
    if (this.exampleRepository) {
      await this.exampleRepository.save(example);
    }

    return example;
  }
} 