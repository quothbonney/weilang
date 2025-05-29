import { Theme, StyleHelpers } from './theme';

// Profile page specific styles
export const createProfileStyles = (theme: Theme, helpers: StyleHelpers) => ({
  // Main profile container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },

  // Word not found styles
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.layout.xl,
    backgroundColor: theme.colors.background.secondary,
  },

  notFoundCard: {
    ...helpers.cardElevated,
    padding: theme.layout.xl * 1.5,
    maxWidth: 400,
    alignItems: 'center' as const,
  },

  notFoundTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: theme.layout.lg,
  },

  notFoundText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },

  // Header styles
  header: {
    backgroundColor: theme.colors.surface.primary,
    paddingHorizontal: theme.layout.xl,
    paddingVertical: theme.layout.cardGap,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },

  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },

  backButton: {
    padding: theme.layout.sm,
    marginRight: theme.layout.lg,
  },

  headerHanzi: {
    fontSize: 24,
    fontWeight: '300' as const,
    color: theme.colors.text.primary,
    marginRight: theme.layout.cardGap,
  },

  headerPinyin: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.chinese.pinyin,
  },

  // Main profile content
  profileContainer: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.layout.xl * 1.5,
    paddingVertical: theme.layout.xl * 1.5,
    alignItems: 'center' as const,
  },

  profileHanzi: {
    fontSize: 60,
    fontWeight: '300' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.layout.cardGap,
    letterSpacing: 2,
  },

  profilePinyinRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.layout.cardGap,
  },

  profilePinyin: {
    fontSize: 24,
    color: theme.colors.chinese.pinyin,
    fontWeight: '400' as const,
    marginRight: theme.layout.cardGap,
  },

  profileMeaning: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: theme.layout.xl,
    lineHeight: 26,
  },

  // Practice button
  practiceButton: {
    ...helpers.button,
    paddingHorizontal: theme.layout.xl * 2,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.lg,
    marginBottom: theme.layout.lg,
  },

  practiceButtonText: {
    ...theme.typography.button,
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.text.inverse,
  },

  // Difficulty and frequency badges
  badgeContainer: {
    flexDirection: 'row' as const,
    gap: theme.layout.sm,
  },

  difficultyBadge: {
    paddingHorizontal: theme.layout.cardGap,
    paddingVertical: theme.layout.xs,
    borderRadius: theme.borderRadius.full,
  },

  difficultyColors: {
    easy: {
      backgroundColor: theme.colors.status.successBackground,
      color: theme.colors.status.success,
    },
    medium: {
      backgroundColor: theme.colors.status.warningBackground,
      color: theme.colors.status.warning,
    },
    hard: {
      backgroundColor: theme.colors.status.errorBackground,
      color: theme.colors.status.error,
    },
  },

  frequencyBadge: {
    backgroundColor: theme.colors.status.infoBackground,
    paddingHorizontal: theme.layout.cardGap,
    paddingVertical: theme.layout.xs,
    borderRadius: theme.borderRadius.full,
  },

  badgeText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    textTransform: 'capitalize' as const,
  },

  frequencyText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.status.info,
  },

  // Tab styles
  tabContainer: {
    backgroundColor: theme.colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },

  tabScrollView: {
    paddingHorizontal: theme.layout.xl,
  },

  tabRow: {
    flexDirection: 'row' as const,
    gap: theme.layout.sm,
  },

  tabButton: {
    paddingHorizontal: theme.layout.xl,
    paddingVertical: theme.layout.cardGap,
    borderRadius: theme.borderRadius.full,
  },

  tabButtonActive: {
    backgroundColor: theme.colors.interactive.primary,
  },

  tabButtonInactive: {
    backgroundColor: 'transparent',
  },

  tabText: {
    ...theme.typography.body,
    fontWeight: theme.typography.label.fontWeight,
  },

  tabTextActive: {
    color: theme.colors.text.inverse,
  },

  tabTextInactive: {
    color: theme.colors.text.secondary,
  },

  // Tab indicator
  tabIndicatorContainer: {
    height: 4,
    backgroundColor: theme.colors.border.subtle,
  },

  tabIndicator: {
    height: '100%',
    backgroundColor: theme.colors.interactive.primary,
  },

  // Warning banner
  warningBanner: {
    backgroundColor: theme.colors.status.warningBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.status.warningBorder,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.status.warningBorder,
    paddingHorizontal: theme.layout.xl,
    paddingVertical: theme.layout.cardGap,
  },

  warningContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  warningTitle: {
    ...theme.typography.body,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.status.warning,
    marginLeft: theme.layout.sm,
  },

  warningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.status.warning,
    marginTop: theme.layout.sm,
  },

  settingsButton: {
    backgroundColor: theme.colors.status.warning,
    paddingVertical: theme.layout.sm,
    paddingHorizontal: theme.layout.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.layout.cardGap,
    alignSelf: 'flex-start' as const,
  },

  settingsButtonText: {
    ...theme.typography.label,
    color: theme.colors.text.inverse,
  },

  // Error state
  errorBanner: {
    backgroundColor: theme.colors.status.errorBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.status.errorBorder,
    paddingHorizontal: theme.layout.xl,
    paddingVertical: theme.layout.cardGap,
  },

  errorText: {
    ...theme.typography.bodySmall,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.status.error,
    textAlign: 'center' as const,
  },

  // Utility styles
  speakerButton: {
    backgroundColor: theme.colors.surface.secondary,
    padding: theme.layout.sm,
    borderRadius: theme.borderRadius.full,
  },

  iconButton: {
    padding: theme.layout.sm,
  },

  // Tab content styles
  tabContent: {
    padding: theme.layout.lg,
    backgroundColor: theme.colors.background.primary,
  },

  tabSection: {
    marginBottom: theme.layout.xl,
  },

  tabSectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.layout.lg,
  },

  // Character breakdown styles
  characterRow: {
    flexDirection: 'row' as const,
    gap: theme.layout.lg,
  },

  characterCard: {
    flex: 1,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.layout.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: 'center' as const,
  },

  characterDisplay: {
    fontSize: 60,
    fontWeight: '300' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.layout.cardGap,
  },

  characterPinyin: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.chinese.pinyin,
    marginBottom: theme.layout.xs,
  },

  characterMeaning: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },

  // Example card styles
  exampleCard: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.layout.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.layout.lg,
  },

  exampleHanzi: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.layout.sm,
    lineHeight: 26,
  },

  examplePinyin: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.chinese.pinyin,
    marginBottom: theme.layout.cardGap,
    lineHeight: 24,
  },

  exampleTranslation: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontStyle: 'italic' as const,
    lineHeight: 24,
  },

  // Related words styles
  relatedWordContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.layout.cardGap,
  },

  relatedWordChip: {
    backgroundColor: theme.colors.surface.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: theme.layout.lg,
    paddingVertical: theme.layout.cardGap,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },

  relatedWordHanzi: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.label.fontWeight,
    textAlign: 'center' as const,
  },

  relatedWordMeaning: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    textAlign: 'center' as const,
    marginTop: theme.layout.xs,
  },

  // Empty state
  emptyStateCard: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.layout.xl * 2,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: 'center' as const,
  },

  emptyStateText: {
    color: theme.colors.text.tertiary,
    textAlign: 'center' as const,
  },
});

export type ProfileStyles = ReturnType<typeof createProfileStyles>; 