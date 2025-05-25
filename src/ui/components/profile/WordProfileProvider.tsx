import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useStore } from "../../hooks/useStore";
import { WordProfileDTO, Word } from "../../../domain/entities";

interface WordProfileContextType {
  word: Word;
  profile: WordProfileDTO | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  clearCache: () => Promise<void>;
}

const WordProfileContext = createContext<WordProfileContextType | undefined>(undefined);

interface WordProfileProviderProps {
  word: Word;
  children: ReactNode;
}

export function WordProfileProvider({ word, children }: WordProfileProviderProps) {
  const { 
    generateEnhancedProfile, 
    apiKey, 
    wordProfileService, 
    error: storeError, 
    clearError 
  } = useStore();
  
  const [profile, setProfile] = useState<WordProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('🔍 WordProfileProvider Debug:', {
    word: word.hanzi,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    hasWordProfileService: !!wordProfileService,
    storeError,
    hasWord: !!word,
    isLoading
  });

  useEffect(() => {
    console.log('🔍 WordProfileProvider useEffect triggered:', {
      word: word.hanzi,
      hasWord: !!word,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      hasWordProfileService: !!wordProfileService
    });
    
    if (word && (apiKey || wordProfileService)) {
      console.log('🔍 WordProfileProvider: Conditions met, calling fetchProfile...');
      fetchProfile();
    } else {
      console.log('🔍 WordProfileProvider: Conditions NOT met:', {
        hasWord: !!word,
        hasApiKey: !!apiKey,
        hasWordProfileService: !!wordProfileService,
        willFetch: false
      });
    }
  }, [word, apiKey, wordProfileService]);

  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const fetchProfile = async () => {
    if (!word || !wordProfileService) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Starting progressive profile generation for "${word.hanzi}"...`);
      
      // Use progressive loading - get API data immediately, LLM data later
      const partialProfile = await wordProfileService.generateProfileProgressive(
        word,
        (enhancedProfile) => {
          console.log(`🔍 LLM enhancement complete for "${word.hanzi}"`);
          setProfile(enhancedProfile);
        }
      );
      
      console.log(`🔍 Partial profile ready for "${word.hanzi}"`);
      setProfile(partialProfile);
    } catch (err) {
      console.error('Failed to generate profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate profile');
      
      // Fallback to old method if progressive fails
      try {
        const p = await generateEnhancedProfile(word.id);
        setProfile(p);
        setError(null);
      } catch (fallbackErr) {
        console.error('Fallback profile generation also failed:', fallbackErr);
        setError('Failed to generate profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const clearCache = async () => {
    if (wordProfileService) {
      console.log('🔍 Clearing profile cache...');
      await wordProfileService.clearCache();
      console.log('✅ Cache cleared! Refreshing profile...');
      await fetchProfile();
    }
  };

  const contextValue: WordProfileContextType = {
    word,
    profile,
    isLoading,
    error,
    refreshProfile,
    clearCache,
  };

  return (
    <WordProfileContext.Provider value={contextValue}>
      {children}
    </WordProfileContext.Provider>
  );
}

export function useWordProfile() {
  const context = useContext(WordProfileContext);
  if (context === undefined) {
    throw new Error('useWordProfile must be used within a WordProfileProvider');
  }
  return context;
} 