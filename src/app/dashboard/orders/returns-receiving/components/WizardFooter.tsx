'use client';

import {
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaCheckSolid,
  LiaSpinnerSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';

interface WizardFooterProps {
  totalSteps: number;
  currentStep: number;
  isStep1Valid: boolean;
  canFinish: boolean;
  isFinishing: boolean;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

export function WizardFooter({
  totalSteps,
  currentStep,
  isStep1Valid,
  canFinish,
  isFinishing,
  onNext,
  onPrev,
  onFinish,
}: WizardFooterProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const nextDisabled = isFirst && !isStep1Valid;
  const prevDisabled = isFirst || isFinishing;
  const finishDisabled = !canFinish || isFinishing;

  return (
    <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-white border rounded-lg border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between gap-2 mt-auto">
      <Button
        variant="outline"
        size="lg"
        onClick={onPrev}
        disabled={prevDisabled}
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
          disabled={finishDisabled}
          className="min-w-[160px]"
        >
          {isFinishing ? (
            <LiaSpinnerSolid className="w-4 h-4 animate-spin" />
          ) : (
            <LiaCheckSolid className="w-4 h-4" />
          )}
          {isFinishing ? 'جاري الإنهاء...' : 'إنهاء التقسيم'}
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
