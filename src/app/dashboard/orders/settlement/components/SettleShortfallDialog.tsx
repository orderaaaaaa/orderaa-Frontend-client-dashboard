'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import type { ShortfallSettlement } from '@/lib/api/settlement';
import { getSettleFinalAmountMessage } from '@/utils/apiError';
import CopyableCode from '@/components/ui/copyable-code';
import { useSettleFinalAmountMutation } from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';

export type ShortfallSettlementRow = { [K in keyof ShortfallSettlement]: ShortfallSettlement[K] };

const FINAL_AMOUNT_PATTERN = /^-?\d{1,10}(\.\d{1,2})?$/;

interface SettleShortfallDialogProps {
  rowId: number | null;
  row: ShortfallSettlementRow | null;
  listLoaded: boolean;
  formatAmount: (value: number) => string;
  onClose: () => void;
}

export default function SettleShortfallDialog({
  rowId,
  row,
  listLoaded,
  formatAmount,
  onClose,
}: SettleShortfallDialogProps) {
  const { mutateAsync: settleAsync, isPending } = useSettleFinalAmountMutation();
  const [displayRow, setDisplayRow] = useState<ShortfallSettlementRow | null>(null);
  const [finalAmount, setFinalAmount] = useState('');
  const refusedRef = useRef(false);
  const settledRef = useRef(false);

  const shownRow = row ?? displayRow;
  const currentAmount = shownRow?.settlementAmount ?? null;
  const trimmedFinal = finalAmount.trim();
  const isFinalValid = FINAL_AMOUNT_PATTERN.test(trimmedFinal);
  const delta =
    currentAmount !== null && isFinalValid
      ? Math.round((Number(trimmedFinal) - Number(currentAmount)) * 100) / 100
      : null;

  useEffect(() => {
    if (row !== null) setDisplayRow(row);
  }, [row]);

  useEffect(() => {
    if (!isPending && row !== null) refusedRef.current = false;
  }, [isPending, row]);

  useEffect(() => {
    if (rowId === null || !listLoaded || row !== null || isPending || settledRef.current) return;
    if (!refusedRef.current) {
      toast.error('تعذر متابعة التسوية لأن الطلب لم يعد في هذه القائمة');
    }
    refusedRef.current = false;
    onClose();
  }, [rowId, listLoaded, row, isPending, onClose]);

  const handleSettle = async () => {
    refusedRef.current = false;
    if (row === null || row.settlementAmount === null) return;
    const locale = readStoredLocale();
    if (trimmedFinal === '') {
      toast.error(translate(locale, 'settlementFinal.empty'));
      return;
    }
    if (!isFinalValid) {
      toast.error(translate(locale, 'settlementFinal.formatInvalid'));
      return;
    }
    if (Math.round(Number(trimmedFinal) * 100) === Math.round(Number(row.settlementAmount) * 100)) {
      toast.error(translate(locale, 'settlementFinal.unchanged'));
      return;
    }
    try {
      const result = await settleAsync({
        orderId: row.id,
        amount: trimmedFinal,
        expectedAmount: row.settlementAmount,
      });
      toast.success(
        Number(result.settlementAmount) < 0
          ? `تمت التسوية — المتبقي ${formatAmount(Number(result.settlementAmount))} جنيه، نُقل الطلب إلى منتهي`
          : 'تمت التسوية — نُقل الطلب إلى منتهي'
      );
      settledRef.current = true;
      onClose();
    } catch (err) {
      toast.error(getSettleFinalAmountMessage(err, translate(locale, 'settlementFinal.failed')));
      refusedRef.current = true;
    }
  };

  return (
    <BaseModal
      isOpen={rowId !== null && shownRow !== null}
      onClose={onClose}
      onConfirm={handleSettle}
      title={`تسوية التحصيل ${shownRow?.code ?? ''}`}
      confirmText="تأكيد"
      confirmDisabled={row === null || row.settlementAmount === null}
      isLoading={isPending}
      maxWidth="md:max-w-md"
    >
      {shownRow && (
        <div className="space-y-3 text-sm">
          <p className="font-medium">الطلب <CopyableCode value={shownRow.code} label="نسخ كود الطلب">{shownRow.code}</CopyableCode></p>
          <p dir="rtl">
            المبلغ الحالي:{' '}
            <span dir="ltr">
              {currentAmount === null ? '—' : `${formatAmount(Number(currentAmount))} جنيه`}
            </span>
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">المبلغ النهائي</span>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              aria-label={`المبلغ النهائي للطلب ${shownRow.code}`}
              placeholder="المبلغ النهائي"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              disabled={isPending}
              className="border border-gray-200 rounded-md px-3 py-2 text-base sm:text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
            />
          </label>
          {delta !== null && (
            <p dir="rtl">
              الفرق:{' '}
              <span dir="ltr">
                {delta > 0 ? '+' : ''}
                {formatAmount(delta)}
              </span>{' '}
              جنيه
            </p>
          )}
          <p className="text-amber-700">بعد التأكيد سينتقل الطلب إلى تبويب منتهي</p>
        </div>
      )}
    </BaseModal>
  );
}
