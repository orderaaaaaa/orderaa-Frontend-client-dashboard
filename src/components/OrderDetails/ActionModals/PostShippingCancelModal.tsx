'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { Textarea } from '@/components/ui/textarea';
import Input from '@/components/ui/Input';
import { useCancellationReasons } from '@/services/orders';
import { useFollowupRefuseMutation } from '@/services/followup';
import clsx from 'clsx';

interface PostShippingCancelModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostShippingCancelModal({
  orderId,
  isOpen,
  onClose,
}: PostShippingCancelModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [notes, setNotes] = useState('');

  const { data: reasons = [], isLoading, isError } = useCancellationReasons(isOpen, 'REFUSAL_TO_ACCEPT');
  const refuseMutation = useFollowupRefuseMutation();

  const reasonsReady = !isLoading && !isError && reasons.length > 0;
  const isConfirmDisabled =
    !reasonsReady || (!selectedReasonId && !reasonText.trim()) || refuseMutation.isPending;

  const handleReset = () => {
    setSelectedReasonId(null);
    setReasonText('');
    setNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;
    const reasonPayload = selectedReasonId
      ? { reasonId: selectedReasonId }
      : { reasonText: reasonText.trim() };
    try {
      await refuseMutation.mutateAsync({
        orderId,
        ...reasonPayload,
        notes: notes.trim() || undefined,
      });
      toast.success('تم تحديث الحالة بنجاح');
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث الحالة');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إلغاء بعد الشحن"
      onConfirm={handleConfirm}
      confirmText="تأكيد الإلغاء"
      confirmDisabled={isConfirmDisabled}
      isLoading={refuseMutation.isPending}
      confirmButtonClassName="px-8 py-2 bg-red-600 rounded-[28px] font-bold text-white hover:brightness-90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">
            سبب الإلغاء <span className="text-red-600">*</span>
          </label>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600">تعذر تحميل أسباب الرفض</p>
          ) : reasons.length === 0 ? (
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-foreground">
              <p>لا توجد أسباب رفض متاحة</p>
              <Link href="/dashboard/store-settings" className="font-semibold text-primary hover:underline">
                أضف أسباب الرفض من إعدادات المتجر
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
              {reasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  className={clsx(
                    'p-3 rounded-lg cursor-pointer border transition-all text-sm text-right',
                    selectedReasonId === reason.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:border-primary/40 hover:bg-primary/5 text-foreground'
                  )}
                  onClick={() => {
                    setSelectedReasonId(reason.id);
                    setReasonText('');
                  }}
                >
                  {reason.reasonName}
                </button>
              ))}
            </div>
          )}

          <Input
            type="text"
            value={reasonText}
            onChange={(e) => {
              setReasonText(e.target.value);
              setSelectedReasonId(null);
            }}
            onClear={() => setReasonText('')}
            clearable
            placeholder="أو اكتب السبب"
            maxLength={255}
            disabled={refuseMutation.isPending}
            inputClassName="bg-background"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">ملاحظات (اختياري)</label>
          <Textarea
            name="postShippingCancelNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظات إضافية..."
            maxLength={2000}
          />
        </div>
      </div>
    </BaseModal>
  );
}
