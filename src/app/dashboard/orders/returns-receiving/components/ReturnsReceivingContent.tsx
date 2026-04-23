'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Breadcrumb } from '@/components/dashboard-layout/Breadcrumb';
import { Stepper, StepContent } from '@/components/ui/stepper';
import BaseModal from '@/components/ui/base-modal';
import { Step1Receive } from './Step1Receive';
import { Step2Categorize } from './Step2Categorize';
import { WizardFooter } from './WizardFooter';
import { useUpdateReturnCategoriesMutation } from '../hooks/useReturnsMutations';
import type {
  CategorizeCommitPayload,
  CategoryBucket,
  ReturnOrder,
} from '../types';

const STEPS = [{ label: 'الاستلام' }, { label: 'التقسيم' }];

export function ReturnsReceivingContent() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const [categorizationScans, setCategorizationScans] = useState<string[]>([]);
  const [orderCache, setOrderCache] = useState<
    Record<string, ReturnOrder>
  >({});
  const [categorizedOrders, setCategorizedOrders] = useState<
    Record<string, CategoryBucket>
  >({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);

  const updateCategories = useUpdateReturnCategoriesMutation();

  const handleValidityChange = useCallback((valid: boolean) => {
    setIsStep1Valid(valid);
  }, []);

  useEffect(() => {
    if (isStep1Valid) {
      setCompletedSteps((prev) => (prev.includes(0) ? prev : [...prev, 0]));
    }
  }, [isStep1Valid]);

  const goToStep = (step: number) => {
    if (step === 0) {
      setCurrentStep(0);
    } else if (step === 1 && isStep1Valid) {
      setCurrentStep(1);
    }
  };

  const next = () => {
    if (currentStep === 0 && isStep1Valid) {
      setCurrentStep(1);
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const isStep2Valid = Object.keys(categorizedOrders).length > 0;

  const commitCategorization = useCallback(async () => {
    const entries = Object.entries(categorizedOrders);
    const payload: CategorizeCommitPayload = {
      sessionId: `session-${Date.now()}`,
      resendCodes: entries
        .filter(([, b]) => b === 'RESEND')
        .map(([c]) => c),
      finalReturnCodes: entries
        .filter(([, b]) => b === 'FINAL_RETURN')
        .map(([c]) => c),
      warehouseCodes: entries
        .filter(([, b]) => b === 'WAREHOUSE')
        .map(([c]) => c),
    };
    try {
      await updateCategories.mutateAsync(payload);
      toast.success('تم إتمام التقسيم بنجاح');
      router.replace('/dashboard/orders/allOrders');
    } catch {
      /* error toast handled by the mutation's onError */
    }
  }, [categorizedOrders, updateCategories, router]);

  const handleFinish = useCallback(() => {
    const uncategorized = categorizationScans.filter(
      (code) => !categorizedOrders[code],
    );
    if (uncategorized.length > 0) {
      setUncategorizedCount(uncategorized.length);
      setConfirmOpen(true);
      return;
    }
    void commitCategorization();
  }, [categorizationScans, categorizedOrders, commitCategorization]);

  const handleConfirmFinish = useCallback(async () => {
    await commitCategorization();
    setConfirmOpen(false);
  }, [commitCategorization]);

  const step2Props = useMemo(
    () => ({
      categorizationScans,
      setCategorizationScans,
      orderCache,
      setOrderCache,
      categorizedOrders,
      setCategorizedOrders,
    }),
    [categorizationScans, orderCache, categorizedOrders],
  );

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full min-h-full">
      <Breadcrumb
        items={[{ title: 'الطلبات' }, { title: 'استلامات المرتجعات' }]}
      />

      <Stepper
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      >
        <StepContent>
          <Step1Receive onValidityChange={handleValidityChange} />
        </StepContent>
        <StepContent>
          <Step2Categorize {...step2Props} />
        </StepContent>
      </Stepper>

      <div className="p-4 sm:p-6">
        <WizardFooter
          totalSteps={STEPS.length}
          currentStep={currentStep}
          isStep1Valid={isStep1Valid}
          canFinish={isStep2Valid}
          isFinishing={updateCategories.isPending}
          onNext={next}
          onPrev={prev}
          onFinish={handleFinish}
        />
      </div>

      <BaseModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="تأكيد إنهاء التقسيم"
        confirmText="إنهاء على أي حال"
        cancelText="إلغاء"
        onConfirm={handleConfirmFinish}
        isLoading={updateCategories.isPending}
        maxWidth="md:max-w-[480px]"
      >
        <div className="flex flex-col gap-2 text-center py-2">
          <p className="text-sm text-gray-900">
            يوجد <span className="font-bold">{uncategorizedCount}</span> طلب لم
            يتم تصنيفه بعد.
          </p>
          <p className="text-xs text-gray-500">
            هل تريد إنهاء التقسيم على أي حال؟ لن يتم تحديث حالة هذه الطلبات.
          </p>
        </div>
      </BaseModal>
    </div>
  );
}
