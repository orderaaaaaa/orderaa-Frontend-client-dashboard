'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { OrderProduct } from '@/types/orders';
import { usePostShippingReasons } from '@/services/logistics';
import clsx from 'clsx';

interface ReturnRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderProducts: OrderProduct[];
}

export default function ReturnRefundModal({
  isOpen,
  onClose,
  orderProducts,
}: ReturnRefundModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);

  const { data: reasons = [], isLoading: loadingReasons } = usePostShippingReasons(isOpen);

  const reasonOptions = reasons.map((r) => ({
    key: String(r.id),
    value: r.reasonName,
  }));

  const handleConfirm = () => {
    console.log('[ReturnRefund]', {
      returnedOrderProductId: selectedProductId,
      amount: amount ? Number(amount) : 0,
      reasonId: selectedReasonId,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedProductId(null);
    setAmount('');
    setSelectedReasonId(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isFormValid = selectedProductId !== null && selectedReasonId !== null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="مرتجع"
      onConfirm={handleConfirm}
      confirmText="تأكيد المرتجع"
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
                      (a) => a?.name && a?.options?.name
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
          <label className="font-bold text-[#1F1F1F]">المبلغ</label>
          <p className="text-xs text-gray-500">
            سالب = المندوب يدفع للعميل، موجب = العميل يدفع
          </p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            السبب <span className="text-red-600">*</span>
          </label>
          <SearchableSelect
            value={selectedReasonId ? String(selectedReasonId) : ''}
            onValueChange={(v) => setSelectedReasonId(v ? Number(v) : null)}
            options={reasonOptions}
            placeholder="اختر سبب المرتجع..."
            searchPlaceholder="بحث عن سبب..."
            emptyMessage="لا توجد أسباب متاحة"
            noResultsMessage="لا توجد نتائج للبحث"
            loading={loadingReasons}
            clearable
          />
        </div>
      </div>
    </BaseModal>
  );
}
