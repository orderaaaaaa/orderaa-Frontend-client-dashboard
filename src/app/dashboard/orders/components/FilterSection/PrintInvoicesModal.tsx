'use client';

import React, { useState } from 'react';
import { LiaPrintSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { Order } from '@/types/orders';
import {
  PRINT_COUNT_MAX,
  claimNextOrdersForPrint,
} from '../../print-orders/services/printOrders';
import { printApiErrorMessage } from '../../print-orders/utils/printApiError';

interface PrintInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimed: (orders: Order[]) => Promise<void>;
}

function countErrorOf(value: string): string | undefined {
  if (value === '') return undefined;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1) {
    return 'أدخل عددًا صحيحًا أكبر من صفر';
  }
  if (count > PRINT_COUNT_MAX) {
    return `الحد الأقصى ${PRINT_COUNT_MAX} طلب في المرة الواحدة`;
  }
  return undefined;
}

export function PrintInvoicesModal({
  isOpen,
  onClose,
  onClaimed,
}: PrintInvoicesModalProps) {
  const [invoiceCount, setInvoiceCount] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);
  const countError = countErrorOf(invoiceCount);

  const handleReset = () => {
    setInvoiceCount('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePrint = async () => {
    if (invoiceCount === '' || countError) return;
    setIsClaiming(true);
    try {
      const { claimed } = await claimNextOrdersForPrint(Number(invoiceCount));
      if (claimed.length === 0) {
        toast.error('لا توجد طلبات متاحة للطباعة');
        return;
      }
      handleReset();
      onClose();
      await onClaimed(claimed);
    } catch (error) {
      toast.error(printApiErrorMessage(error, 'حدث خطأ أثناء جلب الطلبات'));
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="طباعة الفواتير"
      onConfirm={handlePrint}
      confirmText="طباعة"
      confirmIcon={<LiaPrintSolid className="size-5 text-white" />}
      confirmDisabled={invoiceCount === '' || countError !== undefined}
      isLoading={isClaiming}
      maxWidth="max-w-[500px]"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <LiaPrintSolid className="size-10 text-primary" />
          <div>
            <p className="font-bold text-xl">طباعة الفواتير</p>
            <p className="text-gray-500 text-base">
              أدخل عدد الطلبات المراد طباعتها من الطلبات المؤكدة (حتى{' '}
              {PRINT_COUNT_MAX} طلب)
            </p>
          </div>
        </div>

        <Input
          label="عدد الطلبات للطباعة"
          type="number"
          inputMode="numeric"
          min={1}
          max={PRINT_COUNT_MAX}
          value={invoiceCount}
          onChange={(e) => setInvoiceCount(e.target.value)}
          placeholder="أدخل عدد الطلبات"
          disabled={isClaiming}
          error={countError}
        />
      </div>
    </BaseModal>
  );
}
