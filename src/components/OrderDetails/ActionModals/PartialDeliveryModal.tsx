'use client';

import React, { useState, useMemo } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { OrderProduct } from '@/types/orders';

interface PartialDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderProducts: OrderProduct[];
  totalCost: number;
}

export default function PartialDeliveryModal({
  isOpen,
  onClose,
  orderProducts,
  totalCost,
}: PartialDeliveryModalProps) {
  const [returnedIds, setReturnedIds] = useState<Set<number>>(new Set());
  const [overridePrice, setOverridePrice] = useState<string>('');

  const calculatedPrice = useMemo(() => {
    const returnedTotal = orderProducts
      .filter((op) => returnedIds.has(op.id))
      .reduce((sum, op) => sum + op.price * (op.quantity || 1), 0);
    return totalCost - returnedTotal;
  }, [orderProducts, returnedIds, totalCost]);

  const finalPrice = overridePrice !== '' ? Number(overridePrice) : calculatedPrice;

  const handleToggle = (productId: number, checked: boolean) => {
    setReturnedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    console.log('[PartialDelivery]', {
      returnedOrderProductIds: Array.from(returnedIds),
      adjustedTotalCost: finalPrice,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setReturnedIds(new Set());
    setOverridePrice('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تسليم جزئي"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
      confirmDisabled={returnedIds.size === 0}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            حدد المنتجات المرتجعة
          </label>
          <div className="flex flex-col gap-3">
            {orderProducts.map((op) => (
              <label
                key={op.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#ECECEC] cursor-pointer hover:border-[#CBB5FD] hover:bg-[#FDFBFF] transition-all"
              >
                <Checkbox
                  checked={returnedIds.has(op.id)}
                  onCheckedChange={(checked) =>
                    handleToggle(op.id, checked === true)
                  }
                />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-medium text-[#1F1F1F] truncate">
                    {op.products.name}
                  </span>
                  {op.variants && op.variants.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {op.variants.map((v) => `${v.label}: ${v.value}`).join(' • ')}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-[#1F1F1F] shrink-0">
                  {op.price * (op.quantity || 1)} ج.م
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">الإجمالي الأصلي</span>
            <span className="text-sm font-bold">{totalCost} ج.م</span>
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
            value={overridePrice}
            onChange={(e) => setOverridePrice(e.target.value)}
            placeholder={String(calculatedPrice)}
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </BaseModal>
  );
}
