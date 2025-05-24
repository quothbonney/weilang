/**
 * Use case for generating comprehensive word profiles using AI
 */

import { WordProfile, Word } from "../entities";
import { WordRepository, WordProfileRepository } from "../repositories";
import { TogetherAdapter } from "../../infra/llm/togetherAdapter";

export class GenerateWordProfileUseCase {
  constructor(
    private wordRepository: WordRepository,
    private wordProfileRepository: WordProfileRepository,
    private togetherAdapter: TogetherAdapter
  ) {}

  async execute(wordId: string): Promise<WordProfile> {
    // Check if profile already exists
    const existingProfile = await this.wordProfileRepository.getByWordId(wordId);
    if (existingProfile) {
      return existingProfile;
    }

    // Get the word
    const word = await this.wordRepository.get(wordId);
    if (!word) {
      throw new Error("Word not found");
    }

    // Generate profile using AI
    const generated = await this.togetherAdapter.generateWordProfile(word);

    // Create profile entity
    const profile: WordProfile = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wordId,
      partOfSpeech: generated.partOfSpeech,
      detailedMeaning: generated.detailedMeaning,
      exampleSentences: generated.exampleSentences,
      etymology: generated.etymology,
      usage: generated.usage,
      createdAt: Date.now(),
    };

    // Save to repository
    await this.wordProfileRepository.save(profile);

    return profile;
  }
} 