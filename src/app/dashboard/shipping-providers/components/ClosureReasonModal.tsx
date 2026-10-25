'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import type { FollowupReasonBody } from '@/lib/api/followup';
import {
  useCancellationReasons,
  type CancellationReasonType,
} from '@/services/orders';
import { useCancelClosure, useRefuseClosure } from '@/services/shippingProviders';

export type ClosureReasonKind = 'REFUSE' | 'CANCEL';

interface ClosureReasonModalProps {
  kind: ClosureReasonKind;
  orderId: number;
  onClose: () => void;
}

const REASON_TYPE: Record<ClosureReasonKind, CancellationReasonType> = {
  REFUSE: 'REFUSAL_TO_ACCEPT',
  CANCEL: 'SHIPPING_CANCELLATION',
};

const MODAL_COPY: Record<ClosureReasonKind, { title: string; confirmText: string; listLabel: string }> = {
  REFUSE: {
    title: 'رفض التسليم',
    confirmText: 'تأكيد الرفض',
    listLabel: 'سبب الرفض',
  },
  CANCEL: {
    title: 'إلغاء الطلب',
    confirmText: 'تأكيد الإلغاء',
    listLabel: 'سبب الإلغاء',
  },
};

export function ClosureReasonModal({ kind, orderId, onClose }: ClosureReasonModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [notes, setNotes] = useState('');

  const { data: reasons = [], isLoading, isError } = useCancellationReasons(
    true,
    REASON_TYPE[kind],
  );
  const refuseMutation = useRefuseClosure();
  const cancelMutation = useCancelClosure();
  const mutation = kind === 'REFUSE' ? refuseMutation : cancelMutation;
  const copy = MODAL_COPY[kind];

  const reasonsReady = !isLoading && !isError && reasons.length > 0;
  const isConfirmDisabled =
    !reasonsReady || (!selectedReasonId && !reasonText.trim()) || mutation.isPending;

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;
    const body: FollowupReasonBody = selectedReasonId
      ? { reasonId: selectedReasonId }
      : { reasonText: reasonText.trim() };
    if (notes.trim()) body.notes = notes.trim();
    await mutation.mutateAsync({ orderId, body }).then(onClose).catch(() => undefined);
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={copy.title}
      onConfirm={handleConfirm}
      confirmText={copy.confirmText}
      confirmDisabled={isConfirmDisabled}
      isLoading={mutation.isPending}
      confirmButtonClassName="px-8 py-2 bg-red-600 rounded-[28px] font-bold text-white hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            {copy.listLabel} <span className="text-red-600">*</span>
          </label>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError || reasons.length === 0 ? (
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-[#ECECEC] p-4 text-sm text-[#1F1F1F]">
              <p>لا توجد أسباب متاحة</p>
              <Link href="/dashboard/store-settings" className="font-semibold text-primary hover:underline">
                أضف الأسباب من إعدادات المتجر
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
                      ? 'border-primary bg-[#F6F2FC] text-primary font-semibold'
                      : 'border-[#ECECEC] hover:border-[#CBB5FD] hover:bg-[#FDFBFF] text-[#1F1F1F]',
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
            disabled={mutation.isPending}
            inputClassName="bg-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">ملاحظات (اختياري)</label>
          <Textarea
            name="closureNotes"
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
