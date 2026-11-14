'use client';

import BaseModal from '@/components/ui/base-modal';
import { formatStockNumber } from '@/utils/format';

interface StocktakeRemoveCountedModalProps {
  total: number;
  counted: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function StocktakeRemoveCountedModal({
  total,
  counted,
  onClose,
  onConfirm,
}: StocktakeRemoveCountedModalProps) {
  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="حذف منتجات معدودة؟"
      onConfirm={onConfirm}
      confirmText="حذف"
      confirmButtonClassName="h-10 min-w-[7.5rem] gap-2 rounded-lg bg-destructive px-5 font-semibold text-white hover:bg-destructive/90 sm:min-w-36"
      maxWidth="md:max-w-[440px]"
    >
      <p className="text-sm text-muted-foreground">
        {`سيتم حذف ${formatStockNumber(total)} منتج من الجرد، منها ${formatStockNumber(counted)} معدود مع أعدادها المسجلة.`}
      </p>
    </BaseModal>
  );
}
