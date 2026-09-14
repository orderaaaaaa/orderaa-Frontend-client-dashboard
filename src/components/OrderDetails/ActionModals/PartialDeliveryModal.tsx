'use client';

import React, { useMemo, useState } from 'react';
import { LiaMinusSolid, LiaPlusSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { OrderProduct, OrderStatus } from '@/types/orders';
import { usePartialDelivery } from '@/services/logistics';

interface PartialDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderStatus: string;
  orderProducts: OrderProduct[];
  totalCost: number;
}

interface VariantGroup {
  key: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  rows: OrderProduct[];
}

const groupKey = (op: OrderProduct) => `v${op.variantId}`;

const variantLabelOf = (op: OrderProduct) => {
  const attrs = (op.attributes ?? []).filter(
    (a) => a?.name && a?.options?.name,
  );
  return attrs.length > 0
    ? attrs.map((a) => `${a.name}: ${a.options.name}`).join(' • ')
    : (op.products.extraDetails?.variants ?? [])
        .map((v) => v.title)
        .join(' • ');
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export default function PartialDeliveryModal({
  isOpen,
  onClose,
  orderId,
  orderStatus,
  orderProducts,
  totalCost,
}: PartialDeliveryModalProps) {
  const [refusedByGroup, setRefusedByGroup] = useState<Record<string, number>>(
    {},
  );
  const [overridePrice, setOverridePrice] = useState<string>('');
  const partialDelivery = usePartialDelivery();

  const groups = useMemo<VariantGroup[]>(() => {
    const byKey = new Map<string, VariantGroup>();
    orderProducts.forEach((op) => {
      const key = groupKey(op);
      const existing = byKey.get(key);
      if (existing) {
        existing.rows.push(op);
        return;
      }
      byKey.set(key, {
        key,
        name: op.products.name,
        variantLabel: variantLabelOf(op),
        unitPrice: op.price,
        rows: [op],
      });
    });
    return Array.from(byKey.values());
  }, [orderProducts]);

  const selectedIds = useMemo(
    () =>
      groups.flatMap((group) =>
        group.rows
          .slice(0, refusedByGroup[group.key] ?? 0)
          .map((row) => row.id),
      ),
    [groups, refusedByGroup],
  );

  const refusedValue = useMemo(() => {
    const selected = new Set(selectedIds);
    return roundMoney(
      orderProducts
        .filter((op) => selected.has(op.id))
        .reduce((sum, op) => sum + op.price, 0),
    );
  }, [orderProducts, selectedIds]);

  const calculatedPrice = roundMoney(totalCost - refusedValue);
  const totalUnits = orderProducts.length;
  const refusesAll = totalUnits > 0 && selectedIds.length === totalUnits;
  const overrideValue = overridePrice === '' ? undefined : Number(overridePrice);
  const overrideInvalid =
    overrideValue !== undefined &&
    (!Number.isFinite(overrideValue) || overrideValue < 0);
  const isWithDriver = orderStatus === OrderStatus.WITH_DRIVER;
  const isPending = partialDelivery.isPending;

  const setRefused = (group: VariantGroup, next: number) => {
    const clamped = Math.max(0, Math.min(group.rows.length, next));
    setRefusedByGroup((prev) => ({ ...prev, [group.key]: clamped }));
  };

  const handleReset = () => {
    setRefusedByGroup({});
    setOverridePrice('');
  };

  const handleClose = () => {
    if (isPending) return;
    handleReset();
    onClose();
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0 || refusesAll || overrideInvalid) return;
    partialDelivery.mutate(
      {
        orderId,
        returnedOrderProductIds: selectedIds,
        adjustedTotalCost: overrideValue,
      },
      {
        onSuccess: () => {
          handleReset();
          onClose();
        },
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تسليم جزئي"
      onConfirm={handleConfirm}
      confirmText={isPending ? 'جاري التنفيذ...' : 'تأكيد'}
      confirmDisabled={
        isPending || selectedIds.length === 0 || refusesAll || overrideInvalid
      }
    >
      <div className="space-y-6">
        {isWithDriver && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            الطلب مع المندوب. عند التأكيد يتحول الطلب إلى تم التسليم بالقطع
            المستلمة
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            حدد القطع المرفوضة
          </label>
          <div className="flex flex-col gap-3">
            {groups.map((group) => {
              const refused = refusedByGroup[group.key] ?? 0;
              return (
                <div
                  key={group.key}
                  className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-[#ECECEC]"
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#1F1F1F] truncate">
                      {group.name}
                    </span>
                    {group.variantLabel && (
                      <span className="text-xs text-gray-500">
                        {group.variantLabel}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {group.unitPrice} ج.م • {group.rows.length} قطعة
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-xs text-gray-500">
                      الكمية المرفوضة
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="زيادة"
                        disabled={isPending || refused >= group.rows.length}
                        onClick={() => setRefused(group, refused + 1)}
                        className="flex size-8 items-center justify-center rounded-full border border-[#ECECEC] text-primary disabled:opacity-40"
                      >
                        <LiaPlusSolid className="size-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {refused}
                      </span>
                      <button
                        type="button"
                        aria-label="إنقاص"
                        disabled={isPending || refused <= 0}
                        onClick={() => setRefused(group, refused - 1)}
                        className="flex size-8 items-center justify-center rounded-full border border-[#ECECEC] text-primary disabled:opacity-40"
                      >
                        <LiaMinusSolid className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {refusesAll && (
            <p className="text-xs text-red-600">
              لا يمكن رفض كل القطع، استخدم المرتجع الكامل
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">الإجمالي الأصلي</span>
            <span className="text-sm font-bold">{totalCost} ج.م</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">قيمة القطع المرفوضة</span>
            <span className="text-sm font-bold">{refusedValue} ج.م</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">السعر بعد الخصم</span>
            <span className="text-sm font-bold text-primary">
              {calculatedPrice} ج.م
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            تعديل السعر النهائي (اختياري)
          </label>
          <input
            type="number"
            min={0}
            value={overridePrice}
            disabled={isPending}
            onChange={(e) => setOverridePrice(e.target.value)}
            placeholder={String(calculatedPrice)}
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {overrideInvalid && (
            <p className="text-xs text-red-600">
              السعر النهائي يجب أن يكون رقمًا غير سالب
            </p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
