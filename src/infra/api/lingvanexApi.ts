/**
 * Lingvanex Dictionary API adapter
 * Provides comprehensive dictionary data for Chinese words
 */

import { LingvanexResponse } from '../../domain/entities';

export interface DictionaryResult {
  definitions: string[];
  synonyms: string[];
  antonyms: string[];
  partOfSpeech: string;
}

export class LingvanexApi {
  private apiKey: string;
  private baseUrl = 'https://api-b2b.backenster.com/b1/api/v3';
  private timeout = 5000; // 5 second timeout (aggressive)

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async lookupWord(word: string): Promise<DictionaryResult | null> {
    if (!this.apiKey) {
      console.warn('🔍 Lingvanex API key not provided');
      return null;
    }

    console.log(`🔍 Lingvanex: Looking up word "${word}"`);

    try {
      const response = await this.makeRequest('/translate', {
        platform: 'api',
        from: 'zh-Hans',
        to: 'en',
        data: word,
        translateMode: 'html',
        enableTransliteration: false
      });

      console.log('🔍 Lingvanex response:', JSON.stringify(response, null, 2));

      if (!response.result) {
        console.log('🔍 Lingvanex: No result in response');
        return null;
      }

      // Extract and trim the translated text
      const translatedText = response.result.trim();
      if (!translatedText) {
        console.log('🔍 Lingvanex: No translated text found');
        return null;
      }

      const result = {
        definitions: [translatedText],
        synonyms: [],
        antonyms: [],
        partOfSpeech: 'unknown'
      };

      console.log('🔍 Lingvanex: Returning result:', result);
      return result;

    } catch (error) {
      console.error('🔍 Lingvanex API error:', error);
      return null;
    }
  }

  async getDictionaryDefinition(word: string): Promise<DictionaryResult | null> {
    if (!this.apiKey) {
      console.warn('Lingvanex API key not provided');
      return null;
    }

    console.log(`🔍 Lingvanex: Getting dictionary definition for "${word}"`);

    // Lingvanex doesn't have a separate dictionary endpoint, use translation instead
    return this.lookupWord(word);
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`🔍 Lingvanex: Request timeout after ${this.timeout}ms`);
      controller.abort();
    }, this.timeout);

    console.log(`🔍 Lingvanex: Starting request to ${this.baseUrl}${endpoint}`, data);

    try {
      console.log(`🔍 Lingvanex: Calling fetch...`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`🔍 Lingvanex: Fetch completed with status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔍 Lingvanex: HTTP error response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`🔍 Lingvanex: Parsing JSON response...`);
      const result = await response.json();
      console.log(`🔍 Lingvanex: Request completed successfully`);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`🔍 Lingvanex: Request failed:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.lookupWord('你好');
      return result !== null;
    } catch (error) {
      console.error('Lingvanex API connection test failed:', error);
      return false;
    }
  }

  // Get usage statistics (if supported by API)
  async getUsageStats(): Promise<{ used: number; limit: number } | null> {
    try {
      const response = await this.makeRequest('/account', {
        platform: 'api'
      });

      return {
        used: response.used || 0,
        limit: response.limit || 0
      };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return null;
    }
  }
} 