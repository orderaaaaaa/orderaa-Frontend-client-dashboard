'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { useAdjustStockMutation } from '@/services/warehouses';
import type { WarehouseStockItemApi } from '@/lib/api/warehouses';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  items: WarehouseStockItemApi[];
  onSuccess: () => void;
}

const variantLabel = (item: WarehouseStockItemApi): string =>
  item.options.map((option) => option.option.name).join(' / ') ||
  item.combinationKey;

export function AdjustStockModal({
  isOpen,
  onClose,
  warehouseId,
  items,
  onSuccess,
}: AdjustStockModalProps) {
  const [actualCounts, setActualCounts] = useState<Record<number, string>>({});
  const [note, setNote] = useState('');
  const adjustMutation = useAdjustStockMutation();

  // Seed once per open. `items` gets a new identity on every WAREHOUSE_STOCK
  // refetch, so depending on it would silently discard a physical count the
  // user is midway through typing.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!isOpen) return;
    const seeded: Record<number, string> = {};
    itemsRef.current.forEach((item) => {
      seeded[item.variantId] = String(item.quantity);
    });
    setActualCounts(seeded);
    setNote('');
  }, [isOpen]);

  const deltaFor = (item: WarehouseStockItemApi): number => {
    const raw = actualCounts[item.variantId];
    if (raw === undefined || raw === '') return 0;
    const actual = Number(raw);
    if (!Number.isInteger(actual) || actual < 0) return 0;
    return actual - item.quantity;
  };

  /** The backend requires whole, non-negative physical counts. */
  const invalidFor = (item: WarehouseStockItemApi): boolean => {
    const raw = actualCounts[item.variantId];
    if (raw === undefined || raw === '') return false;
    const actual = Number(raw);
    return !Number.isInteger(actual) || actual < 0;
  };

  const hasInvalidCount = items.some(invalidFor);

  const adjustments = items
    .map((item) => ({ variantId: item.variantId, delta: deltaFor(item) }))
    .filter((entry) => entry.delta !== 0);

  const onConfirm = async () => {
    if (hasInvalidCount) {
      toast.error('العدد الفعلي يجب أن يكون رقمًا صحيحًا غير سالب');
      return;
    }

    if (adjustments.length === 0) {
      toast.error('لا يوجد فرق بين الكمية بالنظام والعدد الفعلي');
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        warehouseId,
        adjustments,
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success('تم حفظ التسوية بنجاح');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ التسوية'));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تسوية المخزون — مطابقة العدد الفعلي"
      confirmText="حفظ التسوية"
      onConfirm={onConfirm}
      isLoading={adjustMutation.isPending}
      confirmDisabled={adjustments.length === 0 || hasInvalidCount}
      maxWidth="md:max-w-[720px]"
    >
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
                  المنتج / المتغير
                </th>
                <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
                  الكمية بالنظام
                </th>
                <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
                  العدد الفعلي
                </th>
                <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
                  الفرق
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const delta = deltaFor(item);
                return (
                  <tr
                    key={item.variantId}
                    className="border-b border-gray-100"
                  >
                    <td className="py-2 px-3">
                      <p className="font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {variantLabel(item)}
                      </p>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{item.quantity}</td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        value={actualCounts[item.variantId] ?? ''}
                        onChange={(e) =>
                          setActualCounts((current) => ({
                            ...current,
                            [item.variantId]: e.target.value,
                          }))
                        }
                        error={
                          invalidFor(item) ? 'رقم صحيح غير سالب' : undefined
                        }
                        inputClassName="w-28 border-gray-200 px-3 py-2 text-sm"
                      />
                    </td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        delta === 0
                          ? 'text-gray-400'
                          : delta > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Input
          label="ملاحظة"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="سبب التسوية (اختياري)"
        />

        <p className="text-xs text-gray-400">
          لا يمكن أن تؤدي التسوية إلى كمية أقل من صفر — سيتم رفض العملية بالكامل
          في هذه الحالة. المتغيرات غير الظاهرة هنا (كميتها صفر) تُضاف عبر فاتورة
          مورد أو نقل من مخزن آخر.
        </p>
      </div>
    </BaseModal>
  );
}
