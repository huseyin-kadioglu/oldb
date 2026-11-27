import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { getProfileSummary } from '@/src/api/apiService';
import { extractApiErrorMessage } from '@/src/api/client';
import {
  AppText,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
} from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import type { ProfileSummary } from '@/src/domain/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radii, spacing } from '@/src/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProfile(await getProfileSummary());
    } catch (e) {
      setError(extractApiErrorMessage(e, t('common.error')));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.padded, { backgroundColor: colors.background }]}>
        <AppText variant="screenTitle">{t('profile.title')}</AppText>
        <AppText color={colors.textSecondary}>{t('profile.guestHint')}</AppText>
        <PrimaryButton
          label={t('auth.login')}
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  if (loading && !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingBlock />
      </View>
    );
  }

  return (
    <View style={[styles.padded, { backgroundColor: colors.background }]}>
      <AppText variant="screenTitle">
        {profile?.profileName || user?.profileName || user?.username}
      </AppText>
      <AppText color={colors.textSecondary}>@{user?.username}</AppText>

      {error ? <AppText color={colors.danger}>{error}</AppText> : null}

      <View style={styles.statsRow}>
        <Stat
          label={t('profile.statsBooks')}
          value={String(profile?.bookRead ?? 0)}
        />
        <Stat
          label={t('profile.statsPages')}
          value={String(profile?.totalPagesRead ?? 0)}
        />
        <Stat
          label={t('profile.statsStreak')}
          value={String(profile?.readingStreak ?? 0)}
        />
      </View>

      <SecondaryButton
        label={t('profile.settings')}
        onPress={() => router.push('/settings')}
      />
      <SecondaryButton label={t('auth.logout')} onPress={() => signOut()} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.stat,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <AppText variant="sectionTitle">{value}</AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  stat: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
  },
});
