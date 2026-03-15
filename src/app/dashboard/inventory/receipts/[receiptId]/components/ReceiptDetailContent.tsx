'use client';

import { useCallback } from 'react';
import { LiaSaveSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { useReceiptStore } from '@/store/receiptStore';
import ReceiptHeader from './ReceiptHeader';
import AddVariantsStep from './AddVariantsStep';
import PrintStep from './PrintStep';
import ConfirmCountStep from './ConfirmCountStep';
import RejectionStep from './RejectionStep';
import { RECEIPT_STEPS, MOCK_RECEIPT_PRODUCTS } from '../constants';

interface ReceiptDetailContentProps {
  receiptId: string;
  receipt: {
    invoiceNumber: string;
    companyName: string;
  };
}

export function ReceiptDetailContent({ receiptId, receipt }: ReceiptDetailContentProps) {
  const {
    currentStep,
    productVariants,
    confirmedCounts,
    rejectedCounts,
  } = useReceiptStore((s) => s.getReceiptState(receiptId));

  const setCurrentStep = useReceiptStore((s) => s.setCurrentStep);
  const setProductVariants = useReceiptStore((s) => s.setProductVariants);
  const setConfirmedCounts = useReceiptStore((s) => s.setConfirmedCounts);
  const setRejectedCounts = useReceiptStore((s) => s.setRejectedCounts);
  const clearReceipt = useReceiptStore((s) => s.clearReceipt);

  const handleNext = useCallback(() => {
    setCurrentStep(receiptId, Math.min(currentStep + 1, RECEIPT_STEPS.length - 1));
  }, [receiptId, currentStep, setCurrentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(receiptId, Math.max(currentStep - 1, 0));
  }, [receiptId, currentStep, setCurrentStep]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(receiptId, step);
  }, [receiptId, setCurrentStep]);

  const handleProductVariantsChange = useCallback(
    (variants: Record<number, import('../types').SelectedVariant[]>) => {
      setProductVariants(receiptId, variants);
    },
    [receiptId, setProductVariants]
  );

  const handleConfirmedCountsChange = useCallback(
    (counts: Record<string, number>) => {
      setConfirmedCounts(receiptId, counts);
    },
    [receiptId, setConfirmedCounts]
  );

  const handleRejectedCountsChange = useCallback(
    (counts: Record<string, number>) => {
      setRejectedCounts(receiptId, counts);
    },
    [receiptId, setRejectedCounts]
  );

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
    clearReceipt(receiptId);
  }, [productVariants, confirmedCounts, rejectedCounts, receipt, receiptId, clearReceipt]);

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
              onProductVariantsChange={handleProductVariantsChange}
            />
          </StepContent>

          <StepContent>
            <PrintStep receiptId={receiptId} productVariants={productVariants} />
          </StepContent>

          <StepContent>
            <ConfirmCountStep
              productVariants={productVariants}
              confirmedCounts={confirmedCounts}
              onConfirmedCountsChange={handleConfirmedCountsChange}
            />
          </StepContent>

          <StepContent>
            <RejectionStep
              productVariants={productVariants}
              confirmedCounts={confirmedCounts}
              rejectedCounts={rejectedCounts}
              onRejectedCountsChange={handleRejectedCountsChange}
            />
          </StepContent>
        </Stepper>

        {currentStep > 0 && (
          <div className="flex flex-row items-center justify-between gap-2">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full font-semibold px-6 sm:px-12"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              السابق
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              {(currentStep === 2 || isLastStep) && (
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full font-semibold flex items-center gap-1 sm:gap-2 px-4 sm:px-10 text-xs sm:text-sm"
                  onClick={handleSubmit}
                >
                  <LiaSaveSolid className="w-4 h-4 sm:w-5 sm:h-5" />
                  تأكيد الإيصال
                </Button>
              )}
              {!isLastStep && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full font-semibold px-6 sm:px-12"
                  onClick={handleNext}
                >
                  التالي
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
