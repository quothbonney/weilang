/**
 * Word Profile Service
 * Orchestrates data from multiple sources to build comprehensive word profiles
 */

import { WordProfileDTO, Word } from '../../domain/entities';
import { UnihanRepository, RadicalInfo } from '../storage/unihanRepo';
import { LingvanexApi, DictionaryResult } from '../api/lingvanexApi';
import { ProfileCache } from '../storage/profileCache';
import { TogetherAdapter } from '../llm/togetherAdapter';
import { RadicalAnalyzer, RadicalBreakdown } from './radicalAnalyzer';

export interface WordProfileConfig {
  lingvanexApiKey?: string;
  togetherApiKey?: string;
  unihanDbPath?: string;
  enableCache?: boolean;
  strokeOrderBaseUrl?: string;
}

export class WordProfileService {
  private unihanRepo: UnihanRepository;
  private radicalAnalyzer: RadicalAnalyzer;
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
    this.radicalAnalyzer = new RadicalAnalyzer(this.unihanRepo);
    this.lingvanexApi = this.config.lingvanexApiKey 
      ? new LingvanexApi(this.config.lingvanexApiKey) 
      : null;
    this.profileCache = new ProfileCache();
    this.llmAdapter = this.config.togetherApiKey 
      ? new TogetherAdapter(this.config.togetherApiKey) 
      : null;

    console.log('🔍 WordProfileService: Services initialized:', {
      hasLingvanexApi: !!this.lingvanexApi,
      hasLlmAdapter: !!this.llmAdapter,
      hasRadicalAnalyzer: !!this.radicalAnalyzer
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
        // If cached, still call LLM enhancement if onUpdate is provided, 
        // in case LLM data was missing or needs refresh.
        if (this.llmAdapter && onUpdate) {
          this.enhanceWithLLMData(word, cached, onUpdate, true); // Pass a flag to indicate it's from cache
        }
        return cached;
      }
    }

    // Build partial profile without LLM data for immediate display
    const partialProfile = await this.buildPartialProfile(word);
    
    // Start LLM generation in background (don't await)
    if (this.llmAdapter && onUpdate) {
      this.enhanceWithLLMData(word, partialProfile, onUpdate, false);
    }

    return partialProfile;
  }

  private async buildProfile(word: Word): Promise<WordProfileDTO> {
    const hanzi = word.hanzi;
    
    console.log(`🔍 WordProfileService: Building profile for "${hanzi}"`);
    
    const [ 
      radicalBreakdown,
      dictionaryData,
      llmData
    ] = await Promise.allSettled([
      this.radicalAnalyzer.getWordBreakdown(hanzi), // Use RadicalAnalyzer
      this.getDictionaryData(hanzi),
      this.getLLMData(word)
    ]);

    console.log(`🔍 WordProfileService: Data retrieval results for "${hanzi}":`, {
      radicalBreakdown: radicalBreakdown.status,
      dictionaryData: dictionaryData.status,
      llmData: llmData.status
    });

    const rBreakdown = radicalBreakdown.status === 'fulfilled' ? radicalBreakdown.value : null;
    const dictData = dictionaryData.status === 'fulfilled' ? dictionaryData.value : null;
    const llmResult = llmData.status === 'fulfilled' ? llmData.value : null;

    console.log(`🔍 WordProfileService: RadicalBreakdown result for "${hanzi}":`, {
      hasBreakdown: !!rBreakdown,
      charactersCount: rBreakdown?.characters?.length || 0,
      commonRadicalsCount: rBreakdown?.commonRadicals?.length || 0,
      totalComplexity: rBreakdown?.totalComplexity,
      learningTipsCount: rBreakdown?.learningTips?.length || 0
    });

    if (radicalBreakdown.status === 'rejected') {
      console.error(`🔍 WordProfileService: RadicalAnalyzer failed for "${hanzi}":`, radicalBreakdown.reason);
    }

    const primaryCharData = rBreakdown?.characters?.[0];
    const primaryRadicalInfo = primaryCharData?.radical;

    const profile: WordProfileDTO = {
      hanzi,
      pinyin: word.pinyin,
      primaryMeaning: word.meaning,
      meanings: this.extractMeanings(word, rBreakdown, dictData),
      partOfSpeech: this.extractPartOfSpeech(dictData, llmResult),
      radical: primaryRadicalInfo ? {
        number: primaryRadicalInfo.number,
        char: primaryRadicalInfo.character,
        meaning: primaryRadicalInfo.meaning,
        strokes: primaryRadicalInfo.strokes
      } : null,
      totalStrokes: rBreakdown?.totalComplexity || this.estimateStrokes(hanzi),
      strokeSvgUrl: this.buildStrokeSvgUrl(hanzi[0]),
      dictionary: this.buildDictionaryInfo(dictData),
      examples: this.buildExamples(llmResult),
      frequency: this.estimateFrequency(word, rBreakdown),
      difficulty: this.estimateDifficulty(word, rBreakdown),
      etymology: llmResult?.etymology || this.generateEtymologyFromBreakdown(rBreakdown),
      usage: llmResult?.usage,
      culturalNotes: this.generateCulturalNotesFromBreakdown(rBreakdown),
      memoryAids: llmResult?.memoryAids || this.generateMemoryAidsFromBreakdown(rBreakdown),
      relatedWords: this.extractRelatedWords(hanzi, rBreakdown),
      characterComponents: await this.buildCharacterComponentsFromBreakdown(rBreakdown),
      radicalBreakdown: rBreakdown || undefined,
      generatedAt: new Date().toISOString()
    };

    console.log(`🔍 WordProfileService: Final profile for "${hanzi}":`, {
      hasRadicalBreakdown: !!profile.radicalBreakdown,
      hasCharacterComponents: !!profile.characterComponents,
      characterComponentsLength: profile.characterComponents?.length || 0
    });

    return profile;
  }

  /**
   * Build partial profile with API data only (no LLM) for immediate display
   */
  private async buildPartialProfile(word: Word): Promise<WordProfileDTO> {
    const hanzi = word.hanzi;
    console.log(`🔍 WordProfileService: Building PARTIAL profile for "${hanzi}" (API data only)...`);
    
    const [
      radicalBreakdown,
      dictionaryData
    ] = await Promise.allSettled([
      this.radicalAnalyzer.getWordBreakdown(hanzi), // Use RadicalAnalyzer
      this.getDictionaryData(hanzi)
    ]);

    console.log(`🔍 WordProfileService: Partial data retrieval results for "${hanzi}":`, {
      radicalBreakdown: radicalBreakdown.status,
      dictionaryData: dictionaryData.status
    });

    const rBreakdown = radicalBreakdown.status === 'fulfilled' ? radicalBreakdown.value : null;
    const dictData = dictionaryData.status === 'fulfilled' ? dictionaryData.value : null;

    console.log(`🔍 WordProfileService: Partial RadicalBreakdown result for "${hanzi}":`, {
      hasBreakdown: !!rBreakdown,
      charactersCount: rBreakdown?.characters?.length || 0,
      commonRadicalsCount: rBreakdown?.commonRadicals?.length || 0,
      totalComplexity: rBreakdown?.totalComplexity,
      learningTipsCount: rBreakdown?.learningTips?.length || 0
    });

    if (radicalBreakdown.status === 'rejected') {
      console.error(`🔍 WordProfileService: RadicalAnalyzer failed in partial profile for "${hanzi}":`, radicalBreakdown.reason);
    }

    const primaryCharData = rBreakdown?.characters?.[0];
    const primaryRadicalInfo = primaryCharData?.radical;

    const profile: WordProfileDTO = {
      hanzi,
      pinyin: word.pinyin,
      primaryMeaning: word.meaning,
      meanings: this.extractMeanings(word, rBreakdown, dictData),
      partOfSpeech: this.extractPartOfSpeech(dictData, null),
      radical: primaryRadicalInfo ? {
        number: primaryRadicalInfo.number,
        char: primaryRadicalInfo.character,
        meaning: primaryRadicalInfo.meaning,
        strokes: primaryRadicalInfo.strokes
      } : null,
      totalStrokes: rBreakdown?.totalComplexity || this.estimateStrokes(hanzi),
      strokeSvgUrl: this.buildStrokeSvgUrl(hanzi[0]),
      dictionary: this.buildDictionaryInfo(dictData),
      examples: [],
      frequency: this.estimateFrequency(word, rBreakdown),
      difficulty: this.estimateDifficulty(word, rBreakdown),
      etymology: this.generateEtymologyFromBreakdown(rBreakdown),
      usage: undefined,
      culturalNotes: this.generateCulturalNotesFromBreakdown(rBreakdown),
      memoryAids: this.generateMemoryAidsFromBreakdown(rBreakdown),
      relatedWords: this.extractRelatedWords(hanzi, rBreakdown),
      characterComponents: await this.buildCharacterComponentsFromBreakdown(rBreakdown),
      radicalBreakdown: rBreakdown || undefined,
      generatedAt: new Date().toISOString()
    };

    console.log(`🔍 WordProfileService: Final PARTIAL profile for "${hanzi}":`, {
      hasRadicalBreakdown: !!profile.radicalBreakdown,
      hasCharacterComponents: !!profile.characterComponents,
      characterComponentsLength: profile.characterComponents?.length || 0
    });

    console.log(`🔍 Partial profile ready for "${hanzi}"`);
    return profile;
  }

  /**
   * Enhance partial profile with LLM data in background
   */
  private async enhanceWithLLMData(
    word: Word, 
    baseProfile: WordProfileDTO, 
    onUpdate: (profile: WordProfileDTO) => void,
    isFromCache: boolean
  ): Promise<void> {
    try {
      console.log(`🔍 Enhancing profile for "${word.hanzi}" with LLM data...`);
      
      // If it's from cache and already has LLM data, maybe only update if LLM data is stale or missing critical fields
      if (isFromCache && baseProfile.etymology && baseProfile.examples && baseProfile.examples.length > 0) {
        const generatedDate = new Date(baseProfile.generatedAt);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (generatedDate > oneWeekAgo) {
            console.log(`🔍 LLM data for "${word.hanzi}" is recent (from cache), skipping LLM enhancement.`);
            // Optionally call onUpdate if you want to signal completion anyway
            // onUpdate(baseProfile);
            return;
        }
      }

      const llmData = await this.getLLMData(word);
      if (!llmData) {
        console.log(`🔍 No LLM data received for "${word.hanzi}", using existing or generated.`);
        // If onUpdate is provided, call it with the base profile to signal completion of this step.
        onUpdate(baseProfile);
        return;
      }
      
      const enhancedProfile: WordProfileDTO = {
        ...baseProfile,
        partOfSpeech: llmData.partOfSpeech || baseProfile.partOfSpeech,
        examples: llmData.exampleSentences?.map((ex: any) => ({ ...ex, source: 'LLM' })) || baseProfile.examples,
        etymology: llmData.etymology || baseProfile.etymology,
        usage: llmData.usage || baseProfile.usage,
        memoryAids: llmData.memoryAids || baseProfile.memoryAids,
        generatedAt: new Date().toISOString()
      };

      console.log(`🔍 LLM enhancement complete for "${word.hanzi}"`);
      
      if (this.config.enableCache && this.isProfileComplete(enhancedProfile)) {
        console.log(`🔍 Caching enhanced profile for "${word.hanzi}"`);
        await this.profileCache.set(word.hanzi, enhancedProfile);
      }
      
      onUpdate(enhancedProfile);
      
    } catch (error) {
      console.error(`🔍 Failed to enhance profile for "${word.hanzi}" with LLM:`, error);
      onUpdate(baseProfile); // Fallback to base profile on error
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

  private extractMeanings(word: Word, rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null, dictData: DictionaryResult | null): string[] {
    const meanings = new Set<string>();
    
    meanings.add(word.meaning);
    
    if (rBreakdown?.characters?.some(char => char.radical?.meaning)) {
      rBreakdown?.characters?.forEach(char => {
        if (char.radical?.meaning) meanings.add(char.radical.meaning);
      });
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

  private estimateFrequency(word: Word, rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null): string {
    if (word.repetitions > 20) return 'Very Common';
    if (word.repetitions > 10) return 'Common';
    if (word.repetitions > 5) return 'Moderate';
    if (rBreakdown?.characters?.some(c => c.totalStrokes > 12)) return 'Less Common';
    return 'Uncommon';
  }

  private estimateDifficulty(word: Word, rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null): string {
    const avgStrokes = rBreakdown ? (rBreakdown.totalComplexity / (rBreakdown.characters.length || 1)) : (word.hanzi.length * 8);
    const easeScore = word.ease;

    if (avgStrokes <= 6 && easeScore > 2.5) return 'Beginner';
    if (avgStrokes <= 10 && easeScore > 2.0) return 'Intermediate';
    if (avgStrokes <= 14) return 'Upper Intermediate';
    return 'Advanced';
  }

  private estimateStrokes(hanzi: string): number {
    return hanzi.length * 8;
  }

  private generateEtymologyFromBreakdown(rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null): string {
    if (!rBreakdown || rBreakdown.characters.length === 0) return 'Etymology information unavailable.';
    
    const mainTips = rBreakdown.learningTips?.filter(tip => tip.toLowerCase().includes('radical')) || [];
    if (mainTips.length > 0) return mainTips.join(' '); 

    const firstCharBreakdown = rBreakdown.characters[0];
    if (firstCharBreakdown.radical) {
      return `The character "${firstCharBreakdown.character}" features the "${firstCharBreakdown.radical.character}" (${firstCharBreakdown.radical.meaning}) radical, hinting at its semantic roots.`;
    }
    return 'Basic structural analysis suggests a combination of phonetic and semantic components.';
  }
  
  private generateCulturalNotesFromBreakdown(rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null): string {
    if (!rBreakdown || rBreakdown.characters.length === 0) return 'No specific cultural notes based on structure.';
    const commonThemes = rBreakdown.commonRadicals.map(r => r.meaning).join(', ');
    if (commonThemes) {
      return `This word incorporates elements related to ${commonThemes}, often found in various cultural contexts.`;
    }
    return 'The component radicals often carry cultural significance in Chinese language.';
  }

  private generateMemoryAidsFromBreakdown(rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null): string {
    if (!rBreakdown || rBreakdown.characters.length === 0) return 'Visualize the character shapes and their meanings.';
    const tip = rBreakdown.learningTips?.find(t => !t.toLowerCase().includes('radical'));
    if (tip) return tip;
    if (rBreakdown.commonRadicals.length > 0) {
      return `Associate this word with the meaning of its main radical: "${rBreakdown.commonRadicals[0].character}" (${rBreakdown.commonRadicals[0].meaning}).`;
    }
    return 'Break the word into individual characters and learn their radicals to aid memory.';
  }

  private extractRelatedWords(hanzi: string, rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null): string[] {
    // Placeholder - could be enhanced by searching for other words with commonRadicals
    return []; 
  }

  private async buildCharacterComponentsFromBreakdown(
    rBreakdown: Awaited<ReturnType<RadicalAnalyzer['getWordBreakdown']>> | null
  ): Promise<WordProfileDTO['characterComponents']> {
    if (!rBreakdown) return [];

    const components: WordProfileDTO['characterComponents'] = [];
    for (let charIndex = 0; charIndex < rBreakdown.characters.length; charIndex++) {
      const charAnalysis = rBreakdown.characters[charIndex];

      // Pull pinyin/definition from the Unihan database
      const charData = await this.unihanRepo.getCharacterData(charAnalysis.character);

      components.push({
        char: charAnalysis.character,
        meaning: charData?.definition || '',
        type: 'character',
        strokes: charAnalysis.totalStrokes,
        pinyin: charData?.pinyin || '',
        position: charIndex,
      });

      // Add its main radical
      if (charAnalysis.radical) {
        components.push({
          char: charAnalysis.radical.character,
          meaning: charAnalysis.radical.meaning,
          type: 'radical',
          strokes: charAnalysis.radical.strokes,
          pinyin: charAnalysis.radical.pinyin,
          // Position relative to this character could be inferred, or a general one.
          // For simplicity, let's assign a sub-position or link to the parent char.
          position: charIndex * 10 + 1 // Example positioning scheme
        });
      }
      // Add other components from its composition array
      charAnalysis.composition.forEach((comp, compIndex) => {
        if (comp.type !== 'radical') { // Avoid duplicating the main radical listed above
          components.push({
            char: comp.component,
            meaning: comp.meaning || '',
            type: comp.type,
            strokes: comp.strokes || 0,
            pinyin: comp.pinyin || '',
            position: charIndex * 10 + 2 + compIndex // Example positioning scheme
          });
        }
      });
    }
    return components;
  }

  /**
   * Check if a profile is complete and valid (no placeholder/error data)
   * Only complete profiles should be cached
   */
  private isProfileComplete(profile: WordProfileDTO): boolean {
    if (!profile.radicalBreakdown || profile.radicalBreakdown.characters.length === 0) {
        console.log('🔍 Profile incomplete: missing radical breakdown data.');
        return false;
    }
    if (profile.characterComponents) {
      const hasIncompleteComponents = profile.characterComponents.some(component => {
        const meaning = component.meaning?.toLowerCase() || '';
        return meaning === 'loading...' || 
               meaning === 'unknown meaning' || 
               meaning === 'analysis failed' || 
               meaning === 'request failed' ||
               meaning === 'unknown' ||
               meaning === ''; // Allow empty string for component character if not primary meaning source
      });

      // Loosen this check: Character components can have empty meanings if they are just structural parts
      // The primary meaning comes from the word itself or dictionary.
      // if (hasIncompleteComponents) {
      //   console.log('🔍 Profile incomplete: character components have placeholder meanings');
      //   return false;
      // }
    }

    if (profile.dictionary && profile.dictionary.definitions.length === 0 && profile.meanings.length === 0) {
      console.log('🔍 Profile incomplete: no dictionary definitions or primary meanings');
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
      // Test RadicalAnalyzer via getWordBreakdown as it uses UnihanRepo
      const unihanTest = await this.radicalAnalyzer.getWordBreakdown('人').then(rb => !!rb).catch(() => false);
      const lingvanexTest = this.lingvanexApi ? await this.lingvanexApi.getDictionaryDefinition('测试').then(res => !!res).catch(() => false) : false;
      const llmTest = this.llmAdapter ? true : false; // Assume adapter initializes if key is present
      
      return { unihan: unihanTest, lingvanex: lingvanexTest, llm: llmTest };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { unihan: false, lingvanex: false, llm: false };
    }
  }
}