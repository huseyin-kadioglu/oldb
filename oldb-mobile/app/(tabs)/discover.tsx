import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { getDiscoverBooks } from '@/src/api/apiService';
import { extractApiErrorMessage } from '@/src/api/client';
import {
  AppText,
  BookCover,
  EmptyState,
  LoadingBlock,
} from '@/src/components/ui';
import type { BookDto } from '@/src/domain/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radii, spacing, typography } from '@/src/theme';

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [books, setBooks] = useState<BookDto[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(id);
  }, [query]);

  const load = useCallback(
    async (pageIndex: number, append: boolean) => {
      setError(null);
      if (!append) setLoading(true);
      try {
        const result = await getDiscoverBooks({
          q: debounced || undefined,
          page: pageIndex,
          size: 24,
          sort: 'mostRead',
        });
        const next = result.content ?? [];
        setBooks((prev) => (append ? [...prev, ...next] : next));
        setPage(pageIndex);
        setLast(!!result.last);
      } catch (e) {
        setError(extractApiErrorMessage(e, t('common.error')));
      } finally {
        setLoading(false);
      }
    },
    [debounced, t]
  );

  useEffect(() => {
    load(0, false);
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('discover.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.search,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {loading && books.length === 0 ? (
        <LoadingBlock />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={<EmptyState message={error ?? t('discover.empty')} />}
          onEndReached={() => {
            if (!loading && !last) load(page + 1, true);
          }}
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
  searchWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  search: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
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
});
