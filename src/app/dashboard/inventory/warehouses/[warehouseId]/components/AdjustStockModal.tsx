'use client';

import BaseModal from '@/components/ui/base-modal';
import { AdjustStockForm, type AdjustStockLine } from '@/components/stock/AdjustStockForm';
import { preventEntryGridEscape } from '@/components/stock/useEntryGrid';
import type { WarehouseStockItemApi } from '@/lib/api/warehouses';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  items: WarehouseStockItemApi[];
  onSuccess: () => void;
}

export function AdjustStockModal({
  isOpen,
  onClose,
  warehouseId,
  items,
  onSuccess,
}: AdjustStockModalProps) {
  const lines: AdjustStockLine[] = items.map((item) => ({
    variantId: item.variantId,
    productName: item.productName,
    sku: item.sku ?? null,
    options: item.options,
    current: item.quantity,
  }));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تسوية المخزون — مطابقة العدد الفعلي"
      showFooter={false}
      maxWidth="md:max-w-[720px]"
      onEscapeKeyDown={preventEntryGridEscape}
    >
      {isOpen && (
        <AdjustStockForm
          mode="single"
          warehouseId={warehouseId}
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
