'use client';

import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { getApiErrorMessage, getApiErrorStatus } from '@/utils/apiError';
import {
  useDeleteSettlementBatchMutation,
  useSettlementSync,
} from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';

interface DeleteSettlementBatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  batchCode: string;
  onSuccess: () => void | Promise<void>;
}

export default function DeleteSettlementBatchDialog({
  isOpen,
  onClose,
  batchId,
  batchCode,
  onSuccess,
}: DeleteSettlementBatchDialogProps) {
  const deleteBatch = useDeleteSettlementBatchMutation();
  const syncSettlement = useSettlementSync();

  const handleConfirm = async () => {
    try {
      await deleteBatch.mutateAsync(batchId);
      await onSuccess();
      onClose();
      toast.success('تم حذف التحصيل');
    } catch (err) {
      const status = getApiErrorStatus(err);
      if (status === 404 || status === 409) {
        await syncSettlement();
      }
      toast.error(getApiErrorMessage(err, 'تعذر حذف التحصيل'));
      if (status === 404) {
        await onSuccess();
        onClose();
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="حذف التحصيل"
      confirmText="حذف"
      confirmButtonClassName="bg-red-600 hover:bg-red-700"
      maxWidth="md:max-w-md"
    >
      <p className="text-sm text-gray-700">
        سيُحذف التحصيل{' '}
        <span className="font-mono font-semibold">{batchCode}</span> نهائيًا.
        لا تتغير أي طلبات، ويمكن أن يُعاد استخدام الكود للتحصيل التالي في نفس اليوم.
      </p>
    </BaseModal>
  );
}
