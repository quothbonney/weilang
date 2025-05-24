/**
 * Word Profile Service
 * Orchestrates data from multiple sources to build comprehensive word profiles
 */

import { WordProfileDTO, Word } from '../../domain/entities';
import { UnihanRepository, RadicalInfo } from '../storage/unihanRepo';
import { LingvanexApi, DictionaryResult } from '../api/lingvanexApi';
import { ProfileCache } from '../storage/profileCache';
import { TogetherAdapter } from '../llm/togetherAdapter';

export interface WordProfileConfig {
  lingvanexApiKey?: string;
  togetherApiKey?: string;
  unihanDbPath?: string;
  enableCache?: boolean;
  strokeOrderBaseUrl?: string;
}

export class WordProfileService {
  private unihanRepo: UnihanRepository;
  private lingvanexApi: LingvanexApi | null;
  private profileCache: ProfileCache;
  private llmAdapter: TogetherAdapter | null;
  private config: WordProfileConfig;

  constructor(config: WordProfileConfig) {
    this.config = {
      enableCache: true,
      strokeOrderBaseUrl: '/strokes',
      ...config
    };

    this.unihanRepo = new UnihanRepository(this.config.unihanDbPath);
    this.lingvanexApi = this.config.lingvanexApiKey 
      ? new LingvanexApi(this.config.lingvanexApiKey) 
      : null;
    this.profileCache = new ProfileCache();
    this.llmAdapter = this.config.togetherApiKey 
      ? new TogetherAdapter(this.config.togetherApiKey) 
      : null;
  }

  async generateProfile(word: Word): Promise<WordProfileDTO> {
    const hanzi = word.hanzi;

    // Check cache first
    if (this.config.enableCache) {
      const cached = await this.profileCache.get(hanzi);
      if (cached) {
        return cached;
      }
    }

    // Build profile from multiple sources
    const profile = await this.buildProfile(word);

    // Cache the result
    if (this.config.enableCache) {
      await this.profileCache.set(hanzi, profile);
    }

    return profile;
  }

  private async buildProfile(word: Word): Promise<WordProfileDTO> {
    const hanzi = word.hanzi;
    
    // Start all data fetching in parallel for performance
    const [
      unihanData,
      dictionaryData,
      llmData
    ] = await Promise.allSettled([
      this.getUnihanData(hanzi),
      this.getDictionaryData(hanzi),
      this.getLLMData(word)
    ]);

    // Extract character data
    const characterData = unihanData.status === 'fulfilled' ? unihanData.value : null;
    const primaryChar = hanzi[0]; // First character for radical/stroke data
    
    // Get radical info
    let radicalInfo: RadicalInfo | null = null;
    if (characterData?.radical) {
      try {
        radicalInfo = await this.unihanRepo.getRadicalInfo(characterData.radical);
      } catch (error) {
        console.error('Failed to get radical info:', error);
        radicalInfo = null;
      }
    }

    // Extract dictionary data
    const dictData = dictionaryData.status === 'fulfilled' ? dictionaryData.value : null;

    // Extract LLM data
    const llmResult = llmData.status === 'fulfilled' ? llmData.value : null;

    // Build comprehensive profile
    const profile: WordProfileDTO = {
      hanzi,
      pinyin: word.pinyin,
      primaryMeaning: word.meaning,
      meanings: this.extractMeanings(word, characterData, dictData),
      partOfSpeech: this.extractPartOfSpeech(dictData, llmResult),
      radical: this.buildRadicalInfo(characterData, radicalInfo),
      totalStrokes: characterData?.totalStrokes || this.estimateStrokes(hanzi),
      strokeSvgUrl: this.buildStrokeSvgUrl(primaryChar),
      dictionary: this.buildDictionaryInfo(dictData),
      examples: this.buildExamples(llmResult),
      frequency: this.estimateFrequency(word),
      difficulty: this.estimateDifficulty(word),
      etymology: llmResult?.etymology,
      usage: llmResult?.usage,
      culturalNotes: this.generateCulturalNotes(hanzi),
      memoryAids: this.generateMemoryAids(hanzi, word.meaning),
      relatedWords: this.extractRelatedWords(hanzi),
      characterComponents: await this.analyzeCharacterComponents(hanzi),
      generatedAt: new Date().toISOString()
    };

    return profile;
  }

  private async getUnihanData(hanzi: string) {
    try {
      const primaryChar = hanzi[0];
      return await this.unihanRepo.getCharacterData(primaryChar);
    } catch (error) {
      console.error('Failed to get Unihan data:', error);
      return null;
    }
  }

  private async getDictionaryData(hanzi: string): Promise<DictionaryResult | null> {
    if (!this.lingvanexApi) {
      return null;
    }

    try {
      return await this.lingvanexApi.getDictionaryDefinition(hanzi);
    } catch (error) {
      console.error('Failed to get dictionary data:', error);
      return null;
    }
  }

  private async getLLMData(word: Word) {
    if (!this.llmAdapter) {
      return null;
    }

    try {
      return await this.llmAdapter.generateWordProfile(word);
    } catch (error) {
      console.error('Failed to get LLM data:', error);
      return null;
    }
  }

  private extractMeanings(word: Word, unihanData: any, dictData: DictionaryResult | null): string[] {
    const meanings = new Set<string>();
    
    meanings.add(word.meaning);
    
    if (unihanData?.definition) {
      meanings.add(unihanData.definition);
    }
    
    if (dictData?.definitions) {
      dictData.definitions.forEach(def => meanings.add(def));
    }

    return Array.from(meanings);
  }

  private extractPartOfSpeech(dictData: DictionaryResult | null, llmData: any): string {
    if (dictData?.partOfSpeech && dictData.partOfSpeech !== 'unknown') {
      return dictData.partOfSpeech;
    }
    
    if (llmData?.partOfSpeech) {
      return llmData.partOfSpeech;
    }

    return 'word';
  }

  private buildRadicalInfo(characterData: any, radicalInfo: RadicalInfo | null) {
    if (!characterData?.radical || !radicalInfo) {
      return {
        number: 0,
        char: '',
        meaning: '',
        strokes: 0
      };
    }

    return {
      number: characterData.radical,
      char: radicalInfo.character,
      meaning: radicalInfo.meaning,
      strokes: radicalInfo.strokes
    };
  }

  private buildStrokeSvgUrl(character: string): string {
    const codePoint = character.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0');
    return `${this.config.strokeOrderBaseUrl}/U+${codePoint}.svg`;
  }

  private buildDictionaryInfo(dictData: DictionaryResult | null) {
    if (!dictData) {
      return {
        definitions: [],
        synonyms: [],
        antonyms: [],
        source: 'LLM' as const
      };
    }

    return {
      definitions: dictData.definitions,
      synonyms: dictData.synonyms,
      antonyms: dictData.antonyms,
      source: 'Lingvanex' as const
    };
  }

  private buildExamples(llmData: any) {
    if (!llmData?.exampleSentences) {
      return [];
    }

    return llmData.exampleSentences.map((example: any) => ({
      hanzi: example.hanzi,
      pinyin: example.pinyin,
      gloss: example.gloss,
      source: 'LLM' as const
    }));
  }

  private estimateFrequency(word: Word): string {
    // Simple frequency estimation based on word properties
    if (word.repetitions > 20) return 'Very Common';
    if (word.repetitions > 10) return 'Common';
    if (word.repetitions > 5) return 'Moderate';
    return 'Uncommon';
  }

  private estimateDifficulty(word: Word): string {
    // Simple difficulty estimation
    const strokeCount = word.hanzi.length * 8; // Rough estimate
    const easeScore = word.ease;

    if (strokeCount < 10 && easeScore > 2.5) return 'Beginner';
    if (strokeCount < 20 && easeScore > 2.0) return 'Intermediate';
    return 'Advanced';
  }

  private estimateStrokes(hanzi: string): number {
    // Rough estimation: 8 strokes per character on average
    return hanzi.length * 8;
  }

  private generateCulturalNotes(hanzi: string): string {
    // Placeholder for cultural notes - would be enhanced with real data
    return `The character${hanzi.length > 1 ? 's' : ''} ${hanzi} ${hanzi.length > 1 ? 'are' : 'is'} commonly used in modern Chinese.`;
  }

  private generateMemoryAids(hanzi: string, meaning: string): string {
    // Simple memory aid generation
    return `Remember "${hanzi}" by associating it with "${meaning}".`;
  }

  private extractRelatedWords(hanzi: string): string[] {
    // Placeholder - would query database for words containing the same characters
    return [];
  }

  private async analyzeCharacterComponents(hanzi: string) {
    const components = [];
    
    for (let i = 0; i < hanzi.length; i++) {
      const char = hanzi[i];
      const charData = await this.unihanRepo.getCharacterData(char);
      
      if (charData) {
        components.push({
          char,
          meaning: charData.definition || '',
          type: i === 0 ? 'radical' as const : 'semantic' as const,
          strokes: charData.totalStrokes || 8,
          pinyin: charData.pinyin || ''
        });
      }
    }

    return components;
  }

  // Utility methods
  async clearCache(): Promise<void> {
    await this.profileCache.clear();
  }

  async getCacheStats() {
    return this.profileCache.getStats();
  }

  async testConnections(): Promise<{ unihan: boolean; lingvanex: boolean; llm: boolean }> {
    const results = await Promise.allSettled([
      this.unihanRepo.getCharacterData('你'),
      this.lingvanexApi?.testConnection() || Promise.resolve(false),
      this.llmAdapter ? Promise.resolve(true) : Promise.resolve(false)
    ]);

    return {
      unihan: results[0].status === 'fulfilled' && results[0].value !== null,
      lingvanex: results[1].status === 'fulfilled' ? results[1].value : false,
      llm: results[2].status === 'fulfilled' ? results[2].value : false
    };
  }
} 