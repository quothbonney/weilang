/**
 * Together API adapter for LLM interactions
 */

import OpenAI from "openai";

interface GeneratedSentence {
  hanzi: string;
  pinyin: string;
  gloss: string;
}

export class TogetherAdapter {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: "https://api.together.xyz/v1",
      dangerouslyAllowBrowser: true, // Required for browser environments
    });
  }

  async generateSentence(knownWords: string[]): Promise<GeneratedSentence> {
    if (knownWords.length === 0) {
      throw new Error("No known words available for sentence generation");
    }

    if (knownWords.length < 3) {
      throw new Error("Need at least 3 known words to generate meaningful sentences");
    }

    const wordList = knownWords.join("，");

    const systemPrompt = `You are a concise Chinese tutor.
Return ONLY valid JSON in this exact format:
{"hanzi":"...", "pinyin":"...", "gloss":"..."}
Do NOT include any other text, markdown, or explanation.`;

    const userPrompt = `Create ONE natural Chinese sentence using ONLY these words: [${wordList}].
The sentence should be less than 30 characters.
Return the result as JSON with hanzi (Chinese characters), pinyin (with tone marks), and gloss (English translation).`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "Qwen/Qwen1.5-7B-Chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 100,
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