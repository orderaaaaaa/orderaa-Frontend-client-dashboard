'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import BaseModal from '@/components/ui/base-modal';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
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
  resendSupported?: boolean;
}

type SendAgainMutation = ReturnType<typeof useSendAgainRecordMutation>;

function SendAgainReasonModal({
  orderId,
  mutation,
  onClose,
  resendSupported,
}: {
  orderId: number;
  mutation: SendAgainMutation;
  onClose: () => void;
  resendSupported: boolean | undefined;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState('');
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
        {resendSupported === false ? (
          <div className="flex flex-col items-start gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-amber-900 dark:text-amber-200"
            >
              {t('inProcess.sendAgain.resendBadge')}
            </Badge>
            <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 [&>svg]:text-current">
              <Info className="size-4" />
              <AlertDescription className="text-amber-900 dark:text-amber-200">
                {t('inProcess.sendAgain.resendNotSupported')}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <p className="text-sm text-foreground-secondary">
            يُسجَّل السبب في سجل الطلب، ولا يتم إرسال أي شيء إلى شركة الشحن.
          </p>
        )}
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

export function useSendAgainAction({ orderId, eligible, blockedReason, closure, resendSupported }: SendAgainActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mutation = useSendAgainRecordMutation();

  const isClosureBlocking = closure?.kind === 'REFUSE' || closure?.kind === 'CANCEL';
  const blockedKey: TranslationKey | undefined = isClosureBlocking
    ? 'inProcess.reason.locked'
    : !eligible && blockedReason
      ? BLOCKED_REASON_KEYS[blockedReason]
      : undefined;

  return {
    isDisabled: isClosureBlocking || !eligible,
    blockedKey,
    isPending: mutation.isPending,
    open: () => setIsOpen(true),
    modal: isOpen ? (
      <SendAgainReasonModal
        orderId={orderId}
        mutation={mutation}
        onClose={() => setIsOpen(false)}
        resendSupported={resendSupported}
      />
    ) : null,
  };
}
