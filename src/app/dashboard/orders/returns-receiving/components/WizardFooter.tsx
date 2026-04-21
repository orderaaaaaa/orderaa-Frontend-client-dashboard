'use client';

import {
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaCheckSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';

interface WizardFooterProps {
  totalSteps: number;
  currentStep: number;
  isStep1Valid: boolean;
  onNext: () => void;
  onPrev: () => void;
  onFinish?: () => void;
}

export function WizardFooter({
  totalSteps,
  currentStep,
  isStep1Valid,
  onNext,
  onPrev,
  onFinish,
}: WizardFooterProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const nextDisabled = isFirst && !isStep1Valid;

  return (
    <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-white border rounded-lg border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between gap-2 mt-auto">
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
  );
}
