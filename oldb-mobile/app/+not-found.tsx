import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { spacing } from '@/src/theme';

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: 'OLDB' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppText variant="screenTitle">Not found</AppText>
        <Link href="/" style={{ color: colors.primary }}>
          Home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
});
