'use client';

import { useState } from 'react';
import {
  LiaCheckSolid,
  LiaSpinnerSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';

interface WizardFooterProps {
  isStep1Valid: boolean;
  isSubmitting: boolean;
  scannedCount: number;
  onSubmit: () => Promise<void>;
}

export function WizardFooter({
  isStep1Valid,
  isSubmitting,
  scannedCount,
  onSubmit,
}: WizardFooterProps) {
  // Submitting receipts hits POST /orders/return-receipts.
  const canCreateReturnReceipts = useHasPermission(PERMISSION_CODES.ORDERS_RETURN_RECEIPTS_CREATE);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!canCreateReturnReceipts) {
    return null;
  }

  const handleConfirm = async () => {
    await onSubmit();
    setIsConfirmOpen(false);
  };

  return (
    <>
      <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-white border rounded-lg border-gray-200 pt-3 px-4 sm:px-6 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] flex flex-col items-center justify-center gap-1 mt-auto">
        <Button
          type="button"
          size="lg"
          onClick={() => setIsConfirmOpen(true)}
          disabled={!isStep1Valid || isSubmitting}
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          {isSubmitting ? (
            <LiaSpinnerSolid className="w-4 h-4 animate-spin" />
          ) : (
            <LiaCheckSolid className="w-4 h-4" />
          )}
          {isSubmitting ? 'جاري الإرسال...' : 'تأكيد استلام المرتجعات'}
        </Button>
        {!isStep1Valid && !isSubmitting && (
          <p className="text-xs text-gray-500 text-center">
            أكمل استلام الطلبات من الشحن وارفع صورة الإيصال أولاً
          </p>
        )}
      </div>

      <BaseModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="تأكيد استلام المرتجعات"
        onConfirm={handleConfirm}
        confirmText="تأكيد"
        confirmIcon={<LiaCheckSolid className="size-5 text-white" />}
        isLoading={isSubmitting}
        maxWidth="max-w-[480px]"
      >
        <p className="text-base text-gray-700 text-center">
          سيتم تسجيل استلام {scannedCount} طلب مرتجع. هل تريد المتابعة؟
        </p>
      </BaseModal>
    </>
  );
}
