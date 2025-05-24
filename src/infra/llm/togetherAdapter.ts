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
  partOfSpeech: string;
  detailedMeaning: string;
  exampleSentences: {
    hanzi: string;
    pinyin: string;
    gloss: string;
  }[];
  etymology?: string;
  usage?: string;
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
      
      if (!content) {
        throw new Error("No response from Together API");
      }

      // Parse the JSON response
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid JSON response from Together API");
        }
      }

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
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to generate word profile");
    }
  }

  async generateSentence(knownWords: string[], mode: ExampleGenerationMode = 'strict'): Promise<GeneratedSentence> {
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
        
        const wordList = knownWords.join("，");
        systemPrompt = `You are a concise Chinese tutor.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}
Do NOT include any other text, markdown, or explanation.`;
        
        userPrompt = `Create ONE natural Chinese sentence using ONLY these words: [${wordList}].
The sentence should be less than 30 characters.
Return the result as JSON with hanzi (Chinese characters), pinyin (with tone marks), and gloss (English translation).`;
        break;

      case 'some-ood':
        const someWordList = knownWords.length > 0 ? knownWords.join("，") : "你好，谢谢，水";
        systemPrompt = `You are a Chinese tutor.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}`;
        
        userPrompt = `Create a simple Chinese sentence. You may use these known words: [${someWordList}].
You can add 1-2 additional common Chinese words if needed for natural flow.
Keep it under 30 characters. Return as JSON with hanzi, pinyin, and gloss.`;
        break;

      case 'many-ood':
        const manyWordList = knownWords.length > 0 ? knownWords.join("，") : "你好，谢谢，水，吃，好";
        systemPrompt = `You are a Chinese tutor.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}`;
        
        userPrompt = `Create a natural Chinese sentence. You may reference these words: [${manyWordList}].
Feel free to use additional common Chinese words to create a meaningful sentence.
Keep it under 30 characters. Return as JSON with hanzi, pinyin, and gloss.`;
        break;

      case 'independent':
        systemPrompt = `You are a Chinese tutor creating beginner-friendly content.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}`;
        
        userPrompt = `Create a simple, beginner-friendly Chinese sentence using common everyday words.
Keep it under 20 characters and suitable for beginners.
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

      console.log(response)
      console.log(response.choices[0]?.message?.content)

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No response from Together API");
      }

      // Parse the JSON response
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = content.match(/\{[^}]+\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid JSON response from Together API");
        }
      }

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
} 