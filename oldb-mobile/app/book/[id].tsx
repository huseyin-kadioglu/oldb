import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { createUserActivity, getBookById } from '@/src/api/apiService';
import { extractApiErrorMessage } from '@/src/api/client';
import {
  AppText,
  BookCover,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
} from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { BookActivityStatus } from '@/src/domain/statuses';
import type { BookDto } from '@/src/domain/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { spacing } from '@/src/theme';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState<BookDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setBook(await getBookById(id));
    } catch (e) {
      setError(extractApiErrorMessage(e, t('common.error')));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const act = async (payload: {
    status: string;
    currentPage?: number;
  }) => {
    if (!book || !isAuthenticated) return;
    setActing(true);
    setError(null);
    try {
      await createUserActivity({
        bookId: book.id,
        authorId: book.authorId,
        ...payload,
      });
      await load();
    } catch (e) {
      setError(extractApiErrorMessage(e, t('common.error')));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingBlock />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.padded, { backgroundColor: colors.background }]}>
        <AppText color={colors.danger}>{error ?? t('common.error')}</AppText>
      </View>
    );
  }

  const genres = Array.isArray(book.genres)
    ? book.genres.join(', ')
    : book.genres || null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.padded}
    >
      <View style={styles.hero}>
        <BookCover uri={book.coverUrl} width={140} height={210} />
        <View style={styles.heroMeta}>
          <AppText variant="bookTitle">{book.title}</AppText>
          {book.authorName ? (
            <AppText color={colors.textSecondary}>{book.authorName}</AppText>
          ) : null}
          {book.pageCount ? (
            <AppText variant="caption" color={colors.textMuted}>
              {t('book.pages', { count: book.pageCount })}
            </AppText>
          ) : null}
          {book.publishYear ? (
            <AppText variant="caption" color={colors.textMuted}>
              {t('book.published', { year: book.publishYear })}
            </AppText>
          ) : null}
          {book.publisher ? (
            <AppText variant="caption" color={colors.textMuted}>
              {t('book.publisher', { name: book.publisher })}
            </AppText>
          ) : null}
          {book.isbn ? (
            <AppText variant="caption" color={colors.textMuted}>
              {t('book.isbn', { isbn: book.isbn })}
            </AppText>
          ) : null}
          {book.averageRating != null ? (
            <AppText variant="caption" color={colors.accent}>
              {t('book.averageRating', {
                rating: Number(book.averageRating).toFixed(1),
              })}
            </AppText>
          ) : null}
        </View>
      </View>

      {genres ? (
        <AppText variant="bodySmall" color={colors.textSecondary}>
          {genres}
        </AppText>
      ) : null}

      {error ? <AppText color={colors.danger}>{error}</AppText> : null}

      {isAuthenticated ? (
        <View style={styles.actions}>
          <PrimaryButton
            label={t('book.startReading')}
            loading={acting}
            onPress={() =>
              act({ status: BookActivityStatus.READLIST, currentPage: 1 })
            }
          />
          <SecondaryButton
            label={t('book.markWant')}
            onPress={() =>
              act({ status: BookActivityStatus.READLIST, currentPage: 0 })
            }
          />
          <SecondaryButton
            label={t('book.markRead')}
            onPress={() => act({ status: BookActivityStatus.READ })}
          />
          <SecondaryButton
            label={t('book.addLibrary')}
            onPress={() => act({ status: BookActivityStatus.LIBRARY })}
          />
          <SecondaryButton
            label={t('book.favorite')}
            onPress={() => act({ status: BookActivityStatus.FAVOURITE })}
          />
        </View>
      ) : null}

      <AppText variant="sectionTitle">{t('book.synopsis')}</AppText>
      <AppText color={colors.textSecondary}>
        {book.description?.trim() || t('book.noDescription')}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  padded: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  hero: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroMeta: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});
