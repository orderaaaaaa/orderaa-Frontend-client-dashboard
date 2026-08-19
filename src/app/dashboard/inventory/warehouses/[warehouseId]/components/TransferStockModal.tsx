'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  useTransferStockMutation,
  useWarehouseOptions,
} from '@/services/warehouses';
import type { WarehouseStockItemApi } from '@/lib/api/warehouses';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromWarehouseId: number;
  items: WarehouseStockItemApi[];
  onSuccess: () => void;
}

const variantLabel = (item: WarehouseStockItemApi): string =>
  item.options.map((option) => option.option.name).join(' / ') ||
  item.combinationKey;

export function TransferStockModal({
  isOpen,
  onClose,
  fromWarehouseId,
  items,
  onSuccess,
}: TransferStockModalProps) {
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [note, setNote] = useState('');

  // A transfer PUTS stock somewhere, so an inactive warehouse is not a valid
  // destination — it stays listed (disabled) rather than vanishing, so the list
  // still matches the warehouses screen the user just came from.
  const { pickerOptions } = useWarehouseOptions();
  const transferMutation = useTransferStockMutation();

  useEffect(() => {
    if (!isOpen) return;
    setToWarehouseId('');
    setQuantities({});
    setNote('');
  }, [isOpen]);

  const destinationOptions = pickerOptions.filter(
    (option) => option.key !== String(fromWarehouseId)
  );

  const parsedItems = items
    .map((item) => {
      const raw = quantities[item.variantId];
      const quantity = raw ? Number(raw) : 0;
      return { variantId: item.variantId, quantity, available: item.quantity };
    })
    .filter((entry) => entry.quantity > 0);

  // Backend requires positive integers; fractions would 400 with a message
  // the user cannot map back to a field.
  const invalidFor = (item: WarehouseStockItemApi): boolean => {
    const raw = quantities[item.variantId];
    if (raw === undefined || raw === '') return false;
    const quantity = Number(raw);
    return !Number.isInteger(quantity) || quantity < 0;
  };

  const hasInvalidQuantity = items.some(invalidFor);

  const overAvailable = parsedItems.filter(
    (entry) => entry.quantity > entry.available
  );

  const onConfirm = async () => {
    if (!toWarehouseId) {
      toast.error('يرجى اختيار مخزن الوجهة');
      return;
    }
    if (hasInvalidQuantity) {
      toast.error('الكمية المنقولة يجب أن تكون رقمًا صحيحًا غير سالب');
      return;
    }
    if (parsedItems.length === 0) {
      toast.error('يرجى إدخال كمية للنقل');
      return;
    }
    if (overAvailable.length > 0) {
      toast.error('الكمية المنقولة أكبر من المتاح في المخزن');
      return;
    }

    try {
      await transferMutation.mutateAsync({
        fromWarehouseId,
        toWarehouseId: Number(toWarehouseId),
        items: parsedItems.map(({ variantId, quantity }) => ({
          variantId,
          quantity,
        })),
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success('تم نقل المخزون بنجاح');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر نقل المخزون'));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="نقل المخزون"
      confirmText="تنفيذ النقل"
      onConfirm={onConfirm}
      isLoading={transferMutation.isPending}
      confirmDisabled={
        !toWarehouseId ||
        parsedItems.length === 0 ||
        hasInvalidQuantity ||
        overAvailable.length > 0
      }
      maxWidth="md:max-w-[720px]"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            إلى مخزن <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={destinationOptions}
            value={toWarehouseId}
            onValueChange={setToWarehouseId}
            placeholder="اختر مخزن الوجهة"
            emptyMessage="لا توجد مخازن أخرى"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
                  المنتج / المتغير
                </th>
                <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
                  المتاح
                </th>
                <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
                  الكمية المنقولة
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const raw = quantities[item.variantId] ?? '';
                const quantity = raw ? Number(raw) : 0;
                const notInteger = invalidFor(item);
                const invalid = notInteger || quantity > item.quantity;
                return (
                  <tr key={item.variantId} className="border-b border-gray-100">
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
                        min={0}
                        max={item.quantity}
                        value={raw}
                        onChange={(e) =>
                          setQuantities((current) => ({
                            ...current,
                            [item.variantId]: e.target.value,
                          }))
                        }
                        error={
                          notInteger
                            ? 'رقم صحيح غير سالب'
                            : invalid
                              ? 'أكبر من المتاح'
                              : undefined
                        }
                        inputClassName="w-28 border-gray-200 px-3 py-2 text-sm"
                      />
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
          placeholder="سبب النقل (اختياري)"
        />
      </div>
    </BaseModal>
  );
}
