'use client';

import BaseModal from '@/components/ui/base-modal';
import { useI18n } from '@/i18n/I18nProvider';
import { STORE_LINK_KIND, type StoreLinkMove } from '@/types/storeLinks';

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

  const movesBySourceIndex = moves.reduce(
    (groups, move) => {
      groups.set(move.sourceIndex, [...(groups.get(move.sourceIndex) ?? []), move]);
      return groups;
    },
    new Map<number, StoreLinkMove[]>(),
  );

  const messageOf = (move: StoreLinkMove) => {
    if (move.linkKind === STORE_LINK_KIND.VARIANT) {
      return t('storeLinks.moveConfirm.line', {
        fromProductName: move.fromProductName,
        fromVariantLabel: move.fromVariantLabel ?? '',
      });
    }
    if (move.linkKind === STORE_LINK_KIND.PRODUCT) {
      return t('storeLinks.moveConfirm.product', { fromProductName: move.fromProductName });
    }
    return t('storeLinks.moveConfirm.productStock', { fromProductName: move.fromProductName });
  };

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
        {Array.from(movesBySourceIndex.entries()).map(([sourceIndex, group]) => (
          <div key={sourceIndex} className="flex flex-col gap-1">
            {group.map((move) => (
              <p
                key={`${move.linkKind}-${move.toProductId}-${move.toVariantId ?? 'product'}`}
                className="text-sm text-gray-700 leading-relaxed"
              >
                {messageOf(move)}
              </p>
            ))}
          </div>
        ))}
      </div>
    </BaseModal>
  );
}
