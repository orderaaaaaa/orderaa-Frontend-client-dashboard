'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { OrderProduct } from '@/types/orders';
import { useCancellationReasons } from '@/services/orders';
import { useReturnRefund } from '@/services/logistics';
import { REFUND_METHODS, type RefundMethod } from '@/types/logistics';
import { LiaCheckSolid } from 'react-icons/lia';
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
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
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
    if (selectedProductIds.length === 0 || selectedReasonId === null || refundMethod === null) return;
    if (amountValue === null || amountInvalid) return;
    refundMutation.mutate(
      {
        orderId,
        returnedOrderProductIds: selectedProductIds,
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
    setSelectedProductIds([]);
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
  const selectedTotal =
    Math.round(
      orderProducts
        .filter((op) => selectedProductIds.includes(op.id))
        .reduce((sum, op) => sum + op.price, 0) * 100
    ) / 100;
  const isFormValid =
    selectedProductIds.length > 0 && selectedReasonId !== null && refundMethod !== null && !amountInvalid;

  const isSelected = (productId: number) => selectedProductIds.includes(productId);

  const toggleProduct = (productId: number) =>
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

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
          <label className="font-bold text-foreground">
            المنتج المرتجع <span className="text-red-600">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {orderProducts.map((op) => (
              <label
                key={op.id}
                role="checkbox"
                aria-checked={isSelected(op.id)}
                tabIndex={0}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all',
                  isSelected(op.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-primary/5'
                )}
                onClick={() => toggleProduct(op.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleProduct(op.id);
                  }
                }}
              >
                <div
                  className={clsx(
                    'w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all shrink-0',
                    isSelected(op.id) ? 'border-primary bg-primary' : 'border-gray-300 bg-card'
                  )}
                >
                  {isSelected(op.id) && <LiaCheckSolid className="w-4 h-4 text-white" />}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className={clsx(
                    'text-sm',
                    isSelected(op.id) ? 'text-primary-text font-semibold' : 'text-foreground'
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
                <span className="text-sm font-bold text-foreground shrink-0">
                  {op.price} ج.م
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">
            المبلغ <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {selectedProductIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              إجمالي المنتجات المحددة: {selectedTotal} ج.م
            </p>
          )}
          {amountValue !== null && amountInvalid && (
            <p className="text-xs text-red-600">
              المبلغ مطلوب ويجب أن يكون صفرًا أو أكبر
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">
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
          <label className="font-bold text-foreground">
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
