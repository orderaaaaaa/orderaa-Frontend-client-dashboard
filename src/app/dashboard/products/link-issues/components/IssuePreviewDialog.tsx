'use client';

import type { ReactNode } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { ErrorState } from '@/components/ui/state-panels';
import { useI18n } from '@/i18n/I18nProvider';

interface IssuePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry?: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  confirmDisabled?: boolean;
  isSubmitting?: boolean;
  maxWidth?: string;
  children?: ReactNode;
}

export function IssuePreviewDialog({
  isOpen,
  onClose,
  title,
  isLoading,
  isError,
  error,
  onRetry,
  onConfirm,
  confirmText,
  confirmDisabled = false,
  isSubmitting = false,
  maxWidth = 'md:max-w-2xl',
  children,
}: IssuePreviewDialogProps) {
  const { t } = useI18n();

  let body: ReactNode = children;
  if (isLoading) {
    body = <div className="h-32 rounded-xl bg-gray-100 animate-pulse" aria-busy="true" />;
  } else if (isError) {
    body = (
      <ErrorState
        error={error}
        fallback={t('linkIssues.common.loadError')}
        onRetry={onRetry}
      />
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={onConfirm}
      showFooter={onConfirm !== undefined}
      confirmText={confirmText ?? t('linkIssues.common.confirm')}
      cancelText={t('common.cancel')}
      isLoading={isSubmitting}
      confirmDisabled={confirmDisabled || isLoading || isError}
      maxWidth={maxWidth}
    >
      <div className="flex flex-col gap-4">{body}</div>
    </BaseModal>
  );
}
