'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { OrderProduct } from '@/types/orders';
import { useCancellationReasons } from '@/services/orders';
import { useReturnRefund } from '@/services/logistics';
import { REFUND_METHODS, type RefundMethod } from '@/types/logistics';
import clsx from 'clsx';

const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
  CASH: 'نقدًا',
  BANK_TRANSFER: 'تحويل بنكي',
  E_WALLET: 'محفظة إلكترونية',
  OTHER: 'أخرى',
};

const refundMethodOptions = REFUND_METHODS.map((method) => ({
  key: method,
  value: REFUND_METHOD_LABELS[method],
}));

interface ReturnRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderProducts: OrderProduct[];
}

export default function ReturnRefundModal({
  isOpen,
  onClose,
  orderId,
  orderProducts,
}: ReturnRefundModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState<RefundMethod | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);

  const { data: reasons = [], isLoading: loadingReasons } = useCancellationReasons(isOpen, 'REFUSAL_TO_ACCEPT');
  const refundMutation = useReturnRefund();

  const reasonOptions = reasons.map((r) => ({
    key: String(r.id),
    value: r.reasonName,
  }));

  const handleConfirm = () => {
    if (selectedProductId === null || selectedReasonId === null || refundMethod === null) return;
    if (amountValue === null || amountInvalid) return;
    refundMutation.mutate(
      {
        orderId,
        returnedOrderProductId: selectedProductId,
        amount: amountValue,
        refundMethod,
        reasonId: selectedReasonId,
      },
      {
        onSuccess: () => {
          handleReset();
          onClose();
        },
      }
    );
  };

  const handleReset = () => {
    setSelectedProductId(null);
    setAmount('');
    setRefundMethod(null);
    setSelectedReasonId(null);
  };

  const handleClose = () => {
    if (refundMutation.isPending) return;
    handleReset();
    onClose();
  };

  const amountValue = amount === '' ? null : Number(amount);
  const amountInvalid = amountValue === null || !Number.isFinite(amountValue) || amountValue < 0;
  const isFormValid =
    selectedProductId !== null && selectedReasonId !== null && refundMethod !== null && !amountInvalid;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="مرتجع"
      onConfirm={handleConfirm}
      confirmText={refundMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد المرتجع'}
      confirmDisabled={!isFormValid || refundMutation.isPending}
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
          <label className="font-bold text-[#1F1F1F]">
            المبلغ <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {amountInvalid && (
            <p className="text-xs text-red-600">
              المبلغ مطلوب ويجب أن يكون صفرًا أو أكبر
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            طريقة الاسترداد <span className="text-red-600">*</span>
          </label>
          <SearchableSelect
            value={refundMethod ?? ''}
            onValueChange={(v) => setRefundMethod(REFUND_METHODS.find((method) => method === v) ?? null)}
            options={refundMethodOptions}
            placeholder="اختر طريقة الاسترداد..."
            searchPlaceholder="بحث عن طريقة..."
            emptyMessage="لا توجد طرق متاحة"
            noResultsMessage="لا توجد نتائج للبحث"
            clearable
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
