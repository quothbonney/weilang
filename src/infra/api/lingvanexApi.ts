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
  private timeout = 10000; // 10 second timeout

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async lookupWord(word: string): Promise<DictionaryResult | null> {
    if (!this.apiKey) {
      console.warn('Lingvanex API key not provided');
      return null;
    }

    try {
      const response = await this.makeRequest('/translate', {
        q: word,
        source: 'zh_CN',
        target: 'en_US',
        platform: 'api'
      });

      if (!response.result) {
        return null;
      }

      // Extract translation data
      const translations = response.translation?.translation || [];
      if (translations.length === 0) {
        return null;
      }

      const primaryTranslation = translations[0];
      
      return {
        definitions: primaryTranslation.definitions || [primaryTranslation.targetText],
        synonyms: primaryTranslation.synonyms || [],
        antonyms: primaryTranslation.antonyms || [],
        partOfSpeech: primaryTranslation.partOfSpeech || 'unknown'
      };

    } catch (error) {
      console.error('Lingvanex API error:', error);
      return null;
    }
  }

  async getDictionaryDefinition(word: string): Promise<DictionaryResult | null> {
    if (!this.apiKey) {
      console.warn('Lingvanex API key not provided');
      return null;
    }

    try {
      const response = await this.makeRequest('/dictionary', {
        q: word,
        source: 'zh_CN',
        target: 'en_US',
        platform: 'api'
      });

      if (!response.result) {
        return null;
      }

      const entries = response.result?.entries || [];
      if (entries.length === 0) {
        // Fallback to translation API
        return this.lookupWord(word);
      }

      const entry = entries[0];
      
      return {
        definitions: entry.definitions || [entry.translation],
        synonyms: entry.synonyms || [],
        antonyms: entry.antonyms || [],
        partOfSpeech: entry.partOfSpeech || 'unknown'
      };

    } catch (error) {
      console.error('Lingvanex dictionary API error:', error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
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