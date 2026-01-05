'use client';

import React, { useState } from 'react';
import { LiaPrintSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';

interface PrintInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (count: number) => void | Promise<void>;
  isLoading?: boolean;
}

export function PrintInvoicesModal({
  isOpen,
  onClose,
  onPrint,
  isLoading = false,
}: PrintInvoicesModalProps) {
  const [invoiceCount, setInvoiceCount] = useState<string>('');

  const handlePrint = async () => {
    const count = parseInt(invoiceCount, 10);
    if (count > 0) {
      await onPrint(count);
      handleReset();
    }
  };

  const handleReset = () => {
    setInvoiceCount('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="طباعة الفواتير"
      onConfirm={handlePrint}
      confirmText="طباعة"
      confirmIcon={<LiaPrintSolid className="size-5 text-white" />}
      confirmDisabled={!invoiceCount || parseInt(invoiceCount, 10) <= 0}
      isLoading={isLoading}
      maxWidth="w-[500px]"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-start gap-3">
          <LiaPrintSolid className="size-10 text-primary" />
          <div>
            <p className='font-bold text-xl'>طباعة الفواتير</p>
            <p className="text-gray-500 text-base">
              اختر عدد الطلبات المراد طباعتها من الطلبات المؤكدة
            </p>
          </div>
        </div>

        <Input
          label="عدد الطلبات للطباعة"
          type="number"
          min={1}
          value={invoiceCount}
          onChange={(e) => setInvoiceCount(e.target.value)}
          placeholder="عدد الفواتير للطباعة"
          disabled={isLoading}
        />
      </div>
    </BaseModal>
  );
}
