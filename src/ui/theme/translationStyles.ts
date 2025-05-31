import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Theme } from './theme';

type TranslationStyles = {
  // Container styles
  container: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  headerButtons: ViewStyle;
  headerButton: ViewStyle;
  headerButtonDanger: ViewStyle;
  headerButtonText: TextStyle;
  headerButtonTextDanger: TextStyle;
  backButton: ViewStyle;
  title: TextStyle;
  
  // Card styles
  card: ViewStyle;
  cardHeader: ViewStyle;
  cardTitle: TextStyle;
  cardDescription: TextStyle;
  
  // Settings styles
  settingsSection: ViewStyle;
  settingsTitle: TextStyle;
  optionGroup: ViewStyle;
  optionButton: ViewStyle;
  optionButtonActive: ViewStyle;
  optionText: TextStyle;
  optionTextActive: TextStyle;
  
  // Button styles
  startButton: ViewStyle;
  startButtonText: TextStyle;
  submitButton: ViewStyle;
  submitButtonDisabled: ViewStyle;
  submitButtonText: TextStyle;
  nextButton: ViewStyle;
  nextButtonText: TextStyle;
  
  // Error styles
  errorContainer: ViewStyle;
  errorText: TextStyle;
  
  // Progress styles
  progressContainer: ViewStyle;
  progressText: TextStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
  
  // Exercise styles
  exerciseCard: ViewStyle;
  sourceSection: ViewStyle;
  sourceLabel: TextStyle;
  sourceTextContainer: ViewStyle;
  sourceText: TextStyle;
  speakerButton: ViewStyle;
  pinyinText: TextStyle;
  
  // Input styles
  inputSection: ViewStyle;
  inputLabel: TextStyle;
  translationInput: TextStyle;
  
  // Evaluation styles
  evaluationCard: ViewStyle;
  scoreSection: ViewStyle;
  scoreCircle: ViewStyle;
  scoreText: TextStyle;
  scoreLabel: TextStyle;
  
  // Comparison styles
  comparisonSection: ViewStyle;
  translationItem: ViewStyle;
  translationLabel: TextStyle;
  originalSentenceText: TextStyle;
  userTranslationText: TextStyle;
  expectedTranslationText: TextStyle;
  
  // Feedback styles
  feedbackSection: ViewStyle;
  feedbackTitle: TextStyle;
  categoryScores: ViewStyle;
  categoryItem: ViewStyle;
  categoryName: TextStyle;
  categoryScore: TextStyle;
  feedbackItem: ViewStyle;
  feedbackItemTitle: TextStyle;
  feedbackItemText: TextStyle;
  encouragementText: TextStyle;
  nextStepText: TextStyle;
  
  // Completion styles
  completionCard: ViewStyle;
  completionTitle: TextStyle;
  completionText: TextStyle;
  statsSection: ViewStyle;
  statsTitle: TextStyle;
  statsGrid: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  actionButtons: ViewStyle;
  newSessionButton: ViewStyle;
  newSessionButtonText: TextStyle;
  backToDashboardButton: ViewStyle;
  backToDashboardButtonText: TextStyle;
  
  // Character styles
  incorrectChar: TextStyle;
  correctChar: TextStyle;
  charScore: TextStyle;
  feedbackBadge: TextStyle;
  characterBreakdownSection: ViewStyle;
  characterBreakdownDescription: TextStyle;
  characterGrid: ViewStyle;
  punctuationChar: TextStyle;
  wordGroup: ViewStyle;
  wordGroupCharacters: ViewStyle;
  wordGroupMeaning: TextStyle;
  characterCard: ViewStyle;
  characterCardActive: ViewStyle;
  characterCardHanzi: TextStyle;
  characterCardPinyin: TextStyle;
  characterCardMeaning: TextStyle;
  characterCardLoading: TextStyle;
  characterCardError: TextStyle;
};

export const createTranslationStyles = (theme: Theme): TranslationStyles => {
  const createStyle = <T extends ViewStyle | TextStyle>(style: T): T => style;

  // Helper function for creating transparent colors
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return StyleSheet.create({
    // Container styles
    container: createStyle({
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    }),
    scrollContent: createStyle({
      padding: theme.layout.lg,
      paddingBottom: theme.layout['2xl'],
    }),
    header: createStyle({
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.layout.xl,
    }),
    headerButtons: createStyle({
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.layout.xl,
      gap: theme.layout.md,
    }),
    headerButton: createStyle({
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.layout.xs,
      paddingHorizontal: theme.layout.md,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    }),
    headerButtonDanger: createStyle({
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.layout.xs,
      paddingHorizontal: theme.layout.md,
      backgroundColor: theme.colors.status.error,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    }),
    headerButtonText: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    }),
    headerButtonTextDanger: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.inverse,
      fontWeight: '500',
    }),
    backButton: createStyle({
      padding: theme.layout.cardGap,
      marginRight: theme.layout.lg,
    }),
    title: createStyle({
      ...theme.typography.h1,
      color: theme.colors.text.primary,
    }),
    
    // Card styles
    card: createStyle({
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.layout.xl,
      ...theme.shadows.md,
    }),
    cardHeader: createStyle({
      alignItems: 'center',
      marginBottom: theme.layout['2xl'],
    }),
    cardTitle: createStyle({
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginTop: theme.layout.lg,
      marginBottom: theme.layout.cardGap,
    }),
    cardDescription: createStyle({
      ...theme.typography.bodyLarge,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    }),
    
    // Settings styles
    settingsSection: createStyle({
      marginBottom: theme.layout.xl,
    }),
    settingsTitle: createStyle({
      ...theme.typography.label,
      fontSize: 16,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
    }),
    optionGroup: createStyle({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.layout.cardGap,
    }),
    optionButton: createStyle({
      flexGrow: 1,
      flexBasis: 0,
      paddingHorizontal: theme.layout.md,
      paddingVertical: theme.layout.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.surface.primary,
      minWidth: 100,
    }),
    optionButtonActive: createStyle({
      borderColor: theme.colors.interactive.primary,
      backgroundColor: hexToRgba(theme.colors.interactive.primary, 0.1),
    }),
    optionText: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    }),
    optionTextActive: createStyle({
      color: theme.colors.interactive.primary,
      fontWeight: theme.typography.label.fontWeight,
    }),
    
    // Button styles
    startButton: createStyle({
      backgroundColor: theme.colors.interactive.primary,
      paddingVertical: theme.layout.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      marginTop: theme.layout.cardGap,
      ...theme.shadows.sm,
    }),
    startButtonText: createStyle({
      ...theme.typography.label,
      color: theme.colors.text.inverse,
      fontSize: 16,
    }),
    submitButton: createStyle({
      backgroundColor: theme.colors.interactive.primary,
      paddingVertical: theme.layout.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    }),
    submitButtonDisabled: createStyle({
      backgroundColor: theme.colors.text.tertiary,
      opacity: 0.5,
    }),
    submitButtonText: createStyle({
      ...theme.typography.label,
      color: theme.colors.text.inverse,
      fontSize: 16,
    }),
    nextButton: createStyle({
      backgroundColor: theme.colors.interactive.primary,
      paddingVertical: theme.layout.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    }),
    nextButtonText: createStyle({
      ...theme.typography.label,
      color: theme.colors.text.inverse,
      fontSize: 16,
    }),
    
    // Error styles
    errorContainer: createStyle({
      marginTop: theme.layout.lg,
      padding: theme.layout.lg,
      backgroundColor: theme.colors.status.errorBackground,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.status.error,
    }),
    errorText: createStyle({
      ...theme.typography.body,
      color: theme.colors.status.error,
    }),
    
    // Progress styles
    progressContainer: createStyle({
      marginBottom: theme.layout.xl,
    }),
    progressText: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginBottom: theme.layout.cardGap,
      textAlign: 'center',
    }),
    progressBar: createStyle({
      height: 4,
      backgroundColor: theme.colors.border.subtle,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    }),
    progressFill: createStyle({
      height: '100%',
      backgroundColor: theme.colors.interactive.primary,
      borderRadius: theme.borderRadius.full,
    }),
    
    // Exercise styles
    exerciseCard: createStyle({
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.layout.xl,
      ...theme.shadows.md,
    }),
    sourceSection: createStyle({
      marginBottom: theme.layout.xl,
    }),
    sourceLabel: createStyle({
      ...theme.typography.label,
      fontSize: 16,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
    }),
    sourceTextContainer: createStyle({
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.layout.cardGap,
    }),
    sourceText: createStyle({
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      flex: 1,
      lineHeight: 28,
    }),
    speakerButton: createStyle({
      padding: theme.layout.cardGap,
      marginLeft: theme.layout.lg,
    }),
    pinyinText: createStyle({
      ...theme.typography.body,
      color: theme.colors.chinese.pinyin,
      marginBottom: theme.layout.cardGap,
      fontSize: theme.typography.bodyLarge.fontSize,
    }),
    
    // Input styles
    inputSection: createStyle({
      marginBottom: theme.layout.xl,
    }),
    inputLabel: createStyle({
      ...theme.typography.label,
      fontSize: 16,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
    }),
    translationInput: createStyle({
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.layout.lg,
      fontSize: 16,
      minHeight: 80,
      backgroundColor: theme.colors.surface.primary,
      color: theme.colors.text.primary,
      textAlignVertical: 'top',
    }),
    
    // Evaluation styles
    evaluationCard: createStyle({
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.layout.xl,
      ...theme.shadows.md,
    }),
    scoreSection: createStyle({
      alignItems: 'center',
      marginBottom: theme.layout.xl,
    }),
    scoreCircle: createStyle({
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.layout.cardGap,
    }),
    scoreText: createStyle({
      ...theme.typography.h1,
      fontWeight: theme.typography.h1.fontWeight,
    }),
    scoreLabel: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.secondary,
    }),
    
    // Comparison styles
    comparisonSection: createStyle({
      marginBottom: theme.layout.xl,
    }),
    translationItem: createStyle({
      marginBottom: theme.layout.lg,
    }),
    translationLabel: createStyle({
      ...theme.typography.label,
      color: theme.colors.text.secondary,
      marginBottom: theme.layout.xs,
    }),
    originalSentenceText: createStyle({
      ...theme.typography.bodyLarge,
      fontSize: 18,
      color: theme.colors.text.primary,
      padding: theme.layout.lg,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.md,
      fontWeight: theme.typography.label.fontWeight,
    }),
    userTranslationText: createStyle({
      ...theme.typography.bodyLarge,
      color: theme.colors.text.primary,
      padding: theme.layout.lg,
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: theme.borderRadius.md,
    }),
    expectedTranslationText: createStyle({
      ...theme.typography.bodyLarge,
      color: theme.colors.text.primary,
      padding: theme.layout.lg,
      backgroundColor: theme.colors.status.successBackground,
      borderRadius: theme.borderRadius.md,
    }),
    
    // Feedback styles
    feedbackSection: createStyle({
      marginBottom: theme.layout.xl,
    }),
    feedbackTitle: createStyle({
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
    }),
    categoryScores: createStyle({
      marginBottom: theme.layout.lg,
    }),
    categoryItem: createStyle({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.layout.cardGap,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    }),
    categoryName: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textTransform: 'capitalize',
    }),
    categoryScore: createStyle({
      ...theme.typography.body,
      fontWeight: theme.typography.label.fontWeight,
    }),
    feedbackItem: createStyle({
      marginBottom: theme.layout.lg,
    }),
    feedbackItemTitle: createStyle({
      ...theme.typography.label,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.xs,
    }),
    feedbackItemText: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    }),
    encouragementText: createStyle({
      ...theme.typography.body,
      color: theme.colors.status.success,
      lineHeight: 20,
    }),
    nextStepText: createStyle({
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      lineHeight: 20,
      marginBottom: theme.layout.xs,
    }),
    
    // Completion styles
    completionCard: createStyle({
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.layout.xl,
      alignItems: 'center',
      ...theme.shadows.md,
    }),
    completionTitle: createStyle({
      ...theme.typography.h1,
      color: theme.colors.text.primary,
      marginTop: theme.layout.lg,
      marginBottom: theme.layout.cardGap,
    }),
    completionText: createStyle({
      ...theme.typography.bodyLarge,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.layout.xl,
    }),
    statsSection: createStyle({
      width: '100%',
      marginBottom: theme.layout.xl,
    }),
    statsTitle: createStyle({
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.layout.lg,
      textAlign: 'center',
    }),
    statsGrid: createStyle({
      flexDirection: 'row',
      justifyContent: 'space-around',
    }),
    statItem: createStyle({
      alignItems: 'center',
    }),
    statValue: createStyle({
      ...theme.typography.h1,
      color: theme.colors.chinese.accent,
      marginBottom: theme.layout.xs,
    }),
    statLabel: createStyle({
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
    }),
    actionButtons: createStyle({
      width: '100%',
      gap: theme.layout.lg,
    }),
    newSessionButton: createStyle({
      backgroundColor: theme.colors.interactive.primary,
      paddingVertical: theme.layout.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    }),
    newSessionButtonText: createStyle({
      ...theme.typography.label,
      color: theme.colors.text.inverse,
      fontSize: 16,
    }),
    backToDashboardButton: createStyle({
      paddingVertical: theme.layout.lg,
      alignItems: 'center',
    }),
    backToDashboardButtonText: createStyle({
      ...theme.typography.bodyLarge,
      color: theme.colors.text.secondary,
    }),
    
    // Character styles
    incorrectChar: createStyle({
      color: theme.colors.status.error,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    }),
    correctChar: createStyle({
      color: theme.colors.status.success,
      fontWeight: 'normal',
      fontSize: 12,
      marginLeft: 2,
    }),
    charScore: createStyle({
      fontSize: 10,
      color: theme.colors.status.warning,
      marginLeft: 2,
    }),
    feedbackBadge: createStyle({
      fontSize: 10,
      color: theme.colors.text.secondary,
      marginLeft: 2,
      fontWeight: 'normal',
    }),
    characterBreakdownSection: createStyle({
      marginBottom: theme.layout.lg,
      paddingHorizontal: theme.layout.xs,
    }),
    characterBreakdownDescription: createStyle({
      ...theme.typography.bodyLarge,
      fontSize: 18,
      color: theme.colors.text.secondary,
      marginBottom: theme.layout.cardGap,
      textAlign: 'center',
      fontStyle: 'italic',
    }),
    characterGrid: createStyle({
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.layout.lg,
    }),
    punctuationChar: createStyle({
      ...theme.typography.bodyLarge,
      fontSize: 18,
      color: theme.colors.text.tertiary,
      marginHorizontal: 3,
      alignSelf: 'center',
    }),
    wordGroup: createStyle({
      flexDirection: 'column',
      alignItems: 'center',
      marginHorizontal: 3,
      marginVertical: theme.layout.xs,
    }),
    wordGroupCharacters: createStyle({
      flexDirection: 'row',
      alignItems: 'center',
    }),
    wordGroupMeaning: createStyle({
      fontSize: 10,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: 2,
      fontWeight: theme.typography.label.fontWeight,
      maxWidth: 80,
    }),
    characterCard: createStyle({
      paddingHorizontal: 6,
      paddingVertical: theme.layout.xs,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'transparent',
    }),
    characterCardActive: createStyle({
      borderBottomColor: theme.colors.border.primary,
    }),
    characterCardHanzi: createStyle({
      ...theme.typography.h2,
      color: theme.colors.chinese.character,
      lineHeight: 22,
    }),
    characterCardPinyin: createStyle({
      fontSize: 10,
      color: theme.colors.chinese.pinyin,
      marginTop: 2,
      fontWeight: '400',
    }),
    characterCardMeaning: createStyle({
      fontSize: 8,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      lineHeight: 9,
      marginTop: 1,
    }),
    characterCardLoading: createStyle({
      fontSize: 8,
      color: theme.colors.text.tertiary,
      fontStyle: 'italic',
    }),
    characterCardError: createStyle({
      fontSize: 8,
      color: theme.colors.status.error,
    }),
  });
}; 