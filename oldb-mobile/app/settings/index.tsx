import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '@/src/api/config';
import { AppText, SecondaryButton } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import i18n from '@/src/i18n';
import { spacing } from '@/src/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={[styles.padded, { backgroundColor: colors.background }]}>
      <AppText variant="screenTitle">{t('settings.title')}</AppText>
      <AppText color={colors.textSecondary}>{t('settings.apiHint')}</AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {API_BASE_URL}
      </AppText>
      <AppText variant="label" color={colors.textSecondary}>
        {t('settings.language')}
      </AppText>
      <SecondaryButton label="Türkçe" onPress={() => i18n.changeLanguage('tr')} />
      <SecondaryButton label="English" onPress={() => i18n.changeLanguage('en')} />
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
