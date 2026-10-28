'use client';

import BaseModal from '@/components/ui/base-modal';
import { MoveStockForm, type MoveStockLine } from '@/components/stock/MoveStockForm';
import { preventEntryGridEscape } from '@/components/stock/useEntryGrid';
import type { WarehouseStockItemApi } from '@/lib/api/warehouses';

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
    productName: item.productName,
    sku: item.sku ?? null,
    options: item.options,
    available: item.quantity,
  }));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="نقل المخزون"
      showFooter={false}
      maxWidth="md:max-w-[720px]"
      onEscapeKeyDown={preventEntryGridEscape}
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
