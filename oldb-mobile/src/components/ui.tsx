import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Image } from 'expo-image';

import { resolveMediaUrl } from '@/src/api/config';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radii, spacing, typography } from '@/src/theme';

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const colors = useThemeColors();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
}

export function AppText({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  variant?: keyof typeof typography;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  const colors = useThemeColors();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[typography[variant], { color: color ?? colors.text }, style]}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryContrast} />
      ) : (
        <Text style={[typography.button, { color: colors.primaryContrast }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles.secondaryButton,
        {
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[typography.button, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  placeholder?: string;
}) {
  const colors = useThemeColors();
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="label" color={colors.textSecondary}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
}

export function BookCover({
  uri,
  width = 72,
  height = 108,
}: {
  uri?: string | null;
  width?: number;
  height?: number;
}) {
  const colors = useThemeColors();
  const resolved = resolveMediaUrl(uri);
  return (
    <View
      style={[
        styles.cover,
        {
          width,
          height,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {resolved ? (
        <Image
          source={{ uri: resolved }}
          style={{ width, height, borderRadius: radii.cover }}
          contentFit="cover"
          transition={200}
        />
      ) : null}
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const colors = useThemeColors();
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${clamped}%`, backgroundColor: colors.progress },
        ]}
      />
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.empty}>
      <AppText color={colors.textSecondary} style={{ textAlign: 'center' }}>
        {message}
      </AppText>
    </View>
  );
}

export function LoadingBlock() {
  const colors = useThemeColors();
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
  },
  cover: {
    borderRadius: radii.cover,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
