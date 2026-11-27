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

export default function SignupScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await signUp({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });
      setSuccess(true);
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
        {success ? (
          <>
            <AppText>{t('auth.signupSuccess')}</AppText>
            <PrimaryButton
              label={t('auth.login')}
              onPress={() => router.replace('/(auth)/login')}
            />
          </>
        ) : (
          <>
            <Field
              label={t('auth.fullName')}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            <Field
              label={t('auth.username')}
              value={username}
              onChangeText={setUsername}
            />
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
              label={t('auth.signup')}
              onPress={onSubmit}
              loading={loading}
              disabled={!fullName || !username || !email || !password}
            />
            <Link href="/(auth)/login" style={{ color: colors.primary }}>
              {t('auth.hasAccount')}
            </Link>
          </>
        )}
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
