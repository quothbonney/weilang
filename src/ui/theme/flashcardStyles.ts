import { Theme, StyleHelpers } from './theme';

// Flashcard-specific style helpers that complement the main theme
export const createFlashcardStyles = (theme: Theme, helpers: StyleHelpers) => ({
  // Progress Section Styles
  progressSection: {
    padding: theme.layout.lg,
    backgroundColor: theme.colors.surface.primary,
  },
  
  cardTypeIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.layout.cardGap,
  },
  
  cardTypeBadge: {
    paddingHorizontal: theme.layout.cardGap,
    paddingVertical: theme.layout.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.layout.sm,
  },
  
  cardTypeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.label.fontWeight,
  },
  
  learningStepText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden' as const,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.borderRadius.sm,
  },

  // Card type colors (semantic)
  cardTypeColors: {
    learning: theme.colors.status.warning,
    new: theme.colors.interactive.primary,
    review: theme.colors.status.success,
  },

  // Common flashcard container styles
  flashcardContainer: {
    ...helpers.card,
    minHeight: 200,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Review button styles
  reviewButtonsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: theme.layout.sm,
    padding: theme.layout.lg,
    backgroundColor: theme.colors.surface.primary,
  },
  
  reviewButton: {
    flex: 1,
    paddingVertical: theme.layout.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: theme.dimensions.buttonHeight.xl,
  },
  
  reviewButtonText: {
    ...theme.typography.label,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.button.fontWeight,
  },

  // Review quality colors
  reviewQualityColors: {
    again: theme.colors.status.error,
    hard: theme.colors.status.warning,
    good: theme.colors.status.success,
    easy: theme.colors.interactive.primary,
  },

  // Header styles
  flashcardHeader: {
    paddingHorizontal: theme.layout.lg,
    paddingTop: theme.layout.md,
    paddingBottom: theme.layout.sm,
    backgroundColor: theme.colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },

  // Content area styles
  flashcardContent: {
    flex: 1,
    padding: theme.layout.xl,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Chinese character display
  chineseCharacterDisplay: {
    ...theme.typography.chineseCharacterLarge,
    color: theme.colors.text.chinese,
    marginBottom: theme.layout.lg,
  },

  pinyinDisplay: {
    ...theme.typography.pinyin,
    color: theme.colors.text.pinyin,
    marginBottom: theme.layout.md,
  },

  translationDisplay: {
    ...theme.typography.bodyLarge,
    color: theme.colors.text.primary,
    textAlign: 'center' as const,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.primary,
  },

  // Completion state styles
  completionContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.layout.xl,
  },

  completionCard: {
    ...helpers.cardElevated,
    padding: theme.layout.xl,
    alignItems: 'center' as const,
    maxWidth: 400,
    width: '100%',
  },

  // Settings panel styles
  settingsPanel: {
    ...helpers.card,
    marginHorizontal: theme.layout.lg,
    marginVertical: theme.layout.md,
  },

  settingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.layout.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },

  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },

  // Common animations
  animations: {
    cardFlip: {
      duration: 300,
    },
    fadeIn: {
      duration: 200,
    },
    slideUp: {
      duration: 250,
    },
  },

  // Flashcard content card
  flashcardCard: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.layout.xl * 1.5,
    alignItems: 'center' as const,
    marginBottom: theme.layout.xl,
    minHeight: 200,
    ...theme.shadows.lg,
  },

  cardHeader: {
    position: 'absolute' as const,
    top: theme.layout.lg,
    right: theme.layout.lg,
  },

  deckIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface.secondary,
    paddingHorizontal: theme.layout.sm,
    paddingVertical: theme.layout.xs,
    borderRadius: theme.borderRadius.lg,
  },

  deckIndicatorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.layout.xs,
    fontWeight: '500' as const,
  },

  // Chinese character display in flashcard
  flashcardHanzi: {
    fontSize: 56,
    fontWeight: 'bold' as const,
    marginBottom: theme.layout.cardGap,
    color: theme.colors.text.chinese,
  },

  flashcardPinyin: {
    fontSize: 20,
    color: theme.colors.text.pinyin,
    marginBottom: theme.layout.sm,
  },

  flashcardMeaning: {
    fontSize: 24,
    color: theme.colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: theme.layout.lg,
  },

  englishPrompt: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.layout.sm,
    textAlign: 'center' as const,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.border.primary,
    marginVertical: theme.layout.lg,
  },

  // Input styles
  inputContainer: {
    width: '100%',
    marginTop: theme.layout.lg,
  },

  chineseInput: {
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.layout.lg,
    fontSize: 24,
    textAlign: 'center' as const,
    backgroundColor: theme.colors.surface.secondary,
  },

  inputCorrect: {
    borderColor: theme.colors.status.success,
    backgroundColor: theme.colors.status.successBackground,
  },

  inputIncorrect: {
    borderColor: theme.colors.status.error,
    backgroundColor: theme.colors.status.errorBackground,
  },

  inputHint: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.tertiary,
    textAlign: 'center' as const,
    marginTop: theme.layout.sm,
  },

  // Answer section
  answerSection: {
    alignItems: 'center' as const,
    width: '100%',
  },

  correctAnswerLabel: {
    fontSize: theme.typography.label.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.layout.sm,
  },

  // Feedback styles
  feedbackContainer: {
    marginTop: theme.layout.cardGap,
    paddingHorizontal: theme.layout.lg,
    paddingVertical: theme.layout.sm,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },

  feedbackCorrect: {
    backgroundColor: theme.colors.status.successBackground,
  },

  feedbackIncorrect: {
    backgroundColor: theme.colors.status.errorBackground,
  },

  feedbackText: {
    textAlign: 'center' as const,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
  },

  // Word stats
  wordStats: {
    flexDirection: 'row' as const,
    gap: theme.layout.lg,
    marginTop: theme.layout.lg,
  },

  wordStatsText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.tertiary,
  },

  // Profile button
  profileButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.status.infoBackground,
    paddingHorizontal: theme.layout.lg,
    paddingVertical: theme.layout.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.layout.cardGap,
    gap: theme.layout.xs,
  },

  profileButtonText: {
    color: theme.colors.interactive.primary,
    fontSize: theme.typography.label.fontSize,
    fontWeight: '500' as const,
  },

  // Speaker button
  hanziWithSpeaker: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.layout.cardGap,
  },

  speakerButton: {
    backgroundColor: theme.colors.surface.secondary,
    padding: theme.layout.sm,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.layout.cardGap,
  },
});

export type FlashcardStyles = ReturnType<typeof createFlashcardStyles>; 