import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  getDailyReadCheckin,
  getProfileSummary,
  setDailyReadCheckin,
} from '@/src/api/apiService';
import { extractApiErrorMessage } from '@/src/api/client';
import { CurrentlyReadingCard } from '@/src/components/CurrentlyReadingCard';
import { ProgressModal } from '@/src/components/ProgressModal';
import {
  AppText,
  EmptyState,
  LoadingBlock,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
} from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import type { ContinueReadingBook, ProfileSummary } from '@/src/domain/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radii, spacing } from '@/src/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [progressBook, setProgressBook] = useState<ContinueReadingBook | null>(
    null
  );

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [summary, checkin] = await Promise.all([
        getProfileSummary(),
        getDailyReadCheckin(),
      ]);
      setProfile(summary);
      setCheckedIn(!!(checkin.checkedIn ?? checkin.checkedInToday));
    } catch (e) {
      setError(extractApiErrorMessage(e, t('common.error')));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const current =
    profile?.continueReading?.find((b) => (b.currentPage ?? 0) > 0) ??
    profile?.continueReading?.[0] ??
    null;

  const year = new Date().getFullYear();
  const goal = profile?.yearlyBookGoal ?? 0;
  const readThisYear = profile?.bookReadThisYear ?? 0;
  const goalPercent =
    goal > 0 ? Math.min(100, Math.round((readThisYear / goal) * 100)) : 0;
  const streak = profile?.readingStreak ?? 0;
  const greetingName = user?.profileName || user?.username;
  const greeting = t('home.greeting', {
    name: greetingName ? `, ${greetingName}` : '',
  });

  if (!isAuthenticated) {
    return (
      <View style={[styles.padded, { backgroundColor: colors.background }]}>
        <AppText variant="brand">{t('brand.name')}</AppText>
        <AppText color={colors.textSecondary}>{t('auth.welcome')}</AppText>
        <PrimaryButton
          label={t('auth.login')}
          onPress={() => router.push('/(auth)/login')}
        />
        <SecondaryButton
          label={t('auth.signup')}
          onPress={() => router.push('/(auth)/signup')}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingBlock />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.padded}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <AppText variant="brand">{t('brand.name')}</AppText>
      <AppText variant="screenTitle">{greeting}</AppText>

      {error ? (
        <AppText color={colors.danger}>{error}</AppText>
      ) : null}

      {current ? (
        <CurrentlyReadingCard
          book={current}
          onPressBook={() => router.push(`/book/${current.bookId}`)}
          onUpdateProgress={() => setProgressBook(current)}
        />
      ) : (
        <EmptyState message={t('home.noCurrentBook')} />
      )}

      <View
        style={[
          styles.panel,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <AppText variant="label" color={colors.textSecondary}>
          {t('home.streak')}
        </AppText>
        <AppText variant="sectionTitle">
          {t('home.streakDays', { count: streak })}
        </AppText>
        <Pressable
          onPress={async () => {
            try {
              const next = !checkedIn;
              const result = await setDailyReadCheckin(next);
              setCheckedIn(!!(result.checkedIn ?? result.checkedInToday ?? next));
              await load();
            } catch (e) {
              setError(extractApiErrorMessage(e, t('common.error')));
            }
          }}
          style={[
            styles.checkIn,
            {
              backgroundColor: checkedIn ? colors.primary : colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <AppText
            variant="button"
            color={checkedIn ? colors.primaryContrast : colors.text}
          >
            {checkedIn ? t('home.checkedIn') : t('home.checkIn')}
          </AppText>
        </Pressable>
      </View>

      {goal > 0 ? (
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <AppText variant="label" color={colors.textSecondary}>
            {t('home.yearlyGoal', { year })}
          </AppText>
          <AppText variant="sectionTitle">
            {t('home.goalProgress', { read: readThisYear, goal })}
          </AppText>
          <ProgressBar value={goalPercent} />
          <AppText variant="caption" color={colors.textSecondary}>
            {t('home.percent', { value: goalPercent })}
          </AppText>
        </View>
      ) : null}

      <ProgressModal
        visible={!!progressBook}
        book={progressBook}
        onClose={() => setProgressBook(null)}
        onSaved={load}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  padded: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  panel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  checkIn: {
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
