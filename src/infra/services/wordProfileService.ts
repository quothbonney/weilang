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

    console.log('🔍 WordProfileService: Initializing with config:', {
      hasLingvanexKey: !!this.config.lingvanexApiKey,
      lingvanexKeyLength: this.config.lingvanexApiKey?.length || 0,
      hasTogetherKey: !!this.config.togetherApiKey,
      unihanDbPath: this.config.unihanDbPath
    });

    this.unihanRepo = new UnihanRepository(this.config.unihanDbPath);
    this.lingvanexApi = this.config.lingvanexApiKey 
      ? new LingvanexApi(this.config.lingvanexApiKey) 
      : null;
    this.profileCache = new ProfileCache();
    this.llmAdapter = this.config.togetherApiKey 
      ? new TogetherAdapter(this.config.togetherApiKey) 
      : null;

    console.log('🔍 WordProfileService: Services initialized:', {
      hasLingvanexApi: !!this.lingvanexApi,
      hasLlmAdapter: !!this.llmAdapter
    });
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

    // Only cache if the profile is complete and valid
    if (this.config.enableCache && this.isProfileComplete(profile)) {
      console.log(`🔍 Caching complete profile for "${hanzi}"`);
      await this.profileCache.set(hanzi, profile);
    } else if (this.config.enableCache) {
      console.log(`🔍 NOT caching incomplete profile for "${hanzi}" - will retry next time`);
    }

    return profile;
  }

  /**
   * Generate profile progressively - returns partial data immediately, 
   * then calls onUpdate when LLM data is ready
   */
  async generateProfileProgressive(
    word: Word, 
    onUpdate?: (profile: WordProfileDTO) => void
  ): Promise<WordProfileDTO> {
    const hanzi = word.hanzi;

    // Check cache first
    if (this.config.enableCache) {
      const cached = await this.profileCache.get(hanzi);
      if (cached) {
        return cached;
      }
    }

    // Build partial profile without LLM data for immediate display
    const partialProfile = await this.buildPartialProfile(word);
    
    // Start LLM generation in background (don't await)
    if (this.llmAdapter && onUpdate) {
      this.enhanceWithLLMData(word, partialProfile, onUpdate);
    }

    return partialProfile;
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

  /**
   * Build partial profile with API data only (no LLM) for immediate display
   */
  private async buildPartialProfile(word: Word): Promise<WordProfileDTO> {
    const hanzi = word.hanzi;
    
    console.log(`🔍 Building partial profile for "${hanzi}" (API data only)...`);
    
    // Get fast API data only (skip LLM)
    const [
      unihanData,
      dictionaryData
    ] = await Promise.allSettled([
      this.getUnihanData(hanzi),
      this.getDictionaryData(hanzi)
    ]);

    // Extract character data
    const characterData = unihanData.status === 'fulfilled' ? unihanData.value : null;
    const primaryChar = hanzi[0];
    
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

    // Build partial profile (no LLM data yet)
    const profile: WordProfileDTO = {
      hanzi,
      pinyin: word.pinyin,
      primaryMeaning: word.meaning,
      meanings: this.extractMeanings(word, characterData, dictData),
      partOfSpeech: this.extractPartOfSpeech(dictData, null), // No LLM data yet
      radical: this.buildRadicalInfo(characterData, radicalInfo),
      totalStrokes: characterData?.totalStrokes || this.estimateStrokes(hanzi),
      strokeSvgUrl: this.buildStrokeSvgUrl(primaryChar),
      dictionary: this.buildDictionaryInfo(dictData),
      examples: [], // Will be filled by LLM later
      frequency: this.estimateFrequency(word),
      difficulty: this.estimateDifficulty(word),
      etymology: undefined, // Will be filled by LLM later
      usage: undefined, // Will be filled by LLM later
      culturalNotes: this.generateCulturalNotes(hanzi),
      memoryAids: this.generateMemoryAids(hanzi, word.meaning),
      relatedWords: this.extractRelatedWords(hanzi),
      characterComponents: await this.analyzeCharacterComponents(hanzi),
      generatedAt: new Date().toISOString()
    };

    console.log(`🔍 Partial profile ready for "${hanzi}"`);
    return profile;
  }

  /**
   * Enhance partial profile with LLM data in background
   */
  private async enhanceWithLLMData(
    word: Word, 
    baseProfile: WordProfileDTO, 
    onUpdate: (profile: WordProfileDTO) => void
  ): Promise<void> {
    try {
      console.log(`🔍 Enhancing profile for "${word.hanzi}" with LLM data...`);
      
      const llmData = await this.getLLMData(word);
      
      // Merge LLM data into the base profile
      const enhancedProfile: WordProfileDTO = {
        ...baseProfile,
        partOfSpeech: this.extractPartOfSpeech(null, llmData), // Use LLM data for part of speech
        examples: this.buildExamples(llmData),
        etymology: llmData?.etymology,
        usage: llmData?.usage,
        generatedAt: new Date().toISOString() // Update timestamp
      };

      console.log(`🔍 LLM enhancement complete for "${word.hanzi}"`);
      
      // Cache the complete profile
      if (this.config.enableCache && this.isProfileComplete(enhancedProfile)) {
        console.log(`🔍 Caching enhanced profile for "${word.hanzi}"`);
        await this.profileCache.set(word.hanzi, enhancedProfile);
      }
      
      // Notify UI with enhanced profile
      onUpdate(enhancedProfile);
      
    } catch (error) {
      console.error(`🔍 Failed to enhance profile for "${word.hanzi}" with LLM:`, error);
      // Don't call onUpdate on error - UI keeps partial profile
    }
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
      console.log('🔍 WordProfileService: No Lingvanex API configured');
      return null;
    }

    console.log(`🔍 WordProfileService: Getting dictionary data for "${hanzi}"`);

    try {
      const result = await this.lingvanexApi.getDictionaryDefinition(hanzi);
      console.log(`🔍 WordProfileService: Dictionary result for "${hanzi}":`, result);
      return result;
    } catch (error) {
      console.error('🔍 WordProfileService: Failed to get dictionary data:', error);
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
    console.log(`🔍 Analyzing character components for "${hanzi}"...`);
    
    // Skip Unihan entirely and use Lingvanex directly for speed
    if (!this.lingvanexApi) {
      console.log('🔍 No Lingvanex API available for character analysis');
      return [];
    }

    try {
      // Add aggressive timeout for the entire character analysis operation
      const analysisPromise = this.performCharacterAnalysis(hanzi);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.error(`🔍 Character analysis timeout after 15 seconds for "${hanzi}"`);
          reject(new Error('Character analysis timeout'));
        }, 15000); // 15 second total timeout
      });

      const components = await Promise.race([analysisPromise, timeoutPromise]);
      console.log(`🔍 Character analysis complete for "${hanzi}"`);
      return components as any;
    } catch (error) {
      console.error(`🔍 Character analysis failed for "${hanzi}":`, error);
      // Return basic fallback data
      return hanzi.split('').map((char, index) => ({
        char,
        meaning: 'analysis failed',
        type: index === 0 ? 'radical' as const : 'semantic' as const,
        strokes: 8,
        pinyin: 'unknown'
      }));
    }
  }

  private async performCharacterAnalysis(hanzi: string) {
    // Process all characters in parallel for better performance
    const characterPromises = hanzi.split('').map(async (char, index) => {
      try {
        console.log(`🔍 Getting meaning for "${char}" from Lingvanex...`);
        const dictResult = await this.lingvanexApi!.getDictionaryDefinition(char);
        
        const meaning = dictResult?.definitions[0] || 'unknown meaning';
        console.log(`🔍 Got meaning for "${char}": "${meaning}"`);
        
        return {
          char,
          meaning,
          type: index === 0 ? 'radical' as const : 'semantic' as const,
          strokes: 8, // Default estimate
          pinyin: 'unknown' // Could enhance this later
        };
      } catch (error) {
        console.error(`🔍 Failed to get meaning for "${char}":`, error);
        return {
          char,
          meaning: 'request failed',
          type: index === 0 ? 'radical' as const : 'semantic' as const,
          strokes: 8,
          pinyin: 'unknown'
        };
      }
    });

    // Wait for all character lookups to complete in parallel
    return await Promise.all(characterPromises);
  }

  /**
   * Check if a profile is complete and valid (no placeholder/error data)
   * Only complete profiles should be cached
   */
  private isProfileComplete(profile: WordProfileDTO): boolean {
    // Check if character components have valid meanings
    if (profile.characterComponents) {
      const hasIncompleteComponents = profile.characterComponents.some(component => {
        const meaning = component.meaning?.toLowerCase() || '';
        return meaning === 'loading...' || 
               meaning === 'unknown meaning' || 
               meaning === 'analysis failed' || 
               meaning === 'request failed' ||
               meaning === 'unknown' ||
               meaning === 'meaning' ||
               meaning === '';
      });

      if (hasIncompleteComponents) {
        console.log('🔍 Profile incomplete: character components have placeholder meanings');
        return false;
      }
    }

    // Check if dictionary has real data
    if (profile.dictionary && profile.dictionary.definitions.length === 0) {
      console.log('🔍 Profile incomplete: no dictionary definitions');
      return false;
    }

    // Check if basic meanings are present
    if (profile.meanings.length === 0) {
      console.log('🔍 Profile incomplete: no meanings');
      return false;
    }

    console.log('🔍 Profile validation passed - ready for caching');
    return true;
  }

  // Utility methods
  async clearCache(): Promise<void> {
    await this.profileCache.clear();
  }

  async getCacheStats() {
    return this.profileCache.getStats();
  }

  async testConnections(): Promise<{ unihan: boolean; lingvanex: boolean; llm: boolean }> {
    try {
      const unihanTest = await this.unihanRepo.getCharacterData('人').then(() => true).catch(() => false);
      const lingvanexTest = this.lingvanexApi ? await this.lingvanexApi.getDictionaryDefinition('测试').then(() => true).catch(() => false) : false;
      const llmTest = this.llmAdapter ? true : false;
      
      return { unihan: unihanTest, lingvanex: lingvanexTest, llm: llmTest };
    } catch (error) {
      return { unihan: false, lingvanex: false, llm: false };
    }
  }
}