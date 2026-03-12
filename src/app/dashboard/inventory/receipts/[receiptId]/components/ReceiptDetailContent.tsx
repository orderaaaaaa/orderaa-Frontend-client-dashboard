'use client';

import { useState, useCallback } from 'react';
import { LiaSaveSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Stepper, StepContent } from '@/components/ui/stepper';
import ReceiptHeader from './ReceiptHeader';
import AddVariantsStep from './AddVariantsStep';
import PrintStep from './PrintStep';
import ConfirmCountStep from './ConfirmCountStep';
import RejectionStep from './RejectionStep';
import { RECEIPT_STEPS, MOCK_RECEIPT_PRODUCTS } from '../constants';
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
  const [confirmedCounts, setConfirmedCounts] = useState<Record<string, number>>({});
  const [rejectedCounts, setRejectedCounts] = useState<Record<string, number>>({});

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, RECEIPT_STEPS.length - 1));
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = useCallback(() => {
    const productsWithVariants = MOCK_RECEIPT_PRODUCTS
      .filter((p) => productVariants[p.id]?.length > 0)
      .map((product) => ({
        productId: product.id,
        productName: product.name,
        variants: productVariants[product.id].map((v) => {
          const rowId = `${product.id}-${v.variantId}-${v.color}-${v.size}`;
          const confirmed = confirmedCounts[rowId] ?? 0;
          const rejected = rejectedCounts[rowId] ?? 0;
          return {
            variantId: v.variantId,
            variantName: `${v.variantName} - ${v.color} - ${v.size}`,
            color: v.color,
            size: v.size,
            confirmedQuantity: confirmed,
            rejectedQuantity: rejected,
            netQuantity: confirmed - rejected,
          };
        }),
      }));

    const totalConfirmed = Object.values(confirmedCounts).reduce((s, n) => s + n, 0);
    const totalRejected = Object.values(rejectedCounts).reduce((s, n) => s + n, 0);

    const payload = {
      invoiceNumber: receipt.invoiceNumber,
      companyName: receipt.companyName,
      products: productsWithVariants,
      totals: {
        totalConfirmed,
        totalRejected,
        netTotal: totalConfirmed - totalRejected,
      },
    };

    console.log('Receipt submission payload:', payload);
  }, [productVariants, confirmedCounts, rejectedCounts, receipt]);

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
            <ConfirmCountStep
              productVariants={productVariants}
              confirmedCounts={confirmedCounts}
              onConfirmedCountsChange={setConfirmedCounts}
            />
          </StepContent>

          <StepContent>
            <RejectionStep
              productVariants={productVariants}
              confirmedCounts={confirmedCounts}
              rejectedCounts={rejectedCounts}
              onRejectedCountsChange={setRejectedCounts}
            />
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
            {isLastStep ? (
              <Button
                variant="default"
                size="lg"
                className="rounded-full font-semibold flex items-center gap-2 px-10"
                onClick={handleSubmit}
              >
                <LiaSaveSolid className="w-5 h-5" />
                تأكيد الإيصال
              </Button>
            ) : (
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
