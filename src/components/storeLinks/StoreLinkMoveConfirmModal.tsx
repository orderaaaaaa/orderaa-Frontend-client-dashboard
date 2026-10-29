'use client';

import BaseModal from '@/components/ui/base-modal';
import { useI18n } from '@/i18n/I18nProvider';
import type { StoreLinkMove } from '@/types/storeLinks';

interface StoreLinkMoveConfirmModalProps {
  moves: StoreLinkMove[];
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function StoreLinkMoveConfirmModal({
  moves,
  onConfirm,
  onClose,
  isLoading,
}: StoreLinkMoveConfirmModalProps) {
  const { t } = useI18n();

  return (
    <BaseModal
      isOpen={moves.length > 0}
      onClose={onClose}
      title={t('storeLinks.moveConfirm.title')}
      onConfirm={onConfirm}
      confirmText={t('storeLinks.moveConfirm.confirm')}
      cancelText={t('common.cancel')}
      isLoading={isLoading}
      maxWidth="md:max-w-lg"
    >
      <div className="flex flex-col gap-3">
        {moves.map((move) => (
          <p key={move.sourceIndex} className="text-sm text-gray-700 leading-relaxed">
            {t('storeLinks.moveConfirm.line', {
              fromProductName: move.fromProductName,
              fromVariantLabel: move.fromVariantLabel,
            })}
          </p>
        ))}
      </div>
    </BaseModal>
  );
}
