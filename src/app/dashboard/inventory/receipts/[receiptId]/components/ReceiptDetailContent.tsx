'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LiaSaveSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Stepper, StepContent } from '@/components/ui/stepper';
import PageLoading from '@/components/ui/page-loading';
import { useReceiptStore } from '@/store/receiptStore';
import { useShallow } from 'zustand/react/shallow';
import {
  useSupplierInvoiceByIdQuery,
  useApproveSupplierInvoiceMutation,
} from '@/services/suppliers';
import ReceiptHeader from './ReceiptHeader';
import AddVariantsStep, { InvoiceProductRow } from './AddVariantsStep';
import PrintStep from './PrintStep';
import ConfirmCountStep from './ConfirmCountStep';
import RejectionStep from './RejectionStep';
import { RECEIPT_STEPS } from '../constants';
import { SelectedVariant } from '../types';
import type { ApproveSupplierInvoiceVariantDto } from '@/lib/api/suppliers';

const SINGLE_STEP_MODE = true;

interface ReceiptDetailContentProps {
  receiptId: string;
}

export function ReceiptDetailContent({ receiptId }: ReceiptDetailContentProps) {
  const router = useRouter();
  const numericId = Number(receiptId);
  const isValidId = Number.isFinite(numericId);

  const { data: apiReceipt, isLoading, isError } = useSupplierInvoiceByIdQuery(
    isValidId ? numericId : undefined,
  );

  const {
    currentStep,
    completedSteps,
    productVariants,
    confirmedCounts,
    rejectedCounts,
  } = useReceiptStore(useShallow((s) => s.getReceiptState(receiptId)));

  const setCurrentStep = useReceiptStore((s) => s.setCurrentStep);
  const setProductVariants = useReceiptStore((s) => s.setProductVariants);
  const setConfirmedCounts = useReceiptStore((s) => s.setConfirmedCounts);
  const setRejectedCounts = useReceiptStore((s) => s.setRejectedCounts);
  const clearReceipt = useReceiptStore((s) => s.clearReceipt);
  const markStepCompleted = useReceiptStore((s) => s.markStepCompleted);

  const approveMutation = useApproveSupplierInvoiceMutation();

  const invoiceProducts: InvoiceProductRow[] = useMemo(
    () =>
      (apiReceipt?.products ?? []).map((p) => ({
        id: p.id,
        productId: p.productId,
        name: p.product.name,
        quantity: p.quantity,
      })),
    [apiReceipt],
  );

  const seededRef = useRef<string | null>(null);

  useEffect(() => {
    if (!apiReceipt) return;
    if (seededRef.current === receiptId) return;
    seededRef.current = receiptId;

    const seed: Record<number, SelectedVariant[]> = {};
    for (const p of apiReceipt.products) {
      const ids = p.attributeOptionIds ?? p.variant?.attributeOptions?.map((o) => o.id) ?? [];
      if (ids.length === 0) continue;
      seed[p.id] = [
        {
          attributeOptionIds: ids,
          attributeLabels: p.variant?.attributeOptions?.map((o) => o.name) ?? [],
          quantity: 0,
          variantId: p.variantId ?? undefined,
          variantName: p.variant?.name,
        },
      ];
    }

    if (Object.keys(seed).length === 0) return;
    if (Object.keys(productVariants).length > 0) return;
    setProductVariants(receiptId, seed);
  }, [apiReceipt, receiptId, productVariants, setProductVariants]);

  const handleNext = useCallback(() => {
    markStepCompleted(receiptId, currentStep);
    setCurrentStep(receiptId, Math.min(currentStep + 1, RECEIPT_STEPS.length - 1));
  }, [receiptId, currentStep, setCurrentStep, markStepCompleted]);

  const handlePrevious = useCallback(() => {
    markStepCompleted(receiptId, currentStep);
    setCurrentStep(receiptId, Math.max(currentStep - 1, 0));
  }, [receiptId, currentStep, setCurrentStep, markStepCompleted]);

  const handleStepClick = useCallback((step: number) => {
    markStepCompleted(receiptId, currentStep);
    setCurrentStep(receiptId, step);
  }, [receiptId, currentStep, setCurrentStep, markStepCompleted]);

  const handleProductVariantsChange = useCallback(
    (variants: Record<number, SelectedVariant[]>) => {
      setProductVariants(receiptId, variants);
    },
    [receiptId, setProductVariants],
  );

  const handleConfirmedCountsChange = useCallback(
    (counts: Record<string, number>) => {
      setConfirmedCounts(receiptId, counts);
    },
    [receiptId, setConfirmedCounts],
  );

  const handleRejectedCountsChange = useCallback(
    (counts: Record<string, number>) => {
      setRejectedCounts(receiptId, counts);
    },
    [receiptId, setRejectedCounts],
  );

  const handleSubmit = useCallback(async () => {
    if (!apiReceipt) return;

    const productsPayload = invoiceProducts
      .map((p) => ({
        invoiceProductId: p.id,
        variants: (productVariants[p.id] ?? [])
          .filter((v) => v.quantity > 0)
          .map((v) => {
            const variant: ApproveSupplierInvoiceVariantDto = {
              approvedCount: v.quantity,
              rejectedCount: 0,
            };
            if (v.attributeOptionIds.length > 0) {
              variant.attributeOptionIds = v.attributeOptionIds;
            }
            return variant;
          }),
      }))
      .filter((p) => p.variants.length > 0);

    if (productsPayload.length === 0) {
      toast.error('يرجى إدخال الكمية المستلمة لمنتج واحد على الأقل');
      return;
    }

    try {
      await approveMutation.mutateAsync({
        id: apiReceipt.id,
        body: { products: productsPayload },
      });
      toast.success('تم تأكيد الإيصال بنجاح');
      clearReceipt(receiptId);
      router.push('/dashboard/inventory/receipts');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل تأكيد الإيصال، حاول مرة أخرى');
    }
  }, [apiReceipt, invoiceProducts, productVariants, approveMutation, clearReceipt, receiptId, router]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === RECEIPT_STEPS.length - 1;

  if (!isValidId) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <PageLoading message="جاري تحميل تفاصيل الاستلام..." />
      </div>
    );
  }

  if (isError || !apiReceipt) {
    notFound();
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="sm:px-8 py-3 flex flex-col gap-6">
        <ReceiptHeader
          invoiceNumber={apiReceipt.code}
          companyName={apiReceipt.supplier.name}
        />

        <Stepper
          steps={SINGLE_STEP_MODE ? RECEIPT_STEPS.slice(0, 1) : RECEIPT_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={SINGLE_STEP_MODE ? undefined : handleStepClick}
        >
          <StepContent>
            <AddVariantsStep
              products={invoiceProducts}
              onNext={SINGLE_STEP_MODE ? handleSubmit : handleNext}
              nextLabel={SINGLE_STEP_MODE ? 'تأكيد الإيصال' : undefined}
              nextIcon={SINGLE_STEP_MODE ? LiaSaveSolid : undefined}
              nextDisabled={SINGLE_STEP_MODE && approveMutation.isPending}
              productVariants={productVariants}
              onProductVariantsChange={handleProductVariantsChange}
            />
          </StepContent>

          {!SINGLE_STEP_MODE && (
            <StepContent>
              <PrintStep receiptId={receiptId} productVariants={productVariants} />
            </StepContent>
          )}

          {!SINGLE_STEP_MODE && (
            <StepContent>
              <ConfirmCountStep
                productVariants={productVariants}
                confirmedCounts={confirmedCounts}
                onConfirmedCountsChange={handleConfirmedCountsChange}
              />
            </StepContent>
          )}

          {!SINGLE_STEP_MODE && (
            <StepContent>
              <RejectionStep
                productVariants={productVariants}
                confirmedCounts={confirmedCounts}
                rejectedCounts={rejectedCounts}
                onRejectedCountsChange={handleRejectedCountsChange}
              />
            </StepContent>
          )}
        </Stepper>

        {!SINGLE_STEP_MODE && currentStep > 0 && (
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
