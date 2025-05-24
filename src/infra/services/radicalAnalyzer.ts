/**
 * Radical Analyzer Service
 * Uses Unihan database to consistently break down Chinese characters into radical components
 */

import { UnihanRepository, RadicalInfo } from '../storage/unihanRepo';
import { UnihanEntry } from '../../domain/entities';

export interface RadicalBreakdown {
  character: string;
  radical: RadicalInfo | null;
  additionalStrokes: number;
  totalStrokes: number;
  radicalPosition: 'left' | 'right' | 'top' | 'bottom' | 'enclosing' | 'unknown';
  composition: CharacterComponent[];
}

export interface CharacterComponent {
  component: string;
  type: 'radical' | 'phonetic' | 'semantic' | 'variant';
  meaning?: string;
  pinyin?: string;
  strokes?: number;
  position?: string;
}

export interface RadicalFamily {
  radical: RadicalInfo;
  characters: Array<{
    character: string;
    pinyin: string;
    definition: string;
    totalStrokes: number;
    frequency: 'common' | 'uncommon' | 'rare';
  }>;
  semanticTheme: string;
}

export interface StrokeAnalysis {
  character: string;
  totalStrokes: number;
  radicalStrokes: number;
  additionalStrokes: number;
  strokeDistribution: {
    radical: number;
    phonetic?: number;
    other: number;
  };
}

export class RadicalAnalyzer {
  private unihanRepo: UnihanRepository;
  private radicalCache: Map<number, RadicalInfo> = new Map();
  private characterCache: Map<string, UnihanEntry> = new Map();

  // Common radical positions based on radical number patterns
  private radicalPositions: Map<number, string> = new Map([
    // Left side radicals
    [9, 'left'],    // 人 person
    [18, 'left'],   // 刀 knife
    [32, 'left'],   // 土 earth
    [38, 'left'],   // 女 woman
    [39, 'left'],   // 子 child
    [61, 'left'],   // 心 heart
    [64, 'left'],   // 手 hand
    [85, 'left'],   // 水 water
    [86, 'left'],   // 火 fire
    [94, 'left'],   // 犬 dog
    [109, 'left'],  // 目 eye
    [120, 'left'],  // 糸 silk
    [140, 'left'],  // 艸 grass
    [149, 'left'],  // 言 speech
    [162, 'left'],  // 辵 walk
    [167, 'left'],  // 金 metal
    
    // Top radicals
    [8, 'top'],     // 亠 lid
    [14, 'top'],    // 冖 cover
    [37, 'top'],    // 大 big
    [40, 'top'],    // 宀 roof
    [44, 'top'],    // 尸 corpse
    [118, 'top'],   // 竹 bamboo
    [122, 'top'],   // 网 net
    [140, 'top'],   // 艸 grass (can be top or left)
    
    // Bottom radicals
    [1, 'bottom'],  // 一 one
    [10, 'bottom'], // 儿 legs
    [24, 'bottom'], // 十 ten
    [86, 'bottom'], // 火 fire (can be bottom as 灬)
    [8, 'bottom'],  // 八 eight
    
    // Enclosing radicals
    [11, 'enclosing'], // 入 enter
    [13, 'enclosing'], // 冂 box
    [16, 'enclosing'], // 几 table
    [31, 'enclosing'], // 囗 enclosure
    [50, 'enclosing'], // 巾 turban
    
    // Right side radicals
    [18, 'right'],  // 刀 knife (can be right as 刂)
    [163, 'right'], // 邑 city
    [170, 'right'], // 阜 mound
  ]);

  constructor(unihanRepo: UnihanRepository) {
    this.unihanRepo = unihanRepo;
  }

  /**
   * Analyze a single character's radical breakdown
   */
  async analyzeCharacter(character: string): Promise<RadicalBreakdown | null> {
    try {
      const characterData = await this.getCharacterData(character);
      if (!characterData || !characterData.radical) {
        return null;
      }

      const radical = await this.getRadicalInfo(characterData.radical);
      if (!radical) {
        return null;
      }

      const additionalStrokes = characterData.totalStrokes - radical.strokes;
      const position = this.determineRadicalPosition(characterData.radical, character);
      const composition = await this.analyzeComposition(character, radical);

      return {
        character,
        radical,
        additionalStrokes: Math.max(0, additionalStrokes),
        totalStrokes: characterData.totalStrokes,
        radicalPosition: position,
        composition
      };
    } catch (error) {
      console.error(`Failed to analyze character ${character}:`, error);
      return null;
    }
  }

  /**
   * Analyze multiple characters at once
   */
  async analyzeText(text: string): Promise<RadicalBreakdown[]> {
    const characters = text.split('').filter(char => this.isChinese(char));
    const analyses = await Promise.all(
      characters.map(char => this.analyzeCharacter(char))
    );
    
    return analyses.filter((analysis): analysis is RadicalBreakdown => analysis !== null);
  }

  /**
   * Find all characters that share the same radical
   */
  async getRadicalFamily(radicalNumber: number, limit = 20): Promise<RadicalFamily | null> {
    try {
      const radical = await this.getRadicalInfo(radicalNumber);
      if (!radical) {
        return null;
      }

      const characters = await this.unihanRepo.getCharactersByRadical(radicalNumber, limit);
      
      const familyMembers = characters.map(char => ({
        character: char.character,
        pinyin: char.pinyin || '',
        definition: char.definition || '',
        totalStrokes: char.totalStrokes,
        frequency: this.estimateFrequency(char.character, char.totalStrokes)
      }));

      // Sort by frequency and stroke count
      familyMembers.sort((a, b) => {
        const freqOrder = { common: 0, uncommon: 1, rare: 2 };
        if (freqOrder[a.frequency] !== freqOrder[b.frequency]) {
          return freqOrder[a.frequency] - freqOrder[b.frequency];
        }
        return a.totalStrokes - b.totalStrokes;
      });

      return {
        radical,
        characters: familyMembers,
        semanticTheme: this.getSemanticTheme(radical.meaning)
      };
    } catch (error) {
      console.error(`Failed to get radical family for ${radicalNumber}:`, error);
      return null;
    }
  }

  /**
   * Analyze stroke distribution within a character
   */
  async analyzeStrokes(character: string): Promise<StrokeAnalysis | null> {
    try {
      const breakdown = await this.analyzeCharacter(character);
      if (!breakdown || !breakdown.radical) {
        return null;
      }

      const phonetic = breakdown.composition.find(c => c.type === 'phonetic');
      const phoneticStrokes = phonetic?.strokes || 0;
      const otherStrokes = breakdown.totalStrokes - breakdown.radical.strokes - phoneticStrokes;

      return {
        character,
        totalStrokes: breakdown.totalStrokes,
        radicalStrokes: breakdown.radical.strokes,
        additionalStrokes: breakdown.additionalStrokes,
        strokeDistribution: {
          radical: breakdown.radical.strokes,
          phonetic: phoneticStrokes > 0 ? phoneticStrokes : undefined,
          other: Math.max(0, otherStrokes)
        }
      };
    } catch (error) {
      console.error(`Failed to analyze strokes for ${character}:`, error);
      return null;
    }
  }

  /**
   * Find characters with similar radical patterns
   */
  async findSimilarCharacters(character: string, limit = 10): Promise<UnihanEntry[]> {
    try {
      const breakdown = await this.analyzeCharacter(character);
      if (!breakdown || !breakdown.radical) {
        return [];
      }

      // Get characters with same radical
      const sameRadical = await this.unihanRepo.getCharactersByRadical(
        breakdown.radical.number, 
        limit * 2
      );

      // Filter and sort by similarity
      return sameRadical
        .filter(char => char.character !== character)
        .sort((a, b) => {
          // Prefer characters with similar stroke count
          const aDiff = Math.abs(a.totalStrokes - breakdown.totalStrokes);
          const bDiff = Math.abs(b.totalStrokes - breakdown.totalStrokes);
          return aDiff - bDiff;
        })
        .slice(0, limit);
    } catch (error) {
      console.error(`Failed to find similar characters for ${character}:`, error);
      return [];
    }
  }

  /**
   * Get comprehensive breakdown for word learning
   */
  async getWordBreakdown(word: string): Promise<{
    characters: RadicalBreakdown[];
    commonRadicals: RadicalInfo[];
    totalComplexity: number;
    learningTips: string[];
  }> {
    const characters = await this.analyzeText(word);
    
    // Find most common radicals
    const radicalCounts = new Map<number, { radical: RadicalInfo; count: number }>();
    characters.forEach(char => {
      if (char.radical) {
        const existing = radicalCounts.get(char.radical.number);
        if (existing) {
          existing.count++;
        } else {
          radicalCounts.set(char.radical.number, { radical: char.radical, count: 1 });
        }
      }
    });

    const commonRadicals = Array.from(radicalCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(entry => entry.radical);

    // Calculate complexity score
    const totalComplexity = characters.reduce((sum, char) => sum + char.totalStrokes, 0);

    // Generate learning tips
    const learningTips = this.generateLearningTips(characters, commonRadicals);

    return {
      characters,
      commonRadicals,
      totalComplexity,
      learningTips
    };
  }

  // Private helper methods

  private async getCharacterData(character: string): Promise<UnihanEntry | null> {
    if (this.characterCache.has(character)) {
      return this.characterCache.get(character)!;
    }

    const data = await this.unihanRepo.getCharacterData(character);
    if (data) {
      this.characterCache.set(character, data);
    }
    return data;
  }

  private async getRadicalInfo(radicalNumber: number): Promise<RadicalInfo | null> {
    if (this.radicalCache.has(radicalNumber)) {
      return this.radicalCache.get(radicalNumber)!;
    }

    const info = await this.unihanRepo.getRadicalInfo(radicalNumber);
    if (info) {
      this.radicalCache.set(radicalNumber, info);
    }
    return info;
  }

  private determineRadicalPosition(radicalNumber: number, character: string): 'left' | 'right' | 'top' | 'bottom' | 'enclosing' | 'unknown' {
    // Use known position patterns
    const knownPosition = this.radicalPositions.get(radicalNumber);
    if (knownPosition) {
      return knownPosition as any;
    }

    // Simple heuristics based on character structure
    // This could be enhanced with more sophisticated analysis
    if (radicalNumber <= 20) return 'top';
    if (radicalNumber >= 140 && radicalNumber <= 170) return 'left';
    if (radicalNumber >= 170) return 'right';
    
    return 'unknown';
  }

  private async analyzeComposition(character: string, radical: RadicalInfo): Promise<CharacterComponent[]> {
    const components: CharacterComponent[] = [
      {
        component: radical.character,
        type: 'radical',
        meaning: radical.meaning,
        pinyin: radical.pinyin,
        strokes: radical.strokes,
        position: this.determineRadicalPosition(radical.number, character)
      }
    ];

    // For now, return just the radical
    // This could be enhanced to detect phonetic components, etc.
    return components;
  }

  private estimateFrequency(character: string, strokes: number): 'common' | 'uncommon' | 'rare' {
    // Simple heuristic based on stroke count and character patterns
    if (strokes <= 8) return 'common';
    if (strokes <= 12) return 'uncommon';
    return 'rare';
  }

  private getSemanticTheme(radicalMeaning: string): string {
    const themeMap: { [key: string]: string } = {
      'person': 'Human activities and relationships',
      'hand': 'Actions and manipulation',
      'water': 'Liquids, flow, and cleansing',
      'fire': 'Heat, energy, and transformation',
      'earth': 'Ground, stability, and materials',
      'tree': 'Plants, growth, and natural materials',
      'metal': 'Tools, weapons, and minerals',
      'mouth': 'Speech, eating, and communication',
      'heart': 'Emotions and feelings',
      'eye': 'Vision and perception',
      'speech': 'Communication and language',
      'grass': 'Plants and vegetation',
      'silk': 'Textiles and fine materials',
      'walk': 'Movement and travel'
    };

    return themeMap[radicalMeaning.toLowerCase()] || `Related to ${radicalMeaning}`;
  }

  private generateLearningTips(characters: RadicalBreakdown[], commonRadicals: RadicalInfo[]): string[] {
    const tips: string[] = [];

    if (commonRadicals.length > 0) {
      tips.push(`Focus on the "${commonRadicals[0].character}" (${commonRadicals[0].meaning}) radical - it appears multiple times in this word.`);
    }

    const complexCharacters = characters.filter(c => c.totalStrokes > 12);
    if (complexCharacters.length > 0) {
      tips.push(`Break down complex characters like "${complexCharacters[0].character}" by learning its radical "${complexCharacters[0].radical?.character}" first.`);
    }

    const simpleCharacters = characters.filter(c => c.totalStrokes <= 6);
    if (simpleCharacters.length > 0) {
      tips.push(`Start with simpler characters like "${simpleCharacters[0].character}" to build foundation.`);
    }

    return tips;
  }

  private isChinese(char: string): boolean {
    const code = char.charCodeAt(0);
    return (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
           (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
           (code >= 0x20000 && code <= 0x2a6df);  // CJK Extension B
  }
} 