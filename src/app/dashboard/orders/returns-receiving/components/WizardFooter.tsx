'use client';

import { useState } from 'react';
import {
  LiaCheckSolid,
  LiaSpinnerSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
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
      <StickyFormFooter
        status={
          !isStep1Valid && !isSubmitting ? (
            <span className="text-xs text-gray-500">
              أكمل استلام الطلبات من الشحن وارفع صورة الإيصال أولاً
            </span>
          ) : (
            ''
          )
        }
      >
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
      </StickyFormFooter>

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
