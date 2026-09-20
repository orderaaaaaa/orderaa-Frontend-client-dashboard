'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  SETTLEMENT_REMOVAL_MODES,
  SETTLEMENT_REMOVAL_MODE_LABELS,
  removeSettlementBatchOrder,
  type SettlementRemovalMode,
  type SettlementEditResponse,
} from '@/lib/api/settlement';

const SETTLED_STATUSES = new Set(['COLLECTED', 'RETURNED_SETTLED', 'RETURNED_FINAL']);

function removalModeDisabledHint(mode: SettlementRemovalMode, status: string): string | null {
  switch (mode) {
    case 'CLEAR':
    case 'DETACH':
      return SETTLED_STATUSES.has(status) ? 'غير متاح لطلب تم تحصيله' : null;
    case 'REVERT':
      return SETTLED_STATUSES.has(status) ? null : 'لا يمكن إرجاع هذه الحالة';
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

interface RemoveSettlementOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  orderId: number;
  orderStatus: string;
  onSuccess: (result: SettlementEditResponse) => void;
}

export default function RemoveSettlementOrderDialog({
  isOpen,
  onClose,
  batchId,
  orderId,
  orderStatus,
  onSuccess,
}: RemoveSettlementOrderDialogProps) {
  const [mode, setMode] = useState<SettlementRemovalMode>('REVERT');

  useEffect(() => {
    if (!isOpen) return;
    const firstEnabled = SETTLEMENT_REMOVAL_MODES.find(
      (candidate) => !removalModeDisabledHint(candidate, orderStatus),
    );
    setMode(firstEnabled ?? SETTLEMENT_REMOVAL_MODES[0]);
  }, [isOpen, orderStatus]);

  const handleConfirm = async () => {
    try {
      const result = await removeSettlementBatchOrder(batchId, orderId, mode);
      onSuccess(result);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إزالة الطلب من التحصيل'));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="إزالة من التحصيل"
      confirmText="تأكيد"
      confirmDisabled={!!removalModeDisabledHint(mode, orderStatus)}
      maxWidth="md:max-w-md"
    >
      <div className="space-y-3">
        {SETTLEMENT_REMOVAL_MODES.map((candidate) => {
          const hint = removalModeDisabledHint(candidate, orderStatus);
          return (
            <label
              key={candidate}
              className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                hint ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name="removal-mode"
                value={candidate}
                checked={mode === candidate}
                disabled={!!hint}
                onChange={() => setMode(candidate)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-gray-900">
                  {SETTLEMENT_REMOVAL_MODE_LABELS[candidate]}
                </span>
                {hint && <span className="block text-xs text-amber-600">{hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </BaseModal>
  );
}
