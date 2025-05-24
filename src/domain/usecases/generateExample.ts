/**
 * Use case for generating example sentences using known words
 */

import { Example } from "../entities";
import { WordRepository, ExampleRepository } from "../repositories";
import { TogetherAdapter } from "../../infra/llm/togetherAdapter";

export class GenerateExampleUseCase {
  constructor(
    private wordRepository: WordRepository,
    private exampleRepository: ExampleRepository,
    private togetherAdapter: TogetherAdapter
  ) {}

  async execute(wordId: string): Promise<Example> {
    // Get known words
    const knownWords = await this.wordRepository.getKnownWords();
    
    if (knownWords.length === 0) {
      throw new Error("No known words available. Review some words first!");
    }

    // Generate sentence using Together API
    const generated = await this.togetherAdapter.generateSentence(knownWords);

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