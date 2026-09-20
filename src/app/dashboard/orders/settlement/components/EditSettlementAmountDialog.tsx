'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  updateSettlementBatchOrderAmount,
  type SettlementEditResponse,
} from '@/lib/api/settlement';

const AMOUNT_PATTERN = /^-?\d+(\.\d{1,2})?$/;

function amountDifference(next: string, previous: string): number | null {
  const trimmed = next.trim();
  if (!AMOUNT_PATTERN.test(trimmed)) return null;
  const before = Number(previous);
  if (!Number.isFinite(before)) return null;
  return Number(trimmed) - before;
}

function formatDifference(difference: number): string {
  return difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2);
}

interface EditSettlementAmountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  orderId: number;
  currentAmount: string;
  onSuccess: (result: SettlementEditResponse) => void;
}

export default function EditSettlementAmountDialog({
  isOpen,
  onClose,
  batchId,
  orderId,
  currentAmount,
  onSuccess,
}: EditSettlementAmountDialogProps) {
  const [value, setValue] = useState(currentAmount);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValue(currentAmount);
    setError(null);
  }, [isOpen, currentAmount]);

  const difference = amountDifference(value, currentAmount);

  const handleConfirm = async () => {
    const trimmed = value.trim();
    if (!AMOUNT_PATTERN.test(trimmed)) {
      setError('أدخل مبلغًا صحيحًا بحد أقصى رقمين عشريين');
      return;
    }
    setError(null);
    try {
      const result = await updateSettlementBatchOrderAmount(batchId, orderId, Number(trimmed));
      onSuccess(result);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر تعديل المبلغ'));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="تعديل المبلغ"
      confirmText="تأكيد"
      maxWidth="md:max-w-sm"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">المبلغ الجديد</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        {difference !== null && (
          <p className="text-xs text-muted-foreground">
            الفرق: {formatDifference(difference)} جنيه
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </BaseModal>
  );
}
