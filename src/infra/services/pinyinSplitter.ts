/**
 * Pinyin Syllable Splitter
 * Intelligently splits compound pinyin like "fàngxīn" into ["fàng", "xīn"]
 * Preserves tone marks in the output
 */

// Complete list of valid Mandarin pinyin syllables (without tone marks)
const PINYIN_SYLLABLES = new Set([
  // Single vowels
  'a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'er',
  
  // With 'b'
  'ba', 'bai', 'ban', 'bang', 'bao', 'bei', 'ben', 'beng', 'bi', 'bian', 'biao', 'bie', 'bin', 'bing', 'bo', 'bu',
  
  // With 'p'
  'pa', 'pai', 'pan', 'pang', 'pao', 'pei', 'pen', 'peng', 'pi', 'pian', 'piao', 'pie', 'pin', 'ping', 'po', 'pou', 'pu',
  
  // With 'm'
  'ma', 'mai', 'man', 'mang', 'mao', 'me', 'mei', 'men', 'meng', 'mi', 'mian', 'miao', 'mie', 'min', 'ming', 'miu', 'mo', 'mou', 'mu',
  
  // With 'f'
  'fa', 'fan', 'fang', 'fei', 'fen', 'feng', 'fo', 'fou', 'fu',
  
  // With 'd'
  'da', 'dai', 'dan', 'dang', 'dao', 'de', 'dei', 'den', 'deng', 'di', 'dian', 'diao', 'die', 'ding', 'diu', 'dong', 'dou', 'du', 'duan', 'dui', 'dun', 'duo',
  
  // With 't'
  'ta', 'tai', 'tan', 'tang', 'tao', 'te', 'tei', 'teng', 'ti', 'tian', 'tiao', 'tie', 'ting', 'tong', 'tou', 'tu', 'tuan', 'tui', 'tun', 'tuo',
  
  // With 'n'
  'na', 'nai', 'nan', 'nang', 'nao', 'ne', 'nei', 'nen', 'neng', 'ni', 'nian', 'niang', 'niao', 'nie', 'nin', 'ning', 'niu', 'nong', 'nou', 'nu', 'nuan', 'nue', 'nuo', 'nv', 'nve',
  
  // With 'l'
  'la', 'lai', 'lan', 'lang', 'lao', 'le', 'lei', 'leng', 'li', 'lia', 'lian', 'liang', 'liao', 'lie', 'lin', 'ling', 'liu', 'long', 'lou', 'lu', 'luan', 'lue', 'lun', 'luo', 'lv', 'lve',
  
  // With 'g'
  'ga', 'gai', 'gan', 'gang', 'gao', 'ge', 'gei', 'gen', 'geng', 'gong', 'gou', 'gu', 'gua', 'guai', 'guan', 'guang', 'gui', 'gun', 'guo',
  
  // With 'k'
  'ka', 'kai', 'kan', 'kang', 'kao', 'ke', 'ken', 'keng', 'kong', 'kou', 'ku', 'kua', 'kuai', 'kuan', 'kuang', 'kui', 'kun', 'kuo',
  
  // With 'h'
  'ha', 'hai', 'han', 'hang', 'hao', 'he', 'hei', 'hen', 'heng', 'hong', 'hou', 'hu', 'hua', 'huai', 'huan', 'huang', 'hui', 'hun', 'huo',
  
  // With 'j'
  'ji', 'jia', 'jian', 'jiang', 'jiao', 'jie', 'jin', 'jing', 'jiong', 'jiu', 'ju', 'juan', 'jue', 'jun',
  
  // With 'q'
  'qi', 'qia', 'qian', 'qiang', 'qiao', 'qie', 'qin', 'qing', 'qiong', 'qiu', 'qu', 'quan', 'que', 'qun',
  
  // With 'x'
  'xi', 'xia', 'xian', 'xiang', 'xiao', 'xie', 'xin', 'xing', 'xiong', 'xiu', 'xu', 'xuan', 'xue', 'xun',
  
  // With 'z'
  'za', 'zai', 'zan', 'zang', 'zao', 'ze', 'zei', 'zen', 'zeng', 'zha', 'zhai', 'zhan', 'zhang', 'zhao', 'zhe', 'zhei', 'zhen', 'zheng', 'zhi', 'zhong', 'zhou', 'zhu', 'zhua', 'zhuai', 'zhuan', 'zhuang', 'zhui', 'zhun', 'zhuo', 'zi', 'zong', 'zou', 'zu', 'zuan', 'zui', 'zun', 'zuo',
  
  // With 'c'
  'ca', 'cai', 'can', 'cang', 'cao', 'ce', 'cen', 'ceng', 'cha', 'chai', 'chan', 'chang', 'chao', 'che', 'chen', 'cheng', 'chi', 'chong', 'chou', 'chu', 'chua', 'chuai', 'chuan', 'chuang', 'chui', 'chun', 'chuo', 'ci', 'cong', 'cou', 'cu', 'cuan', 'cui', 'cun', 'cuo',
  
  // With 's'
  'sa', 'sai', 'san', 'sang', 'sao', 'se', 'sen', 'seng', 'sha', 'shai', 'shan', 'shang', 'shao', 'she', 'shei', 'shen', 'sheng', 'shi', 'shou', 'shu', 'shua', 'shuai', 'shuan', 'shuang', 'shui', 'shun', 'shuo', 'si', 'song', 'sou', 'su', 'suan', 'sui', 'sun', 'suo',
  
  // With 'r'
  'ran', 'rang', 'rao', 're', 'ren', 'reng', 'ri', 'rong', 'rou', 'ru', 'rua', 'ruan', 'rui', 'run', 'ruo',
  
  // With 'y'
  'ya', 'yai', 'yan', 'yang', 'yao', 'ye', 'yi', 'yin', 'ying', 'yo', 'yong', 'you', 'yu', 'yuan', 'yue', 'yun',
  
  // With 'w'
  'wa', 'wai', 'wan', 'wang', 'wei', 'wen', 'weng', 'wo', 'wu'
]);

/**
 * Removes tone marks from pinyin to get base syllable for matching
 */
function removeToneMarks(pinyin: string): string {
  return pinyin
    .toLowerCase()
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'v')
    .replace(/[ńň]/g, 'n');
}

/**
 * Extracts the toned syllable from the original pinyin based on character positions
 */
function extractTonedSyllable(originalPinyin: string, startIndex: number, length: number): string {
  return originalPinyin.substring(startIndex, startIndex + length);
}

/**
 * Splits compound pinyin into individual syllables with tone marks preserved
 * Uses greedy longest-match algorithm
 */
export function splitPinyinWithTones(compoundPinyin: string, expectedSyllableCount?: number): string[] {
  if (!compoundPinyin) return [];
  
  const trimmed = compoundPinyin.trim();
  
  // If already contains spaces, split by spaces and return
  if (trimmed.includes(' ')) {
    const spaceSplit = trimmed.split(/\s+/);
    if (!expectedSyllableCount || spaceSplit.length === expectedSyllableCount) {
      return spaceSplit;
    }
  }
  
  const normalized = removeToneMarks(trimmed);
  const syllables: string[] = [];
  let originalIndex = 0;
  let normalizedIndex = 0;
  
  while (normalizedIndex < normalized.length && originalIndex < trimmed.length) {
    let found = false;
    
    // Try longest possible syllable first (up to 6 characters: "zhuang")
    for (let len = Math.min(6, normalized.length - normalizedIndex); len >= 1; len--) {
      const candidate = normalized.substring(normalizedIndex, normalizedIndex + len);
      
      if (PINYIN_SYLLABLES.has(candidate)) {
        // Find the corresponding section in the original pinyin with tone marks
        let tonedSyllable = '';
        let searchStart = originalIndex;
        
        // Look for the syllable in the original string, accounting for tone marks
        for (let originalLen = len; originalLen <= len + 3; originalLen++) {
          if (searchStart + originalLen > trimmed.length) break;
          
          const candidateToned = trimmed.substring(searchStart, searchStart + originalLen);
          const candidateNormalized = removeToneMarks(candidateToned);
          
          if (candidateNormalized === candidate) {
            tonedSyllable = candidateToned;
            originalIndex = searchStart + originalLen;
            break;
          }
        }
        
        if (!tonedSyllable) {
          // Fallback: use the normalized version if we can't find toned version
          tonedSyllable = candidate;
          originalIndex += len;
        }
        
        syllables.push(tonedSyllable);
        normalizedIndex += len;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // If no valid syllable found, skip this character
      normalizedIndex++;
      originalIndex++;
    }
  }
  
  // Validate result
  if (expectedSyllableCount && syllables.length !== expectedSyllableCount) {
    console.warn(`Pinyin split mismatch: expected ${expectedSyllableCount} syllables, got ${syllables.length} from "${compoundPinyin}"`);
    console.warn(`Split result:`, syllables);
    
    // If we have too few syllables, return empty array to trigger fallback
    if (syllables.length < expectedSyllableCount) {
      return [];
    }
  }
  
  return syllables;
}

/**
 * Splits compound pinyin into individual syllables (without tone preservation)
 * Useful for internal processing
 */
export function splitPinyin(compoundPinyin: string): string[] {
  if (!compoundPinyin) return [];
  
  const normalized = removeToneMarks(compoundPinyin.trim());
  const syllables: string[] = [];
  let i = 0;
  
  while (i < normalized.length) {
    let found = false;
    
    // Try longest possible syllable first (up to 6 characters: "zhuang")
    for (let len = Math.min(6, normalized.length - i); len >= 1; len--) {
      const candidate = normalized.substring(i, i + len);
      
      if (PINYIN_SYLLABLES.has(candidate)) {
        syllables.push(candidate);
        i += len;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // If no valid syllable found, skip this character
      i++;
    }
  }
  
  return syllables;
} 