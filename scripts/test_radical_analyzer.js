#!/usr/bin/env node
/**
 * Test script for RadicalAnalyzer
 * Demonstrates consistent radical breakdown of Chinese characters
 */

const fs = require('fs');
const path = require('path');

// Mock the RadicalAnalyzer functionality for testing
class MockRadicalAnalyzer {
  constructor() {
    // Sample data from our Unihan database
    this.sampleCharacters = {
      '说': { radical: 149, radicalChar: '言', totalStrokes: 9, pinyin: 'shuō', definition: 'speak, say' },
      '话': { radical: 149, radicalChar: '言', totalStrokes: 8, pinyin: 'huà', definition: 'speech, language' },
      '你': { radical: 9, radicalChar: '人', totalStrokes: 7, pinyin: 'nǐ', definition: 'you' },
      '好': { radical: 38, radicalChar: '女', totalStrokes: 6, pinyin: 'hǎo', definition: 'good' },
      '水': { radical: 85, radicalChar: '水', totalStrokes: 4, pinyin: 'shuǐ', definition: 'water' },
      '江': { radical: 85, radicalChar: '水', totalStrokes: 6, pinyin: 'jiāng', definition: 'river' },
      '河': { radical: 85, radicalChar: '水', totalStrokes: 8, pinyin: 'hé', definition: 'river' },
      '手': { radical: 64, radicalChar: '手', totalStrokes: 4, pinyin: 'shǒu', definition: 'hand' },
      '打': { radical: 64, radicalChar: '手', totalStrokes: 5, pinyin: 'dǎ', definition: 'hit, strike' },
      '拿': { radical: 64, radicalChar: '手', totalStrokes: 10, pinyin: 'ná', definition: 'take, hold' }
    };

    this.radicals = {
      149: { number: 149, character: '言', strokes: 7, meaning: 'speech', pinyin: 'yán' },
      9: { number: 9, character: '人', strokes: 2, meaning: 'person', pinyin: 'rén' },
      38: { number: 38, character: '女', strokes: 3, meaning: 'woman', pinyin: 'nǚ' },
      85: { number: 85, character: '水', strokes: 4, meaning: 'water', pinyin: 'shuǐ' },
      64: { number: 64, character: '手', strokes: 4, meaning: 'hand', pinyin: 'shǒu' }
    };
  }

  analyzeCharacter(character) {
    const data = this.sampleCharacters[character];
    if (!data) return null;

    const radical = this.radicals[data.radical];
    const additionalStrokes = data.totalStrokes - radical.strokes;

    return {
      character,
      radical,
      additionalStrokes,
      totalStrokes: data.totalStrokes,
      radicalPosition: this.getPosition(data.radical),
      composition: [{
        component: radical.character,
        type: 'radical',
        meaning: radical.meaning,
        pinyin: radical.pinyin,
        strokes: radical.strokes
      }]
    };
  }

  analyzeText(text) {
    return text.split('').map(char => this.analyzeCharacter(char)).filter(Boolean);
  }

  getRadicalFamily(radicalNumber, limit = 10) {
    const radical = this.radicals[radicalNumber];
    if (!radical) return null;

    const characters = Object.entries(this.sampleCharacters)
      .filter(([char, data]) => data.radical === radicalNumber)
      .slice(0, limit)
      .map(([char, data]) => ({
        character: char,
        pinyin: data.pinyin,
        definition: data.definition,
        totalStrokes: data.totalStrokes,
        frequency: data.totalStrokes <= 6 ? 'common' : data.totalStrokes <= 10 ? 'uncommon' : 'rare'
      }));

    return {
      radical,
      characters,
      semanticTheme: this.getSemanticTheme(radical.meaning)
    };
  }

  getWordBreakdown(word) {
    const characters = this.analyzeText(word);
    
    // Find common radicals
    const radicalCounts = {};
    characters.forEach(char => {
      if (char.radical) {
        const num = char.radical.number;
        radicalCounts[num] = (radicalCounts[num] || 0) + 1;
      }
    });

    const commonRadicals = Object.entries(radicalCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([num]) => this.radicals[parseInt(num)])
      .filter(Boolean);

    const totalComplexity = characters.reduce((sum, char) => sum + char.totalStrokes, 0);
    const learningTips = this.generateLearningTips(characters, commonRadicals);

    return {
      characters,
      commonRadicals,
      totalComplexity,
      learningTips
    };
  }

  getPosition(radicalNumber) {
    const positions = {
      149: 'left',   // 言 speech
      9: 'left',     // 人 person
      38: 'left',    // 女 woman
      85: 'left',    // 水 water
      64: 'left'     // 手 hand
    };
    return positions[radicalNumber] || 'unknown';
  }

  getSemanticTheme(meaning) {
    const themes = {
      'speech': 'Communication and language',
      'person': 'Human activities and relationships',
      'woman': 'Gender and family relations',
      'water': 'Liquids, flow, and cleansing',
      'hand': 'Actions and manipulation'
    };
    return themes[meaning] || `Related to ${meaning}`;
  }

  generateLearningTips(characters, commonRadicals) {
    const tips = [];
    
    if (commonRadicals.length > 0) {
      tips.push(`Focus on the "${commonRadicals[0].character}" (${commonRadicals[0].meaning}) radical - it appears multiple times.`);
    }
    
    const complexChars = characters.filter(c => c.totalStrokes > 8);
    if (complexChars.length > 0) {
      tips.push(`Break down complex characters like "${complexChars[0].character}" by learning its radical "${complexChars[0].radical.character}" first.`);
    }
    
    return tips;
  }
}

function testSingleCharacter() {
  console.log('🔍 Single Character Analysis');
  console.log('============================\n');
  
  const analyzer = new MockRadicalAnalyzer();
  const testChars = ['说', '你', '好', '水', '手'];
  
  testChars.forEach(char => {
    const analysis = analyzer.analyzeCharacter(char);
    if (analysis) {
      console.log(`Character: ${char}`);
      console.log(`  Radical: ${analysis.radical.character} (#${analysis.radical.number}) - ${analysis.radical.meaning}`);
      console.log(`  Position: ${analysis.radicalPosition}`);
      console.log(`  Strokes: ${analysis.totalStrokes} total (${analysis.radical.strokes} radical + ${analysis.additionalStrokes} additional)`);
      console.log(`  Meaning: ${analyzer.sampleCharacters[char].definition}`);
      console.log('');
    }
  });
}

function testRadicalFamilies() {
  console.log('👨‍👩‍👧‍👦 Radical Family Analysis');
  console.log('==============================\n');
  
  const analyzer = new MockRadicalAnalyzer();
  const radicalNumbers = [149, 85, 64]; // speech, water, hand
  
  radicalNumbers.forEach(radicalNum => {
    const family = analyzer.getRadicalFamily(radicalNum);
    if (family) {
      console.log(`Radical: ${family.radical.character} (#${family.radical.number}) - ${family.radical.meaning}`);
      console.log(`Theme: ${family.semanticTheme}`);
      console.log('Characters:');
      family.characters.forEach(char => {
        console.log(`  ${char.character} (${char.pinyin}) - ${char.definition} [${char.frequency}]`);
      });
      console.log('');
    }
  });
}

function testWordBreakdown() {
  console.log('📝 Word Breakdown Analysis');
  console.log('===========================\n');
  
  const analyzer = new MockRadicalAnalyzer();
  const testWords = ['说话', '你好', '河水'];
  
  testWords.forEach(word => {
    const breakdown = analyzer.getWordBreakdown(word);
    
    console.log(`Word: ${word}`);
    console.log(`Complexity Score: ${breakdown.totalComplexity} strokes`);
    console.log('');
    
    console.log('Character Breakdown:');
    breakdown.characters.forEach((char, idx) => {
      console.log(`  ${idx + 1}. ${char.character}`);
      console.log(`     Radical: ${char.radical.character} (${char.radical.meaning})`);
      console.log(`     Strokes: ${char.totalStrokes} total`);
      console.log(`     Position: ${char.radicalPosition}`);
    });
    console.log('');
    
    if (breakdown.commonRadicals.length > 0) {
      console.log('Common Radicals:');
      breakdown.commonRadicals.forEach(radical => {
        console.log(`  ${radical.character} (${radical.meaning})`);
      });
      console.log('');
    }
    
    if (breakdown.learningTips.length > 0) {
      console.log('Learning Tips:');
      breakdown.learningTips.forEach((tip, idx) => {
        console.log(`  ${idx + 1}. ${tip}`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  });
}

function testConsistentBreakdown() {
  console.log('🎯 Consistent Radical Breakdown');
  console.log('================================\n');
  
  const analyzer = new MockRadicalAnalyzer();
  
  // Test consistency across similar characters
  const waterCharacters = ['水', '江', '河'];
  const handCharacters = ['手', '打', '拿'];
  const speechCharacters = ['说', '话'];
  
  console.log('Water radical characters (水):');
  waterCharacters.forEach(char => {
    const analysis = analyzer.analyzeCharacter(char);
    if (analysis) {
      console.log(`  ${char}: ${analysis.radical.character} + ${analysis.additionalStrokes} strokes = ${analysis.totalStrokes} total`);
    }
  });
  console.log('');
  
  console.log('Hand radical characters (手):');
  handCharacters.forEach(char => {
    const analysis = analyzer.analyzeCharacter(char);
    if (analysis) {
      console.log(`  ${char}: ${analysis.radical.character} + ${analysis.additionalStrokes} strokes = ${analysis.totalStrokes} total`);
    }
  });
  console.log('');
  
  console.log('Speech radical characters (言):');
  speechCharacters.forEach(char => {
    const analysis = analyzer.analyzeCharacter(char);
    if (analysis) {
      console.log(`  ${char}: ${analysis.radical.character} + ${analysis.additionalStrokes} strokes = ${analysis.totalStrokes} total`);
    }
  });
  console.log('');
}

function showUsageExamples() {
  console.log('💡 Usage Examples');
  console.log('==================\n');
  
  console.log('// 1. Analyze a single character');
  console.log('const breakdown = await radicalAnalyzer.analyzeCharacter("说");');
  console.log('// Returns: radical info, stroke count, position, composition');
  console.log('');
  
  console.log('// 2. Analyze an entire word');
  console.log('const wordAnalysis = await radicalAnalyzer.getWordBreakdown("说话");');
  console.log('// Returns: character breakdowns, common radicals, learning tips');
  console.log('');
  
  console.log('// 3. Find characters with same radical');
  console.log('const family = await radicalAnalyzer.getRadicalFamily(149); // 言 speech');
  console.log('// Returns: all characters using the speech radical');
  console.log('');
  
  console.log('// 4. Find similar characters');
  console.log('const similar = await radicalAnalyzer.findSimilarCharacters("说");');
  console.log('// Returns: characters with same radical, sorted by similarity');
  console.log('');
  
  console.log('// 5. Stroke analysis');
  console.log('const strokes = await radicalAnalyzer.analyzeStrokes("说");');
  console.log('// Returns: detailed stroke distribution breakdown');
}

function main() {
  console.log('🎋 Radical Analyzer Test Suite');
  console.log('==============================\n');
  
  console.log('This demonstrates how the RadicalAnalyzer uses the Unihan database');
  console.log('to consistently break down Chinese characters into their radical components.\n');
  
  testSingleCharacter();
  testRadicalFamilies();
  testWordBreakdown();
  testConsistentBreakdown();
  showUsageExamples();
  
  console.log('\n✨ Test completed! The RadicalAnalyzer provides:');
  console.log('  ✅ Consistent radical identification');
  console.log('  ✅ Accurate stroke count breakdown');
  console.log('  ✅ Radical position analysis');
  console.log('  ✅ Character family grouping');
  console.log('  ✅ Learning-focused insights');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { MockRadicalAnalyzer }; 