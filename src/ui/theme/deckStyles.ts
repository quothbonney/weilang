import { Theme, StyleHelpers } from './theme';

// Deck/Word list specific styles
export const createDeckStyles = (theme: Theme, helpers: StyleHelpers) => ({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.layout.lg,
  },

  // Header styles
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: theme.layout.xl * 1.5,
    paddingHorizontal: theme.layout.xl,
    paddingBottom: theme.layout.lg,
    backgroundColor: theme.colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },

  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },

  // Stats bar
  statsBar: {
    paddingHorizontal: theme.layout.lg,
    paddingVertical: theme.layout.cardGap,
    backgroundColor: theme.colors.background.secondary,
  },

  statsText: {
    fontSize: theme.typography.label.fontSize,
    color: theme.colors.text.secondary,
  },

  // Word card styles
  wordCard: {
    backgroundColor: theme.colors.surface.primary,
    padding: theme.layout.lg,
    marginHorizontal: theme.layout.lg,
    marginVertical: theme.layout.xs,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    ...theme.shadows.sm,
  },

  wordContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  hanzi: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginRight: theme.layout.lg,
    color: theme.colors.text.primary,
  },

  wordDetails: {
    flex: 1,
  },

  pinyin: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.chinese.pinyin,
    marginBottom: 2,
  },

  meaning: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
  },

  wordMeta: {
    alignItems: 'flex-end' as const,
  },

  // Status badge styles
  statusBadge: {
    paddingHorizontal: theme.layout.sm,
    paddingVertical: theme.layout.xs,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.layout.xs,
  },

  statusColors: {
    new: {
      backgroundColor: theme.colors.status.infoBackground,
      color: theme.colors.status.info,
    },
    learning: {
      backgroundColor: theme.colors.status.warningBackground,
      color: theme.colors.status.warning,
    },
    review: {
      backgroundColor: theme.colors.status.successBackground,
      color: theme.colors.status.success,
    },
  },

  favoriteBadge: {
    paddingHorizontal: theme.layout.sm,
    paddingVertical: theme.layout.xs,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.layout.xs,
    backgroundColor: theme.colors.status.errorBackground,
  },

  favoriteText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.status.error,
  },

  statusText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    textTransform: 'capitalize' as const,
  },

  intervalText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.tertiary,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.layout.lg,
  },

  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.bodyLarge.fontSize,
    marginBottom: theme.layout.lg,
  },

  // Error text
  errorText: {
    color: theme.colors.status.error,
    textAlign: 'center' as const,
  },

  // Settings button
  settingsButton: {
    padding: theme.layout.sm,
  },
});

export type DeckStyles = ReturnType<typeof createDeckStyles>; 