// Core theme exports
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './theme';
export * from './flashcardStyles';
export * from './deckStyles';
export * from './profileStyles';

// Re-export commonly used items for convenience
export { defaultTheme, themes, createTheme, createStyle } from './theme';
export { useTheme, useThemedStyles, useColors, useLayout, useTypography, ThemeProvider, useFlashcardStyles, useDeckStyles, useProfileStyles, useTranslationStyles } from './ThemeProvider';
export type { Theme, StyleHelpers } from './theme';
export { createFlashcardStyles } from './flashcardStyles';
export type { FlashcardStyles } from './flashcardStyles';
export { createDeckStyles } from './deckStyles';
export type { DeckStyles } from './deckStyles';
export { createProfileStyles } from './profileStyles';
export type { ProfileStyles } from './profileStyles'; 