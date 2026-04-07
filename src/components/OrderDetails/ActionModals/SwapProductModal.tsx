'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';

interface SwapProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: {
    id: number;
    name: string;
    price: number;
    variants: { label: string; value: string }[];
  };
}

export default function SwapProductModal({
  isOpen,
  onClose,
  currentProduct,
}: SwapProductModalProps) {
  const [newProductName, setNewProductName] = useState('');
  const [variantLabel, setVariantLabel] = useState('');
  const [variantValue, setVariantValue] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');

  const priceDifference = typeof newPrice === 'number' ? newPrice - currentProduct.price : 0;

  const handleConfirm = () => {
    console.log('[SwapProduct]', {
      oldProduct: currentProduct,
      newProductName,
      newVariants: { label: variantLabel, value: variantValue },
      newPrice,
      priceDifference,
    });
    handleClose();
  };

  const handleClose = () => {
    setNewProductName('');
    setVariantLabel('');
    setVariantValue('');
    setNewPrice('');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تغيير المنتج"
      onConfirm={handleConfirm}
      confirmText="تأكيد التغيير"
      confirmDisabled={!newProductName || newPrice === ''}
      maxWidth="md:max-w-[900px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="text-base font-bold text-[#1E1E1E] mb-4">المنتج الحالي</h3>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">اسم المنتج</span>
              <p className="text-base font-bold text-[#1E1E1E] mt-1">{currentProduct.name}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-500">السعر</span>
              <p className="text-base font-bold text-[#1E1E1E] mt-1">{currentProduct.price} جنيه</p>
            </div>

            {currentProduct.variants.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500">المتغيرات</span>
                <div className="mt-1 space-y-1">
                  {currentProduct.variants.map((variant, idx) => (
                    <p key={idx} className="text-sm font-bold text-[#1E1E1E]">
                      {variant.label}: {variant.value}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#1E1E1E]">المنتج الجديد</h3>

          <Input
            label="اسم المنتج"
            placeholder="أدخل اسم المنتج الجديد"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="اسم المتغير"
              placeholder="مثال: اللون"
              value={variantLabel}
              onChange={(e) => setVariantLabel(e.target.value)}
            />
            <Input
              label="قيمة المتغير"
              placeholder="مثال: أزرق"
              value={variantValue}
              onChange={(e) => setVariantValue(e.target.value)}
            />
          </div>

          <Input
            label="السعر الجديد"
            type="number"
            placeholder="أدخل السعر"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : '')}
            min={0}
          />

          {typeof newPrice === 'number' && (
            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">فرق السعر</span>
              <span
                className={`text-base font-bold ${
                  priceDifference > 0
                    ? 'text-green-600'
                    : priceDifference < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {priceDifference > 0 ? '+' : ''}{priceDifference} جنيه
              </span>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
