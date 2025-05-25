/**
 * Together API adapter for LLM interactions
 */

import OpenAI from "openai";
import { Word } from "../../domain/entities";

export type ExampleGenerationMode = 'strict' | 'some-ood' | 'many-ood' | 'independent';
export type ModelOption = 'deepseek-ai/DeepSeek-V3' | 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo' | 'Qwen/Qwen2.5-72B-Instruct-Turbo';

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
} 