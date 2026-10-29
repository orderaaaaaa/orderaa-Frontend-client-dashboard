'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useSendAgainRecordMutation } from '@/services/shippingProviders';
import type { FollowupClosure } from '@/types/logistics';
import type { SendAgainBlockedReason } from '@/types/shippingProviders';

const BLOCKED_REASON_KEYS: Record<SendAgainBlockedReason, TranslationKey> = {
  NOT_TURBO: 'inProcess.reason.sendAgainTurbo',
  NOT_RETURNED_DELIVERED: 'inProcess.reason.sendAgainNotReturnedDelivered',
  NO_ACTIVE_CODE: 'inProcess.reason.sendAgainNoActiveCode',
  NO_CARRIER_STATUS: 'inProcess.reason.sendAgainNoStatus',
  RETURNED_TO_MERCHANT: 'inProcess.reason.sendAgainReturnedToMerchant',
};

interface SendAgainActionProps {
  orderId: number;
  eligible: boolean;
  blockedReason: SendAgainBlockedReason | null;
  closure: FollowupClosure | null;
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
        <label htmlFor="sendAgainReason" className="font-bold text-foreground">
          سبب إعادة الإرسال <span className="text-destructive">*</span>
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

export function SendAgainAction({
  orderId,
  eligible,
  blockedReason,
  closure,
}: SendAgainActionProps) {
  const { t } = useI18n();
  const { hasPermission } = usePermissionCheck();
  const [isOpen, setIsOpen] = useState(false);

  if (!hasPermission(PERMISSION_CODES.FOLLOWUP_MANAGE)) return null;

  const isClosureBlocking = closure?.kind === 'REFUSE' || closure?.kind === 'CANCEL';
  const blockedKey: TranslationKey | undefined = isClosureBlocking
    ? 'inProcess.reason.locked'
    : !eligible && blockedReason
      ? BLOCKED_REASON_KEYS[blockedReason]
      : undefined;

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={isClosureBlocking || !eligible}
        onClick={() => setIsOpen(true)}
      >
        إعادة الإرسال
      </Button>
      {blockedKey && <p className="text-xs text-muted-foreground">{t(blockedKey)}</p>}
      {isOpen && <SendAgainReasonModal orderId={orderId} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
