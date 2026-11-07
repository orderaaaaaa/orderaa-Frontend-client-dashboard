'use client';

import { useEffect, useState } from 'react';
import { AdjustStockForm } from '@/components/stock/AdjustStockForm';
import { WarehouseSelect, type WarehouseSelectSource } from '@/components/stock/WarehouseSelect';
import { preventEntryGridEscape } from '@/components/stock/useEntryGrid';
import BaseModal from '@/components/ui/base-modal';
import type { ProductStockDto } from '@/lib/api/productStock';

interface AdjustVariantDialogProps {
  stock: ProductStockDto;
  variantId: number;
  warehouses: WarehouseSelectSource;
  onClose(): void;
}

export function AdjustVariantDialog({ stock, variantId, warehouses, onClose }: AdjustVariantDialogProps) {
  const [chosenWarehouseId, setChosenWarehouseId] = useState<number | null>(null);

  const variant = stock.variants.find((item) => item.variantId === variantId) ?? null;
  const variantGone = variant === null;

  useEffect(() => {
    if (variantGone) onClose();
  }, [variantGone, onClose]);

  const enabledIds = warehouses.pickerOptions
    .filter((option) => !option.disabled)
    .map((option) => Number(option.key));
  const onlyEnabledId = enabledIds.length === 1 ? enabledIds[0] : null;
  const warehouseId = chosenWarehouseId ?? onlyEnabledId;
  const warehouseListed =
    warehouseId !== null && stock.warehouses.some((warehouse) => warehouse.id === warehouseId);
  const current =
    variant && warehouseId !== null
      ? variant.byWarehouse.find((cell) => cell.warehouseId === warehouseId)?.quantity ?? 0
      : 0;
  const showNoWarehouseLine = !warehouses.isLoading && !warehouses.isError && enabledIds.length === 0;

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="تسوية المخزون"
      showFooter={false}
      maxWidth="md:max-w-[720px]"
      onEscapeKeyDown={preventEntryGridEscape}
    >
      {variant && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="break-words font-medium text-foreground">
              {variant.variantLabel || stock.product.name}
            </span>
            {variant.sku && (
              <span dir="ltr" className="break-all font-mono text-xs text-muted-foreground">
                {variant.sku}
              </span>
            )}
          </div>

          {showNoWarehouseLine ? (
            <p className="text-sm text-muted-foreground">لا يوجد مخزن نشط يمكن التسوية عليه</p>
          ) : (
            <WarehouseSelect
              value={warehouseId}
              onChange={(id) => setChosenWarehouseId(id)}
              source={warehouses}
              placeholder="اختر المخزن"
            />
          )}

          {warehouseId !== null && warehouseListed && (
            <AdjustStockForm
              key={`${variantId}:${warehouseId}`}
              mode="single"
              warehouseId={warehouseId}
              lines={[
                {
                  variantId: variant.variantId,
                  productName: stock.product.name,
                  sku: variant.sku,
                  options: variant.options,
                  current,
                },
              ]}
              onDone={onClose}
              onCancel={onClose}
            />
          )}
        </div>
      )}
    </BaseModal>
  );
}
