import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { getProfileBookList } from '@/src/api/apiService';
import { extractApiErrorMessage } from '@/src/api/client';
import {
  AppText,
  BookCover,
  EmptyState,
  LoadingBlock,
  PrimaryButton,
} from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import {
  LibraryShelfId,
  SHELF_TO_LIST_TYPE,
} from '@/src/domain/statuses';
import type { BookDto } from '@/src/domain/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radii, spacing } from '@/src/theme';

const SHELVES: LibraryShelfId[] = [
  'reading',
  'want',
  'completed',
  'library',
  'shopping',
  'dropped',
  'favorites',
];

export default function LibraryScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [shelf, setShelf] = useState<LibraryShelfId>('reading');
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listType = SHELF_TO_LIST_TYPE[shelf];

  const load = useCallback(async () => {
    if (!isAuthenticated || !user?.username) {
      setBooks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getProfileBookList(user.username, listType);
      let next = Array.isArray(data) ? data : [];
      // READLIST serves both "reading" and "want" — filter client-side for UX
      if (shelf === 'reading') {
        next = next.filter((b) => (b.currentPage ?? 0) > 0);
      } else if (shelf === 'want') {
        next = next.filter((b) => (b.currentPage ?? 0) <= 0);
      }
      setBooks(next);
    } catch (e) {
      setError(extractApiErrorMessage(e, t('common.error')));
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.username, listType, shelf, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const chips = useMemo(
    () =>
      SHELVES.map((id) => (
        <Pressable
          key={id}
          onPress={() => setShelf(id)}
          style={[
            styles.chip,
            {
              backgroundColor:
                shelf === id ? colors.primary : colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <AppText
            variant="caption"
            color={shelf === id ? colors.primaryContrast : colors.text}
          >
            {t(`library.shelves.${id}`)}
          </AppText>
        </Pressable>
      )),
    [shelf, colors, t]
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AppText color={colors.textSecondary}>{t('auth.loginRequired')}</AppText>
        <PrimaryButton
          label={t('auth.login')}
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {chips}
      </ScrollView>

      {loading ? (
        <LoadingBlock />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <EmptyState message={error ?? t('library.empty')} />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.cell}
              onPress={() => router.push(`/book/${item.id}`)}
            >
              <BookCover uri={item.coverUrl} width={100} height={150} />
              <AppText variant="caption" numberOfLines={2}>
                {item.title}
              </AppText>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cell: {
    width: '31%',
    gap: spacing.xs,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
});
