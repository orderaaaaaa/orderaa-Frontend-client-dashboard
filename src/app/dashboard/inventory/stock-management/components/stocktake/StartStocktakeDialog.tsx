'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { WarehouseSelect } from '@/components/stock/WarehouseSelect';
import { useStartStocktakeMutation } from '@/services/stocktake';
import { useWarehouseOptions } from '@/services/warehouses';
import { getStocktakeErrorMessage } from '../../utils/stocktakeErrors';
import { stocktakeSheetHref } from './stocktakeRoutes';

interface StartStocktakeDialogProps {
  initialWarehouseId: number | null;
  onClose(): void;
}

export function StartStocktakeDialog({
  initialWarehouseId,
  onClose,
}: StartStocktakeDialogProps) {
  const router = useRouter();
  const startStocktake = useStartStocktakeMutation();
  const warehouseOptions = useWarehouseOptions();
  const [warehouseId, setWarehouseId] = useState<number | null>(initialWarehouseId);
  const [note, setNote] = useState('');

  const onConfirm = () => {
    if (warehouseId === null) return;
    startStocktake.mutate(
      { warehouseId, note: note.trim() || null },
      {
        onSuccess: (stocktake) => {
          toast.success('تم بدء جلسة الجرد');
          router.push(stocktakeSheetHref(stocktake.id));
        },
        onError: (err: unknown) => {
          toast.error(getStocktakeErrorMessage(err, 'تعذر بدء جلسة الجرد'));
        },
      },
    );
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="بدء جلسة جرد جديدة"
      onConfirm={onConfirm}
      confirmText="بدء الجرد"
      isLoading={startStocktake.isPending}
      confirmDisabled={warehouseId === null}
      maxWidth="md:max-w-[480px]"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">المخزن</p>
          <WarehouseSelect value={warehouseId} onChange={setWarehouseId} source={warehouseOptions} />
          <p className="text-xs text-muted-foreground">
            لكل مخزن جلسة جرد مفتوحة واحدة في الوقت نفسه.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="stocktake-start-note" className="text-sm font-medium text-foreground">
            ملاحظة (اختياري)
          </label>
          <textarea
            id="stocktake-start-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </BaseModal>
  );
}
