import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppText,
  Field,
  PrimaryButton,
  SecondaryButton,
} from '@/src/components/ui';
import { BookActivityStatus } from '@/src/domain/statuses';
import type { ContinueReadingBook } from '@/src/domain/types';
import { createUserActivity } from '@/src/api/apiService';
import { extractApiErrorMessage } from '@/src/api/client';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radii, spacing } from '@/src/theme';

type Props = {
  visible: boolean;
  book: ContinueReadingBook | null;
  onClose: () => void;
  onSaved: () => void;
};

export function ProgressModal({ visible, book, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [page, setPage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && book) {
      setPage(String(book.currentPage ?? ''));
      setError(null);
    }
  }, [visible, book]);

  if (!book) return null;

  const save = async (asFinished: boolean) => {
    const parsed = Number(page);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError(t('progress.invalidPage'));
      return;
    }

    const pageCount = book.pageCount ?? null;
    const shouldFinish =
      asFinished || (pageCount != null && parsed >= pageCount);

    setSaving(true);
    setError(null);
    try {
      await createUserActivity({
        bookId: book.bookId,
        status: shouldFinish ? BookActivityStatus.READ : BookActivityStatus.READLIST,
        currentPage: shouldFinish ? pageCount ?? parsed : parsed,
        ...(shouldFinish
          ? { readDate: new Date().toISOString().slice(0, 10) }
          : {}),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(extractApiErrorMessage(e, t('common.error')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
        >
          <AppText variant="sectionTitle">{t('progress.title')}</AppText>
          <AppText variant="bodySmall" color={colors.textSecondary} numberOfLines={2}>
            {book.title}
          </AppText>
          <Field
            label={t('progress.currentPage')}
            value={page}
            onChangeText={setPage}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          {error ? (
            <AppText variant="bodySmall" color={colors.danger}>
              {error}
            </AppText>
          ) : null}
          <PrimaryButton
            label={t('progress.save')}
            onPress={() => save(false)}
            loading={saving}
          />
          <SecondaryButton label={t('progress.finish')} onPress={() => save(true)} />
          <SecondaryButton label={t('common.cancel')} onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
