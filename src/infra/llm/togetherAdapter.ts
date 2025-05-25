/**
 * Together API adapter for LLM interactions
 */

import OpenAI from "openai";
import { Word, GeneratedSentencePair, TranslationEvaluation } from "../../domain/entities";

export type ExampleGenerationMode = 'strict' | 'some-ood' | 'many-ood' | 'independent';
export type ModelOption = 'deepseek-ai/DeepSeek-V3' | 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo' | 'Qwen/Qwen2.5-72B-Instruct-Turbo' | 'Qwen/Qwen2.5-7B-Instruct-Turbo';

interface GeneratedSentence {
  hanzi: string;
  pinyin: string;
  gloss: string;
}

interface GeneratedWordProfile {
  partOfSpeech?: string;
  detailedMeaning: string;
  exampleSentences?: Array<{
    hanzi: string;
    pinyin: string;
    gloss: string;
  }>;
  etymology?: string;
  usage?: string;
  memoryAids?: string;
}

interface CharacterMeaning {
  character: string;
  meaning: string;
  pinyin: string;
}

export class TogetherAdapter {
  private openai: OpenAI;
  private model: ModelOption;

  constructor(apiKey: string, model: ModelOption = 'deepseek-ai/DeepSeek-V3') {
    this.openai = new OpenAI({
      apiKey,
      baseURL: "https://api.together.xyz/v1",
      dangerouslyAllowBrowser: true, // Required for browser environments
    });
    this.model = model;
  }

  private static parseJson(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    }
  }

  async generateWordProfile(word: Word): Promise<GeneratedWordProfile> {
    const systemPrompt = `You are an expert Chinese language tutor and linguist.
Return ONLY valid JSON in this exact format:
{
  "partOfSpeech": "...",
  "detailedMeaning": "...",
  "exampleSentences": [
    {"hanzi": "...", "pinyin": "...", "gloss": "..."},
    {"hanzi": "...", "pinyin": "...", "gloss": "..."},
    {"hanzi": "...", "pinyin": "...", "gloss": "..."}
  ],
  "etymology": "...",
  "usage": "..."
}
Do NOT include any other text, markdown, or explanation.`;

    const userPrompt = `Analyze the Chinese word: ${word.hanzi} (${word.pinyin}) - "${word.meaning}"

Provide:
1. partOfSpeech: The grammatical category (noun, verb, adjective, etc.)
2. detailedMeaning: A comprehensive explanation of the word's meaning, including nuances and contexts
3. exampleSentences: 3 example sentences showing different uses of the word
4. etymology: Brief explanation of the character's origin or composition (if relevant)
5. usage: Notes about when and how to use this word appropriately

Return as JSON only.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Together API");

      const parsed = TogetherAdapter.parseJson(content);
      if (!parsed) throw new Error("Invalid JSON response from Together API");

      // Validate the response structure
      if (!parsed.partOfSpeech || !parsed.detailedMeaning || !parsed.exampleSentences) {
        throw new Error("Incomplete response from Together API");
      }

      // Ensure exampleSentences is an array with proper structure
      if (!Array.isArray(parsed.exampleSentences) || parsed.exampleSentences.length === 0) {
        // Fallback to basic examples
        parsed.exampleSentences = [
          { hanzi: word.hanzi, pinyin: word.pinyin, gloss: word.meaning }
        ];
      }

      return {
        partOfSpeech: parsed.partOfSpeech,
        detailedMeaning: parsed.detailedMeaning,
        exampleSentences: parsed.exampleSentences,
        etymology: parsed.etymology || undefined,
        usage: parsed.usage || undefined,
        memoryAids: parsed.memoryAids || undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to generate word profile");
    }
  }

  async generateSentence(target: Word, knownWords: string[], mode: ExampleGenerationMode = 'strict'): Promise<GeneratedSentence> {
    let systemPrompt: string;
    let userPrompt: string;

    switch (mode) {
      case 'strict':
        if (knownWords.length === 0) {
          throw new Error("No known words available for sentence generation");
        }
        if (knownWords.length < 3) {
          throw new Error("Need at least 3 known words to generate meaningful sentences");
        }
        
        const wordList = [target.hanzi, ...knownWords].join("，");
        systemPrompt = `You are a concise Chinese tutor.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}
Do NOT include any other text, markdown, or explanation.`;

        userPrompt = `Create ONE natural Chinese sentence using ONLY these words: [${wordList}].
The sentence must include the target word " ${target.hanzi} " meaning "${target.meaning}" and be less than 30 characters.
Return the result as JSON with hanzi (Chinese characters), pinyin (with tone marks), and gloss (English translation).`;
        break;

      case 'some-ood':
        const someWordList = knownWords.length > 0 ? knownWords.join("，") : "你好，谢谢，水";
        systemPrompt = `You are a Chinese tutor.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}`;

        userPrompt = `Create a simple Chinese sentence using the word " ${target.hanzi} " ("${target.meaning}").
You may also use these known words: [${someWordList}] and add 1-2 additional common Chinese words if needed.
Keep it under 30 characters. Return as JSON with hanzi, pinyin, and gloss.`;
        break;

      case 'many-ood':
        const manyWordList = knownWords.length > 0 ? knownWords.join("，") : "你好，谢谢，水，吃，好";
        systemPrompt = `You are a Chinese tutor.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}`;

        userPrompt = `Create a natural Chinese sentence that uses the word " ${target.hanzi} " ("${target.meaning}").
You may reference these words: [${manyWordList}] and feel free to use additional common words to create a meaningful sentence.
Keep it under 30 characters. Return as JSON with hanzi, pinyin, and gloss.`;
        break;

      case 'independent':
        systemPrompt = `You are a Chinese tutor creating beginner-friendly content.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}`;

        userPrompt = `Create a simple, beginner-friendly Chinese sentence that includes the word " ${target.hanzi} " ("${target.meaning}").
Feel free to use any other common words. Keep it under 20 characters.
Return as JSON with hanzi (Chinese characters), pinyin (with tone marks), and gloss (English translation).`;
        break;

      default:
        throw new Error(`Unknown generation mode: ${mode}`);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 100,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Together API");

      const parsed = TogetherAdapter.parseJson(content);
      if (!parsed) throw new Error("Invalid JSON response from Together API");

      // Validate the response structure
      if (!parsed.hanzi || !parsed.pinyin || !parsed.gloss) {
        throw new Error("Incomplete response from Together API");
      }

      return {
        hanzi: parsed.hanzi,
        pinyin: parsed.pinyin,
        gloss: parsed.gloss,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to generate sentence");
    }
  }

  async generateCharacterMeanings(characters: string[]): Promise<CharacterMeaning[]> {
    console.log('🔍 TogetherAdapter.generateCharacterMeanings called with:', characters);
    
    const systemPrompt = `You are an expert Chinese language tutor and linguist.
Return ONLY valid JSON in this exact format:
[
  {"character": "...", "meaning": "...", "pinyin": "..."},
  {"character": "...", "meaning": "...", "pinyin": "..."}
]
Do NOT include any other text, markdown, or explanation.`;

    const userPrompt = `Provide the meaning and pinyin for each of these Chinese characters: ${characters.join(', ')}

For each character, provide:
1. character: The Chinese character itself
2. meaning: A concise English meaning or definition (1-3 words preferred)
3. pinyin: The pinyin pronunciation with tone marks

Return as JSON array only.`;

    try {
      console.log('🔍 Making API call to Together for character meanings...');
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      console.log('🔍 Together API response content:', content);
      
      if (!content) throw new Error("No response from Together API");

      const parsed = TogetherAdapter.parseJson(content);
      console.log('🔍 Parsed JSON:', parsed);
      
      if (!parsed || !Array.isArray(parsed)) throw new Error("Invalid JSON response from Together API");

      // Validate the response structure
      const validResults: CharacterMeaning[] = [];
      for (const item of parsed) {
        if (item.character && item.meaning && item.pinyin) {
          validResults.push({
            character: item.character,
            meaning: item.meaning,
            pinyin: item.pinyin
          });
        }
      }

      console.log('🔍 Valid character meanings generated:', validResults);
      return validResults;
    } catch (error) {
      console.error('🔍 Failed to generate character meanings:', error);
      // Return fallback data for each character
      const fallback = characters.map(char => ({
        character: char,
        meaning: 'meaning unavailable',
        pinyin: 'unknown'
      }));
      console.log('🔍 Returning fallback character meanings:', fallback);
      return fallback;
    }
  }

  /**
   * Generate a sentence exercise using Chinese-first approach
   * Always generates Chinese sentence first using known words, then derives English
   */
  async generateSentenceExercise(
    knownWords: string[], 
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<GeneratedSentencePair> {
    console.log('🔍 Generating sentence exercise with known words:', knownWords.slice(0, 10), '...');
    
    if (knownWords.length < 3) {
      throw new Error("Need at least 3 known words to generate meaningful sentences");
    }

    // Step 1: Generate Chinese sentence using known words
    const chineseResult = await this.generateChineseSentence(knownWords, difficulty);
    
    // Step 2: Generate English translation
    const englishResult = await this.generateEnglishTranslation({
      hanzi: chineseResult.hanzi,
      pinyin: chineseResult.pinyin
    });
    
    return {
      chinese: {
        hanzi: chineseResult.hanzi,
        pinyin: chineseResult.pinyin
      },
      english: englishResult.english,
      usedWords: chineseResult.usedWords,
      difficulty
    };
  }

  /**
   * Step 1: Generate Chinese sentence using only known words
   */
  private async generateChineseSentence(
    knownWords: string[], 
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<{
    hanzi: string;
    pinyin: string;
    usedWords: string[];
  }> {
    const maxLength = difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 12 : 15;
    const minWords = difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5;
    
    const systemPrompt = `You are an expert Chinese language tutor.
Return ONLY valid JSON in this exact format:
{
  "hanzi": "...",
  "pinyin": "...",
  "usedWords": ["word1", "word2", ...]
}
Do NOT include any other text, markdown, or explanation.`;

    const userPrompt = `Generate a natural Chinese sentence using ONLY these learned words: [${knownWords.join(', ')}]

Requirements:
- Use ONLY the provided words (no additional characters)
- Create a natural, practical sentence for daily use
- Target difficulty: ${difficulty}
- Sentence length: ${maxLength} characters maximum
- Use at least ${minWords} different words from the list
- Focus on common daily situations (greetings, food, family, work, etc.)

Provide:
1. hanzi: The Chinese sentence using only the provided words
2. pinyin: Complete pinyin with tone marks
3. usedWords: Array of which words from the list were actually used

Return as JSON only.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Together API");

      const parsed = TogetherAdapter.parseJson(content);
      if (!parsed) throw new Error("Invalid JSON response from Together API");

      // Validate the response structure
      if (!parsed.hanzi || !parsed.pinyin || !Array.isArray(parsed.usedWords)) {
        throw new Error("Incomplete Chinese sentence response from Together API");
      }

      return {
        hanzi: parsed.hanzi,
        pinyin: parsed.pinyin,
        usedWords: parsed.usedWords
      };
    } catch (error) {
      console.error('Failed to generate Chinese sentence:', error);
      throw new Error("Failed to generate Chinese sentence");
    }
  }

  /**
   * Step 2: Generate English translation from Chinese sentence
   */
  private async generateEnglishTranslation(chineseResult: {
    hanzi: string;
    pinyin: string;
  }): Promise<{
    english: string;
    literalTranslation?: string;
    notes?: string;
  }> {
    const systemPrompt = `You are an expert Chinese-English translator.
Return ONLY valid JSON in this exact format:
{
  "english": "natural English translation",
  "literalTranslation": "word-for-word translation",
  "notes": "any cultural or linguistic notes"
}
Do NOT include any other text, markdown, or explanation.`;

    const userPrompt = `Provide a natural English translation for this Chinese sentence:

Chinese: ${chineseResult.hanzi}
Pinyin: ${chineseResult.pinyin}

Provide:
1. english: A natural, fluent English translation that captures the meaning and tone
2. literalTranslation: A word-for-word translation to show structure
3. notes: Any cultural context or linguistic notes that would help learners

Return as JSON only.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Together API");

      const parsed = TogetherAdapter.parseJson(content);
      if (!parsed) throw new Error("Invalid JSON response from Together API");

      // Validate the response structure
      if (!parsed.english) {
        throw new Error("Incomplete English translation response from Together API");
      }

      return {
        english: parsed.english,
        literalTranslation: parsed.literalTranslation,
        notes: parsed.notes
      };
    } catch (error) {
      console.error('Failed to generate English translation:', error);
      throw new Error("Failed to generate English translation");
    }
  }

  /**
   * Evaluate a user's translation attempt with comprehensive feedback
   */
  async evaluateTranslation(
    originalChinese: string,
    pinyin: string,
    expectedEnglish: string,
    userTranslation: string,
    direction: 'en-to-zh' | 'zh-to-en'
  ): Promise<TranslationEvaluation> {
    console.log('🔍 Evaluating translation:', { originalChinese, expectedEnglish, userTranslation, direction });

    const systemPrompt = `You are an expert language tutor evaluating translation attempts.
Return ONLY valid JSON in this exact format:
{
  "overallScore": 85,
  "detailedFeedback": {
    "accuracy": {
      "score": 80,
      "correctElements": ["element1", "element2"],
      "incorrectElements": ["error1", "error2"],
      "missedElements": ["missed1", "missed2"]
    },
    "fluency": {
      "score": 90,
      "strengths": ["strength1", "strength2"],
      "improvements": ["improvement1", "improvement2"]
    },
    "vocabulary": {
      "score": 85,
      "correctUsage": ["usage1", "usage2"],
      "incorrectUsage": ["incorrect1", "incorrect2"],
      "suggestions": ["suggestion1", "suggestion2"]
    },
    "grammar": {
      "score": 75,
      "correctStructures": ["structure1", "structure2"],
      "errors": [
        {
          "error": "specific error",
          "correction": "how to fix it",
          "explanation": "why this is wrong"
        }
      ]
    }
  },
  "overallFeedback": "comprehensive feedback",
  "encouragement": "positive encouragement",
  "nextSteps": ["step1", "step2", "step3"]
}
Do NOT include any other text, markdown, or explanation.`;

    const userPrompt = `Evaluate this translation attempt:

Original Chinese: ${originalChinese}
Pinyin: ${pinyin}
Expected English: ${expectedEnglish}
User's translation: ${userTranslation}
Exercise direction: ${direction}

Provide comprehensive evaluation with:

1. overallScore: Overall score from 0-100
2. detailedFeedback with four categories:
   - accuracy: How well the meaning was captured (score, correct/incorrect/missed elements)
   - fluency: How natural the translation sounds (score, strengths, improvements)
   - vocabulary: Word choice and usage (score, correct/incorrect usage, suggestions)
   - grammar: Grammatical correctness (score, correct structures, specific errors with corrections)
3. overallFeedback: 2-3 sentences summarizing the translation quality
4. encouragement: Positive, motivating feedback about what they did well
5. nextSteps: 3 specific actionable suggestions for improvement

Be constructive, specific, and educational. Focus on helping the learner improve.

Return as JSON only.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Together API");

      const parsed = TogetherAdapter.parseJson(content);
      if (!parsed) throw new Error("Invalid JSON response from Together API");

      // Validate the response structure
      if (!parsed.overallScore || !parsed.detailedFeedback || !parsed.overallFeedback) {
        throw new Error("Incomplete evaluation response from Together API");
      }

      // Ensure all required fields exist with defaults
      const evaluation: TranslationEvaluation = {
        overallScore: parsed.overallScore || 0,
        detailedFeedback: {
          accuracy: {
            score: parsed.detailedFeedback?.accuracy?.score || 0,
            correctElements: parsed.detailedFeedback?.accuracy?.correctElements || [],
            incorrectElements: parsed.detailedFeedback?.accuracy?.incorrectElements || [],
            missedElements: parsed.detailedFeedback?.accuracy?.missedElements || []
          },
          fluency: {
            score: parsed.detailedFeedback?.fluency?.score || 0,
            strengths: parsed.detailedFeedback?.fluency?.strengths || [],
            improvements: parsed.detailedFeedback?.fluency?.improvements || []
          },
          vocabulary: {
            score: parsed.detailedFeedback?.vocabulary?.score || 0,
            correctUsage: parsed.detailedFeedback?.vocabulary?.correctUsage || [],
            incorrectUsage: parsed.detailedFeedback?.vocabulary?.incorrectUsage || [],
            suggestions: parsed.detailedFeedback?.vocabulary?.suggestions || []
          },
          grammar: {
            score: parsed.detailedFeedback?.grammar?.score || 0,
            correctStructures: parsed.detailedFeedback?.grammar?.correctStructures || [],
            errors: parsed.detailedFeedback?.grammar?.errors || []
          }
        },
        overallFeedback: parsed.overallFeedback || "Translation evaluated",
        encouragement: parsed.encouragement || "Keep practicing!",
        nextSteps: parsed.nextSteps || ["Continue practicing", "Review vocabulary", "Focus on grammar"]
      };

      console.log('🔍 Translation evaluation completed:', evaluation);
      return evaluation;
    } catch (error) {
      console.error('Failed to evaluate translation:', error);
      
      // Return a fallback evaluation
      return {
        overallScore: 50,
        detailedFeedback: {
          accuracy: {
            score: 50,
            correctElements: [],
            incorrectElements: [],
            missedElements: []
          },
          fluency: {
            score: 50,
            strengths: [],
            improvements: ["Continue practicing"]
          },
          vocabulary: {
            score: 50,
            correctUsage: [],
            incorrectUsage: [],
            suggestions: ["Review vocabulary"]
          },
          grammar: {
            score: 50,
            correctStructures: [],
            errors: []
          }
        },
        overallFeedback: "Unable to evaluate translation at this time. Please try again.",
        encouragement: "Keep practicing! Every attempt helps you improve.",
        nextSteps: ["Try again", "Review the original sentence", "Practice more translations"]
      };
    }
  }
} 