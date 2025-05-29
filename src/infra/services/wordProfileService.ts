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
import { splitPinyinWithTones } from './pinyinSplitter';

export interface WordProfileConfig {
  lingvanexApiKey?: string;
  togetherApiKey?: string;
  unihanDbPath?: string;
  enableCache?: boolean;
  strokeOrderBaseUrl?: string;
  wordRepository?: any; // Add optional word repository
}

export class WordProfileService {
  private unihanRepo: UnihanRepository;
  private radicalAnalyzer: RadicalAnalyzer;
  private lingvanexApi: LingvanexApi | null;
  private profileCache: ProfileCache;
  private llmAdapter: TogetherAdapter | null;
  private llmAdapterNonCritical: TogetherAdapter | null; // Added for Qwen model
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
      unihanDbPath: this.config.unihanDbPath,
      hasWordRepository: !!this.config.wordRepository
    });

    this.unihanRepo = new UnihanRepository(this.config.unihanDbPath);
    this.radicalAnalyzer = new RadicalAnalyzer(this.unihanRepo);
    this.lingvanexApi = this.config.lingvanexApiKey 
      ? new LingvanexApi(this.config.lingvanexApiKey) 
      : null;
    this.profileCache = new ProfileCache();
    this.llmAdapter = this.config.togetherApiKey 
      ? new TogetherAdapter(this.config.togetherApiKey, 'deepseek-ai/DeepSeek-V3', this.config.wordRepository) 
      : null;
    this.llmAdapterNonCritical = this.config.togetherApiKey // Initialize Qwen adapter
      ? new TogetherAdapter(this.config.togetherApiKey, 'Qwen/Qwen2.5-7B-Instruct-Turbo', this.config.wordRepository)
      : null;

    console.log('🔍 WordProfileService: Services initialized:', {
      hasLingvanexApi: !!this.lingvanexApi,
      hasLlmAdapter: !!this.llmAdapter,
      hasLlmAdapterNonCritical: !!this.llmAdapterNonCritical, // Log Qwen adapter
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
        // Use the primary (DeepSeek) adapter for enhancing cached entries
        if (this.llmAdapter && onUpdate) {
          this.enhanceWithLLMData(word, cached, onUpdate, true, this.llmAdapter); 
        }
        return cached;
      }
    }

    // Build partial profile without LLM data for immediate display
    // Use the non-critical (Qwen) adapter for initial partial profile
    const partialProfile = await this.buildPartialProfile(word, this.llmAdapterNonCritical); 
    
    // Start LLM generation in background (don't await)
    // Use the non-critical (Qwen) adapter for the initial enhancement call
    if (this.llmAdapterNonCritical && onUpdate) {
      this.enhanceWithLLMData(word, partialProfile, onUpdate, false, this.llmAdapterNonCritical);
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
      // Use non-critical adapter for the main build profile as well initially
      this.getLLMData(word, this.llmAdapterNonCritical)
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
      characterComponents: await this.buildCharacterComponentsFromBreakdown(rBreakdown, hanzi, word),
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
  private async buildPartialProfile(word: Word, adapterForLlm?: TogetherAdapter | null): Promise<WordProfileDTO> {
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
      characterComponents: await this.buildCharacterComponentsFromBreakdown(rBreakdown, hanzi, word),
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
    isFromCache: boolean,
    adapterToUse: TogetherAdapter | null // Pass the adapter to use
  ): Promise<void> {
    if (!adapterToUse) {
      console.log(`🔍 enhanceWithLLMData: No adapter provided, skipping enhancement for "${word.hanzi}".`);
      onUpdate(baseProfile);
      return;
    }
    try {
      console.log(`🔍 Enhancing profile for "${word.hanzi}" with LLM data using ${isFromCache ? 'DeepSeek (cache)' : 'Qwen (initial)'}...`);
      
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

      const [llmData, enhancedCharacterComponents] = await Promise.all([
        this.getLLMData(word, adapterToUse), // Use the passed adapter
        this.enhanceCharacterComponentsWithLLM(baseProfile.characterComponents || [], adapterToUse) // Pass adapter here too
      ]);
      
      console.log(`🔍 LLM enhancement results for "${word.hanzi}":`, {
        hasLlmData: !!llmData,
        hasEnhancedCharacterComponents: !!enhancedCharacterComponents,
        enhancedCharacterComponentsLength: enhancedCharacterComponents?.length || 0
      });
      
      // Always create an enhanced profile if we have any enhancements
      const enhancedProfile: WordProfileDTO = {
        ...baseProfile,
        partOfSpeech: llmData?.partOfSpeech || baseProfile.partOfSpeech,
        examples: llmData?.exampleSentences?.map((ex: any) => ({ ...ex, source: 'LLM' })) || baseProfile.examples,
        etymology: llmData?.etymology || baseProfile.etymology,
        usage: llmData?.usage || baseProfile.usage,
        memoryAids: llmData?.memoryAids || baseProfile.memoryAids,
        characterComponents: enhancedCharacterComponents || baseProfile.characterComponents,
        generatedAt: new Date().toISOString()
      };

      // If we have any enhancements, update the profile
      if (llmData || enhancedCharacterComponents) {
        console.log(`🔍 Updating profile with enhancements for "${word.hanzi}"`);
        onUpdate(enhancedProfile);
      } else {
        console.log(`🔍 No LLM data received for "${word.hanzi}", using existing or generated.`);
        onUpdate(baseProfile);
      }

      console.log(`🔍 LLM enhancement complete for "${word.hanzi}"`);
      
      // Cache the enhanced profile if it's complete
      if (this.config.enableCache && (llmData || enhancedCharacterComponents) && this.isProfileComplete(enhancedProfile)) {
        console.log(`🔍 Caching enhanced profile for "${word.hanzi}"`);
        await this.profileCache.set(word.hanzi, enhancedProfile);
      }
      
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

  private async getLLMData(word: Word, adapter: TogetherAdapter | null) {
    if (!adapter) {
      return null;
    }

    try {
      return await adapter.generateWordProfile(word);
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

  /**
   * Enhance character components with LLM-generated meanings when database lookup fails
   */
  private async enhanceCharacterComponentsWithLLM(
    components: WordProfileDTO['characterComponents'],
    adapter: TogetherAdapter | null 
  ): Promise<WordProfileDTO['characterComponents'] | null> {
    if (!adapter || !components || components.length === 0) { 
      console.log('🔍 enhanceCharacterComponentsWithLLM: No LLM adapter or components', {
        hasLlmAdapter: !!adapter, 
        hasComponents: !!components,
        componentsLength: components?.length || 0
      });
      return null;
    }

    const placeholderMeanings = ['Loading...', '', 'unknown meaning', 'meaning unavailable', 'error fetching meaning'];
    const placeholderPinyins = ['Loading...', '', 'unknown', 'N/A', 'pinyin unavailable'];

    const componentsToEnhance = components.filter(comp =>
      placeholderMeanings.includes(comp.meaning?.trim() || '') ||
      placeholderPinyins.includes(comp.pinyin?.trim() || '')
    );

    console.log('🔍 enhanceCharacterComponentsWithLLM: Analysis', {
      totalComponents: components.length,
      componentsIdentifiedForEnhancement: componentsToEnhance.length,
      // Log characters that will be fetched
      charsToFetch: Array.from(new Set(componentsToEnhance.map(c => c.char))) 
    });

    if (componentsToEnhance.length === 0) {
      console.log('🔍 enhanceCharacterComponentsWithLLM: No components need enhancement.');
      return null; 
    }

    const uniqueCharsToFetch = Array.from(new Set(componentsToEnhance.map(c => c.char)));
    
    if (uniqueCharsToFetch.length === 0) {
        console.log('🔍 enhanceCharacterComponentsWithLLM: No unique characters to fetch, though components were identified.');
        return null; 
    }

    try {
      console.log(`🔍 enhanceCharacterComponentsWithLLM: Making API call for ${uniqueCharsToFetch.length} unique character meanings...`);
      const llmGeneratedMeanings = await adapter.generateCharacterMeanings(uniqueCharsToFetch);
      console.log('🔍 enhanceCharacterComponentsWithLLM: LLM response received:', llmGeneratedMeanings);

      if (!llmGeneratedMeanings || llmGeneratedMeanings.length === 0) {
        console.log('🔍 No meanings received from LLM for enhanceCharacterComponentsWithLLM.');
        return null; 
      }

      const meaningMap = new Map(llmGeneratedMeanings.map(m => [m.character, m]));
      
      let updated = false;
      const enhancedComponentsResult = components.map(comp => {
        const originalMeaning = comp.meaning?.trim() || '';
        const originalPinyin = comp.pinyin?.trim() || '';
        
        const needsMeaningEnhancement = placeholderMeanings.includes(originalMeaning);
        const needsPinyinEnhancement = placeholderPinyins.includes(originalPinyin);

        if ((needsMeaningEnhancement || needsPinyinEnhancement) && meaningMap.has(comp.char)) {
          const llmData = meaningMap.get(comp.char)!;
          const newMeaning = needsMeaningEnhancement ? (llmData.meaning || originalMeaning) : originalMeaning;
          const newPinyin = needsPinyinEnhancement ? (llmData.pinyin || originalPinyin) : originalPinyin;

          if (originalMeaning !== newMeaning || originalPinyin !== newPinyin) {
            updated = true;
            console.log(`🔍 Enhanced component ${comp.char}: M: '${originalMeaning}'->'${newMeaning}', P: '${originalPinyin}'->'${newPinyin}'`);
            return {
              ...comp,
              meaning: newMeaning,
              pinyin: newPinyin,
            };
          }
        }
        return comp;
      });

      if (updated) {
        console.log(`🔍 Successfully enhanced character meanings with LLM.`);
        return enhancedComponentsResult;
      } else {
        console.log('🔍 No actual changes made to components after LLM fetch in enhanceCharacterComponentsWithLLM.');
        return null; 
      }
      
    } catch (error) {
      console.error('🔍 Failed to enhance character meanings with LLM:', error);
      return null; 
    }
  }

  /**
   * Split word pinyin into individual character pinyin syllables
   */
  private splitWordPinyinToCharacters(word: Word): string[] {
    const characterCount = word.hanzi.length;
    
    // First try to split the compound pinyin intelligently
    const splitPinyin = splitPinyinWithTones(word.pinyin, characterCount);
    
    if (splitPinyin.length === characterCount) {
      console.log(`🔍 Successfully split pinyin "${word.pinyin}" into:`, splitPinyin);
      return splitPinyin;
    }
    
    // Fallback: if pinyin already has spaces, use those
    const spaceSplit = word.pinyin.split(/\s+/);
    if (spaceSplit.length === characterCount) {
      console.log(`🔍 Using space-split pinyin for "${word.hanzi}":`, spaceSplit);
      return spaceSplit;
    }
    
    // Last resort: return empty array to trigger LLM lookup
    console.warn(`🔍 Could not split pinyin "${word.pinyin}" for word "${word.hanzi}" (${characterCount} characters)`);
    return [];
  }

  private async buildCharacterComponentsFromBreakdown(
    rBreakdown: WordProfileDTO['radicalBreakdown'] | null,
    hanzi?: string,
    word?: Word // Add word parameter to access pinyin
  ): Promise<WordProfileDTO['characterComponents']> {
    const components: WordProfileDTO['characterComponents'] = [];

    // Try to get split pinyin for individual characters
    let characterPinyinArray: string[] = [];
    if (word) {
      characterPinyinArray = this.splitWordPinyinToCharacters(word);
    }

    if (rBreakdown && rBreakdown.characters && rBreakdown.characters.length > 0) {
      // Path 1: Radical breakdown IS available
      console.log(`🔍 Building components from rBreakdown for "${hanzi || rBreakdown.characters.map(c => c.character).join('')}"`);
      for (let charIndex = 0; charIndex < rBreakdown.characters.length; charIndex++) {
        const charAnalysis = rBreakdown.characters[charIndex];

        // Use split pinyin if available, otherwise fall back to 'Loading...'
        const characterPinyin = characterPinyinArray[charIndex] || 'Loading...';

        // Main character from the input word (e.g., "放" or "心")
        components.push({
          char: charAnalysis.character,
          meaning: 'Loading...', // To be filled by LLM via enhanceCharacterComponentsWithLLM
          type: 'character',
          strokes: charAnalysis.totalStrokes,
          pinyin: characterPinyin, // Use split pinyin
          position: charIndex,
        });

        // Its main radical component
        if (charAnalysis.radical) {
          components.push({
            char: charAnalysis.radical.character,
            meaning: charAnalysis.radical.meaning || 'Loading...', 
            type: 'radical',
            strokes: charAnalysis.radical.strokes,
            pinyin: charAnalysis.radical.pinyin || 'Loading...', 
            position: charIndex * 10 + 1, 
          });
        }

        // Other composition elements
        charAnalysis.composition.forEach((compData: {
          component: string;
          type: 'radical' | 'phonetic' | 'semantic' | 'variant';
          meaning?: string;
          pinyin?: string;
          strokes?: number;
          position?: string;
        }, compIndex: number) => {
          // Avoid duplicating the main radical if it's also listed in 'composition' by rBreakdown
          const isMainRadical = charAnalysis.radical && charAnalysis.radical.character === compData.component && compData.type === 'radical';
          if (!isMainRadical) {
            components.push({
              char: compData.component,
              meaning: compData.meaning || 'Loading...', 
              type: compData.type,
              strokes: compData.strokes || 0,
              pinyin: compData.pinyin || 'Loading...', 
              position: charIndex * 10 + 2 + compIndex,
            });
          }
        });
      }
    } else if (hanzi) {
      // Path 2: No radical breakdown, but hanzi string is available
      console.log(`🔍 No rBreakdown for "${hanzi}", creating basic character components for LLM enhancement.`);
      hanzi.split('').forEach((char, index) => {
        // Use split pinyin if available, otherwise fall back to 'Loading...'
        const characterPinyin = characterPinyinArray[index] || 'Loading...';
        
        components.push({
          char: char,
          meaning: 'Loading...', 
          type: 'character',
          strokes: 0, // Unknown, LLM won't provide this. Unihan would.
          pinyin: characterPinyin, // Use split pinyin
          position: index,
        });
      });
    }
    console.log(`🔍 Built ${components.length} initial components for "${hanzi}". Components:`, components.map(c => ({char:c.char, meaning:c.meaning, pinyin:c.pinyin, type:c.type})));
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
        const pinyin = component.pinyin?.toLowerCase() || '';
        return meaning === 'loading...' || 
               meaning === 'unknown meaning' || 
               meaning === 'analysis failed' || 
               meaning === 'request failed' ||
               meaning === 'unknown' ||
               meaning === 'meaning unavailable' ||
               pinyin === 'loading...' ||
               pinyin === 'unknown';
      });

      if (hasIncompleteComponents) {
        console.log('🔍 Profile incomplete: character components have placeholder meanings or pinyin');
        return false;
      }
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

  async testConnections(): Promise<{ unihan: boolean; lingvanex: boolean; llm: boolean; llmNonCritical: boolean }> {
    let unihanOk = false;
    try {
      // Test RadicalAnalyzer via getWordBreakdown as it uses UnihanRepo
      const unihanTest = await this.radicalAnalyzer.getWordBreakdown('人').then(rb => !!rb).catch(() => false);
      unihanOk = unihanTest;
    } catch (e) { /* ignore */ }

    let lingvanexOk = false;
    if (this.lingvanexApi) {
      try {
        // A simple test call, e.g. translate 'hello'
        const testResult = await this.lingvanexApi.lookupWord('你好');
        lingvanexOk = !!testResult;
      } catch (e) { /* ignore */ }
    } else {
      lingvanexOk = true; // No API key, so connection is "ok" (not expected to work)
    }

    let llmOk = false;
    if (this.llmAdapter) {
      try {
        // A simple test call, e.g. generate profile for a common word
        await this.llmAdapter.generateWordProfile({ id: 'test1', hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'hello', ease:0, interval:0, repetitions:0, due: Date.now(), status: 'new', learningStep: 0, createdAt: Date.now() });
        llmOk = true;
      } catch (e) { /* ignore */ }
    } else {
      llmOk = true; // No API key, so connection is "ok"
    }
    
    let llmNonCriticalOk = false;
    if (this.llmAdapterNonCritical) {
      try {
        await this.llmAdapterNonCritical.generateWordProfile({ id: 'test2', hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'hello', ease:0, interval:0, repetitions:0, due: Date.now(), status: 'new', learningStep: 0, createdAt: Date.now() });
        llmNonCriticalOk = true;
      } catch (e) { /* ignore */ }
    } else {
      llmNonCriticalOk = true; // No API key, so connection is "ok"
    }

    return { unihan: unihanOk, lingvanex: lingvanexOk, llm: llmOk, llmNonCritical: llmNonCriticalOk };
  }
}