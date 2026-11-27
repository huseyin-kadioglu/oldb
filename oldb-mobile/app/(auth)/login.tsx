import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { extractApiErrorMessage } from '@/src/api/client';
import {
  AppText,
  Field,
  PrimaryButton,
} from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { spacing } from '@/src/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (e) {
      setError(extractApiErrorMessage(e, t('common.error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <AppText variant="brand">{t('brand.name')}</AppText>
        <AppText color={colors.textSecondary}>{t('auth.welcome')}</AppText>
        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Field
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <PrimaryButton
          label={t('auth.login')}
          onPress={onSubmit}
          loading={loading}
          disabled={!email || !password}
        />
        <Link href="/(auth)/signup" style={{ color: colors.primary }}>
          {t('auth.noAccount')}
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
