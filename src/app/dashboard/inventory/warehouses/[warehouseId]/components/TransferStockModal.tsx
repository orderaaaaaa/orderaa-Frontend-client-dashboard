'use client';

import BaseModal from '@/components/ui/base-modal';
import { MoveStockForm, type MoveStockLine } from '@/components/stock/MoveStockForm';
import type { WarehouseStockItemApi } from '@/lib/api/warehouses';
import { variantPlainLabel } from '@/lib/variantOptionLabel';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromWarehouseId: number;
  items: WarehouseStockItemApi[];
  onSuccess: () => void;
}

export function TransferStockModal({
  isOpen,
  onClose,
  fromWarehouseId,
  items,
  onSuccess,
}: TransferStockModalProps) {
  const lines: MoveStockLine[] = items.map((item) => ({
    variantId: item.variantId,
    available: item.quantity,
    label: variantPlainLabel({
      productName: item.productName,
      sku: item.sku ?? null,
      options: item.options,
    }),
  }));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="نقل المخزون"
      showFooter={false}
      maxWidth="md:max-w-[720px]"
    >
      {isOpen && (
        <MoveStockForm
          fromWarehouseId={fromWarehouseId}
          lines={lines}
          onDone={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      )}
    </BaseModal>
  );
}
