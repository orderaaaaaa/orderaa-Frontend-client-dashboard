'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Stepper, StepContent } from '@/components/ui/stepper';
import ReceiptHeader from './ReceiptHeader';
import AddVariantsStep from './AddVariantsStep';
import PrintStep from './PrintStep';
import ConfirmCountStep from './ConfirmCountStep';
import { RECEIPT_STEPS } from '../constants';
import { SelectedVariant } from '../types';

interface ReceiptDetailContentProps {
  receipt: {
    invoiceNumber: string;
    companyName: string;
  };
}

export function ReceiptDetailContent({ receipt }: ReceiptDetailContentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [productVariants, setProductVariants] = useState<Record<number, SelectedVariant[]>>({});

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, RECEIPT_STEPS.length - 1));
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === RECEIPT_STEPS.length - 1;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="sm:px-8 py-3 flex flex-col gap-6">
        <ReceiptHeader
          invoiceNumber={receipt.invoiceNumber}
          companyName={receipt.companyName}
        />

        <Stepper steps={RECEIPT_STEPS} currentStep={currentStep} onStepClick={handleStepClick}>
          <StepContent>
            <AddVariantsStep
              onNext={handleNext}
              productVariants={productVariants}
              onProductVariantsChange={setProductVariants}
            />
          </StepContent>

          <StepContent>
            <PrintStep productVariants={productVariants} />
          </StepContent>

          <StepContent>
            <ConfirmCountStep productVariants={productVariants} />
          </StepContent>

          <StepContent>
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-lg font-semibold text-gray-400">مرحلة الرفض</p>
              <p className="text-sm text-gray-400">سيتم إضافة المحتوى لاحقاً</p>
            </div>
          </StepContent>
        </Stepper>

        {currentStep > 0 && (
          <div className="flex flex-row items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full font-semibold px-12"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              السابق
            </Button>
            {!isLastStep && (
              <Button
                variant="default"
                size="lg"
                className="rounded-full font-semibold px-12"
                onClick={handleNext}
              >
                التالي
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
