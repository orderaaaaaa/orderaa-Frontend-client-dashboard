'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useSendAgainRecordMutation } from '@/services/shippingProviders';
import type { SendAgainBlockedReason } from '@/types/shippingProviders';

const BLOCKED_REASON_TEXTS: Partial<Record<SendAgainBlockedReason, string>> = {
  NO_CARRIER_STATUS: 'لا توجد حالة من شركة الشحن',
  NOT_TURBO: 'إعادة الإرسال متاحة لتوربو فقط',
  RETURNED_TO_MERCHANT: 'آخر حالة من شركة الشحن تعني أن الشحنة عند التاجر',
};

interface SendAgainActionProps {
  orderId: number;
  eligible: boolean;
  blockedReason: SendAgainBlockedReason | null;
}

function SendAgainReasonModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const mutation = useSendAgainRecordMutation();
  const trimmedReason = reason.trim();
  const isConfirmDisabled = !trimmedReason || mutation.isPending;

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;
    await mutation
      .mutateAsync({ orderId, reason: trimmedReason })
      .then(onClose)
      .catch(() => undefined);
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="إعادة الإرسال"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
      confirmDisabled={isConfirmDisabled}
      isLoading={mutation.isPending}
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          يُسجَّل السبب في سجل الطلب، ولا يتم إرسال أي شيء إلى شركة الشحن.
        </p>
        <label className="font-bold text-[#1F1F1F]">
          سبب إعادة الإرسال <span className="text-red-600">*</span>
        </label>
        <Textarea
          name="sendAgainReason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="اكتب سبب إعادة الإرسال..."
          disabled={mutation.isPending}
        />
      </div>
    </BaseModal>
  );
}

export function SendAgainAction({ orderId, eligible, blockedReason }: SendAgainActionProps) {
  const { hasPermission } = usePermissionCheck();
  const [isOpen, setIsOpen] = useState(false);

  if (!hasPermission(PERMISSION_CODES.FOLLOWUP_MANAGE)) return null;

  const blockedText = !eligible && blockedReason ? BLOCKED_REASON_TEXTS[blockedReason] : undefined;

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={blockedText !== undefined}
        onClick={() => setIsOpen(true)}
      >
        إعادة الإرسال
      </Button>
      {blockedText && <p className="text-xs text-gray-500">{blockedText}</p>}
      {isOpen && <SendAgainReasonModal orderId={orderId} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
