import React from "react";
import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { createWordSlice, WordSlice } from './slices/wordSlice';
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice';
import { createProfileSlice, ProfileSlice } from './slices/profileSlice';
import { createReviewSlice, ReviewSlice } from './slices/reviewSlice';
import { createTranslationSlice, TranslationSlice } from './slices/translationSlice';
import type { FlashcardSettings, SessionTracking } from './types';
import type { ExampleGenerationMode, ModelOption } from '../../infra/llm/togetherAdapter';

export interface WeiLangStore extends WordSlice, SettingsSlice, ProfileSlice, ReviewSlice, TranslationSlice {
  isLoading: boolean;
  error: string | null;
}

export const useStore = create<WeiLangStore>((set, get) => ({
  isLoading: false,
  error: null,
  ...createWordSlice(set, get),
  ...createSettingsSlice(set, get),
  ...createProfileSlice(set, get),
  ...createReviewSlice(set, get),
  ...createTranslationSlice(set, get)
}));

export const useEnhancedProfile = (wordId: string) => {
  const { generateEnhancedProfile, lastEnhancedProfile, isLoading, error } = useStore();
  const [profile, setProfile] = React.useState<ReturnType<typeof generateEnhancedProfile> extends Promise<infer T> ? T | null : null>(null);
  React.useEffect(() => {
    if (wordId) {
      generateEnhancedProfile(wordId).then(setProfile);
    }
  }, [wordId, generateEnhancedProfile]);
  return {
    profile: profile || lastEnhancedProfile,
    isLoading,
    error,
    refresh: () => generateEnhancedProfile(wordId).then(setProfile)
  };
};

export type { FlashcardSettings, SessionTracking, ExampleGenerationMode, ModelOption };
