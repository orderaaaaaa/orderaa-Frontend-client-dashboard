'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/I18nProvider';
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
  const { t } = useI18n();
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [notes, setNotes] = useState('');

  const { data: reasonsData, isLoading, isError } = useCancellationReasons(
    true,
    REASON_TYPE[kind],
  );
  const refuseMutation = useRefuseClosure();
  const cancelMutation = useCancelClosure();
  const mutation = kind === 'REFUSE' ? refuseMutation : cancelMutation;
  const copy = MODAL_COPY[kind];

  const reasons = reasonsData ?? [];
  const hasNoReasons = reasonsData !== undefined && reasonsData.length === 0;
  const reasonsReady = !isLoading && !isError && reasonsData !== undefined;
  const isConfirmDisabled =
    !reasonsReady || (!selectedReasonId && !reasonText.trim()) || mutation.isPending;

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;
    const body: FollowupReasonBody =
      selectedReasonId !== null
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
      confirmButtonClassName="px-8 py-2 bg-destructive dark:bg-destructive/60 rounded-[28px] font-bold text-white hover:bg-destructive/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">
            {copy.listLabel} <span className="text-destructive">*</span>
          </label>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-foreground">
              <p>لا توجد أسباب متاحة</p>
              <Link href="/dashboard/store-settings" className="font-semibold text-primary hover:underline">
                أضف الأسباب من إعدادات المتجر
              </Link>
            </div>
          ) : hasNoReasons ? (
            <p className="text-sm text-muted-foreground">{t('inProcess.closureReason.freeTextOnly')}</p>
          ) : (
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
              {reasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  className={clsx(
                    'p-3 rounded-lg cursor-pointer border transition-all text-sm text-right',
                    selectedReasonId === reason.id
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-border hover:border-primary/40 hover:bg-primary/10 text-foreground',
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
            inputClassName="bg-card"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="closureNotes" className="font-bold text-foreground">ملاحظات (اختياري)</label>
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
