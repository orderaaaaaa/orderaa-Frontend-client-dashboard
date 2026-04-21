'use client';

import { useState } from 'react';
import {
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaCheckSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';

interface WizardFooterProps {
  totalSteps: number;
  currentStep: number;
  isStep1Valid: boolean;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onFinish?: () => void;
}

export function WizardFooter({
  totalSteps,
  currentStep,
  isStep1Valid,
  onNext,
  onPrev,
  onReset,
  onFinish,
}: WizardFooterProps) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const nextDisabled = isFirst && !isStep1Valid;

  return (
    <>
      <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-white border-t border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between gap-3 mt-auto">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setConfirmResetOpen(true)}
          className="text-gray-600"
        >
          إلغاء الجلسة
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onPrev}
            disabled={isFirst}
            className="min-w-[110px]"
          >
            <LiaAngleRightSolid className="w-4 h-4" />
            رجوع
          </Button>

          {isLast ? (
            <Button
              type="button"
              size="lg"
              onClick={onFinish}
              className="min-w-[160px]"
              disabled
            >
              <LiaCheckSolid className="w-4 h-4" />
              إنهاء التقسيم
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={onNext}
              disabled={nextDisabled}
              className="min-w-[110px]"
            >
              التالي
              <LiaAngleLeftSolid className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <BaseModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="إلغاء الجلسة"
        confirmText="تأكيد الإلغاء"
        cancelText="تراجع"
        onConfirm={() => {
          onReset();
          setConfirmResetOpen(false);
        }}
        maxWidth="md:max-w-[480px]"
      >
        <p className="text-sm text-gray-700 text-center py-4">
          هل أنت متأكد من إلغاء جلسة الاستلام الحالية؟ سيتم حذف جميع الأكواد
          الممسوحة.
        </p>
      </BaseModal>
    </>
  );
}
