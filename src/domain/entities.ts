/**
 * Core domain entities for WeiLang
 */

export interface Word {
  id: string;            // uuid
  hanzi: string;
  pinyin: string;
  meaning: string;
  
  // Spaced repetition fields
  ease: number;          // SM-2 factor (default 2.5)
  interval: number;      // days until next review
  repetitions: number;   // number of successful reviews
  due: number;           // epoch ms when due for review
  status: "new" | "learning" | "review";
  
  // Learning queue fields
  learningStep: number;  // current step in learning sequence (0 = not in learning)
  learningDue?: number;  // epoch ms when due for learning review
  
  createdAt: number;     // epoch ms
  updatedAt?: number;    // epoch ms
}

export interface Example {
  id: string;
  wordId: string;
  hanzi: string;
  pinyin: string;
  gloss: string;
  createdAt: number;
}

export interface WordProfile {
  id: string;
  wordId: string;
  partOfSpeech: string;
  detailedMeaning: string;
  exampleSentences: {
    hanzi: string;
    pinyin: string;
    gloss: string;
  }[];
  etymology?: string;
  usage?: string;
  createdAt: number;
}

// Enhanced word profile with comprehensive data
export interface WordProfileDTO {
  hanzi: string;
  pinyin: string;
  primaryMeaning: string;
  meanings: string[];
  partOfSpeech: string;
  radical: {
    number: number;
    char: string;
    meaning: string;
    strokes: number;
  } | null;
  totalStrokes: number;
  strokeSvgUrl: string;
  dictionary: {
    definitions: string[];
    synonyms: string[];
    antonyms: string[];
    source: 'Lingvanex' | 'LLM';
  };
  examples: Array<{
    hanzi: string;
    pinyin: string;
    gloss: string;
    source: 'User' | 'LLM';
  }>;
  frequency: string; // e.g., "Common", "HSK1"
  difficulty: string; // e.g., "Beginner", "Advanced"
  etymology?: string;
  usage?: string; // Contextual usage notes
  culturalNotes?: string;
  memoryAids?: string;
  relatedWords?: string[]; // Words that share characters
  characterComponents?: Array<{
    char: string;
    meaning: string;
    type: 'radical' | 'phonetic' | 'semantic' | 'variant' | 'character'; // Added 'character'
    strokes: number;
    pinyin?: string;
    position?: number; // For display order/layout
  }>;
  // Add the new field for comprehensive radical breakdown from RadicalAnalyzer
  radicalBreakdown?: {
    characters: Array<{
      character: string;
      radical: {
        number: number;
        character: string;
        strokes: number;
        meaning: string;
        pinyin: string;
      } | null;
      additionalStrokes: number;
      totalStrokes: number;
      radicalPosition: 'left' | 'right' | 'top' | 'bottom' | 'enclosing' | 'unknown';
      composition: Array<{
        component: string;
        type: 'radical' | 'phonetic' | 'semantic' | 'variant';
        meaning?: string;
        pinyin?: string;
        strokes?: number;
        position?: string;
      }>;
    }>;
    commonRadicals: Array<{
      number: number;
      character: string;
      strokes: number;
      meaning: string;
      pinyin: string;
    }>;
    totalComplexity: number;
    learningTips: string[];
  };
  generatedAt: string; // ISO date string
}

// Unihan database schema
export interface UnihanEntry {
  codepoint: string;     // U+8BF4
  character: string;     // 说
  radical: number;       // 149
  totalStrokes: number;  // 9
  pinyin: string;        // shuō
  definition: string;    // speak, say, talk; scold, upbraid
}

// CEDICT database schema  
export interface CedictEntry {
  traditional: string;   // 說
  simplified: string;    // 说
  pinyin: string;        // shuo1
  definitions: string[]; // ["to speak", "to say", "to talk"]
}

// Character breakdown data
export interface CharacterAnalysis {
  character: string;
  meaning: string;
  radical: string;
  strokes: number;
  pinyin: string;
  relatedWords: Word[];
  position: number;
  frequency?: string;
  etymology?: string;
}

// Stroke order data structure
export interface StrokeData {
  character: string;
  strokes: Array<{
    path: string;      // SVG path data
    order: number;     // stroke order number
  }>;
  medians: number[][][]; // stroke medians for animation
}

// Dictionary API response structures
export interface LingvanexResponse {
  result: string;
  translation: {
    sourceLanguage: string;
    targetLanguage: string;
    detectedLanguage: string;
    translation: Array<{
      sourceText: string;
      targetText: string;
      partOfSpeech: string;
      definitions: string[];
      synonyms: string[];
      antonyms: string[];
    }>;
  };
}

// Cache entry for profiles
export interface ProfileCacheEntry {
  hanzi: string;
  profile: WordProfileDTO;
  cachedAt: number;     // epoch ms
  expiresAt: number;    // epoch ms (90 days TTL)
}

// Sentence Translation Feature Entities
export interface SentenceExercise {
  id: string;
  chinese: {
    hanzi: string;
    pinyin: string;
  };
  english: string;
  direction: 'en-to-zh' | 'zh-to-en';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  usedWords: string[];          // Words from user's learned vocabulary
  createdAt: number;
  lastAttempted?: number;
}

export interface TranslationAttempt {
  id: string;
  exerciseId: string;
  userTranslation: string;
  llmEvaluation: TranslationEvaluation;
  attemptedAt: number;
}

export interface TranslationEvaluation {
  overallScore: number;           // 0-100
  detailedFeedback: {
    accuracy: {
      score: number;              // 0-100
      correctElements: string[];
      incorrectElements: string[];
      missedElements: string[];
    };
    fluency: {
      score: number;              // 0-100
      strengths: string[];
      improvements: string[];
    };
    vocabulary: {
      score: number;              // 0-100
      correctUsage: string[];
      incorrectUsage: string[];
      suggestions: string[];
    };
    grammar: {
      score: number;              // 0-100
      correctStructures: string[];
      errors: Array<{
        error: string;
        correction: string;
        explanation: string;
      }>;
    };
  };
  overallFeedback: string;
  encouragement: string;
  nextSteps: string[];
  characterDiff?: Array<{
    position: number; // index in the string
    userChar: string;
    expectedChar: string;
    type: 'missing' | 'incorrect' | 'ambiguous';
    score: number; // 0-100, how correct this character/word is
    explanation?: string;
  }>;
}

export interface GeneratedSentencePair {
  chinese: {
    hanzi: string;
    pinyin: string;
  };
  english: string;
  usedWords: string[];            // Which of the user's known words were used
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SentenceGenerationRequest {
  knownWords: string[];           // User's learned Chinese characters/words
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exerciseDirection: 'en-to-zh' | 'zh-to-en';  // For UI presentation only
}

export interface TranslationSession {
  id: string;
  exercises: SentenceExercise[];
  currentExerciseIndex: number;
  attempts: TranslationAttempt[];
  startedAt: number;
  completedAt?: number;
  settings: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    direction: 'en-to-zh' | 'zh-to-en';
    exerciseCount: number;
  };
}

// Review quality ratings for SM-2
export type ReviewQuality = "again" | "hard" | "good" | "easy";

// Map review quality to SM-2 grade
export const qualityToGrade: Record<ReviewQuality, number> = {
  again: 0,
  hard: 1,
  good: 3,
  easy: 5,
};

// Review settings and modes
export interface ReviewSettings {
  learningSteps: number[];      // Learning steps in minutes (e.g., [1, 10])
  graduatingInterval: number;   // Days until card graduates from learning
  easyInterval: number;         // Days added when marking a new card as "easy"
  maxNewCardsPerDay: number;    // Daily limit for new cards
  maxReviewsPerDay: number;     // Daily limit for reviews
  batchSize: number;            // Cards per batch
}

export type ReviewMode = "mixed" | "new-only" | "review-only" | "learning-only";

export interface ReviewSession {
  mode: ReviewMode;
  newCards: Word[];
  learningCards: Word[];
  reviewCards: Word[];
  /**
   * Queue of cards remaining for this session in priority order
   */
  queue: Word[];
  currentBatch: Word[];
  batchIndex: number;
  reviewed: number;
  settings: ReviewSettings;
}
