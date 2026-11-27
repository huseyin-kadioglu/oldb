import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, BookCover, PrimaryButton, ProgressBar } from '@/src/components/ui';
import type { ContinueReadingBook } from '@/src/domain/types';
import { readingProgressPercent } from '@/src/domain/statuses';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radii, spacing } from '@/src/theme';

type Props = {
  book: ContinueReadingBook;
  onPressBook: () => void;
  onUpdateProgress: () => void;
};

export function CurrentlyReadingCard({
  book,
  onPressBook,
  onUpdateProgress,
}: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const percent = readingProgressPercent(book.currentPage, book.pageCount);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <AppText variant="label" color={colors.accent}>
        {t('home.currentlyReading')}
      </AppText>
      <Pressable onPress={onPressBook} style={styles.row}>
        <BookCover uri={book.coverUrl} width={84} height={126} />
        <View style={styles.meta}>
          <AppText variant="bookTitle" numberOfLines={2}>
            {book.title}
          </AppText>
          {book.authorName ? (
            <AppText variant="bodySmall" color={colors.textSecondary} numberOfLines={1}>
              {book.authorName}
            </AppText>
          ) : null}
          {book.currentPage != null && book.pageCount != null ? (
            <AppText variant="caption" color={colors.textMuted}>
              {t('home.pageOf', {
                current: book.currentPage,
                total: book.pageCount,
              })}
            </AppText>
          ) : null}
          {percent != null ? (
            <>
              <ProgressBar value={percent} />
              <AppText variant="caption" color={colors.textSecondary}>
                {t('home.percent', { value: percent })}
              </AppText>
            </>
          ) : null}
        </View>
      </Pressable>
      <PrimaryButton label={t('home.updateProgress')} onPress={onUpdateProgress} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  meta: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
});
