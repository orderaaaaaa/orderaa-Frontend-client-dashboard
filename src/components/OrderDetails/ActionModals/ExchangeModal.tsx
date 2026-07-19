'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { OrderProduct } from '@/types/orders';
import clsx from 'clsx';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderProducts: OrderProduct[];
}

export default function ExchangeModal({
  isOpen,
  onClose,
  orderProducts,
}: ExchangeModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [variantLabel, setVariantLabel] = useState('');
  const [variantValue, setVariantValue] = useState('');
  const [priceDifference, setPriceDifference] = useState('');

  const handleConfirm = () => {
    console.log('[Exchange]', {
      returnedOrderProductId: selectedProductId,
      newProductName,
      newVariants: variantLabel && variantValue
        ? [{ label: variantLabel, value: variantValue }]
        : [],
      priceDifference: priceDifference ? Number(priceDifference) : 0,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedProductId(null);
    setNewProductName('');
    setVariantLabel('');
    setVariantValue('');
    setPriceDifference('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isFormValid = selectedProductId !== null && newProductName.trim() !== '';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="استبدال منتج"
      onConfirm={handleConfirm}
      confirmText="تأكيد الاستبدال"
      confirmDisabled={!isFormValid}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            المنتج المرتجع <span className="text-red-600">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {orderProducts.map((op) => (
              <label
                key={op.id}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all',
                  selectedProductId === op.id
                    ? 'border-primary bg-[#F6F2FC]'
                    : 'border-[#ECECEC] hover:border-[#CBB5FD] hover:bg-[#FDFBFF]'
                )}
                onClick={() => setSelectedProductId(op.id)}
              >
                <div
                  className={clsx(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                    selectedProductId === op.id ? 'border-primary' : 'border-gray-300'
                  )}
                >
                  {selectedProductId === op.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className={clsx(
                    'text-sm',
                    selectedProductId === op.id ? 'text-primary font-semibold' : 'text-[#1F1F1F]'
                  )}>
                    {op.products.name}
                  </span>
                  {(() => {
                    const attrs = (op.attributes ?? []).filter(
                      (a) => a?.name && a?.options?.name,
                    );
                    const text =
                      attrs.length > 0
                        ? attrs
                            .map((a) => `${a.name}: ${a.options.name}`)
                            .join(' • ')
                        : (op.products.extraDetails?.variants ?? [])
                            .map((v) => v.title)
                            .join(' • ');
                    return text ? (
                      <span className="text-xs text-gray-500">{text}</span>
                    ) : null;
                  })()}
                </div>
                <span className="text-sm font-bold text-[#1F1F1F] shrink-0">
                  {op.price} ج.م
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            المنتج الجديد <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            placeholder="اسم المنتج الجديد..."
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[#1F1F1F]">اسم المتغير</label>
            <input
              type="text"
              value={variantLabel}
              onChange={(e) => setVariantLabel(e.target.value)}
              placeholder="مثال: اللون"
              className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[#1F1F1F]">قيمة المتغير</label>
            <input
              type="text"
              value={variantValue}
              onChange={(e) => setVariantValue(e.target.value)}
              placeholder="مثال: أحمر"
              className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">فرق السعر</label>
          <input
            type="number"
            value={priceDifference}
            onChange={(e) => setPriceDifference(e.target.value)}
            placeholder="0"
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </BaseModal>
  );
}
