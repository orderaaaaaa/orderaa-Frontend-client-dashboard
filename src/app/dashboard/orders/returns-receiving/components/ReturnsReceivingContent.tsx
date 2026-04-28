'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Breadcrumb } from '@/components/dashboard-layout/Breadcrumb';
import { Stepper, StepContent } from '@/components/ui/stepper';
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

  const isStep2Valid = categorizationScans.length > 0;

  const handleFinish = useCallback(async () => {
    const grouped = categorizationScans.reduce<
      Record<CategoryBucket, string[]>
    >(
      (acc, code) => {
        const bucket = orderCache[code]?.bucket;
        if (bucket) acc[bucket].push(code);
        return acc;
      },
      { RESEND: [], FINAL_RETURN: [], WAREHOUSE: [] },
    );
    const payload: CategorizeCommitPayload = {
      sessionId: `session-${Date.now()}`,
      resendCodes: grouped.RESEND,
      finalReturnCodes: grouped.FINAL_RETURN,
      warehouseCodes: grouped.WAREHOUSE,
    };
    try {
      await updateCategories.mutateAsync(payload);
      toast.success('تم إتمام التقسيم بنجاح');
      router.replace('/dashboard/orders/allOrders');
    } catch {
      /* error toast handled by the mutation's onError */
    }
  }, [categorizationScans, orderCache, updateCategories, router]);

  const step2Props = useMemo(
    () => ({
      categorizationScans,
      setCategorizationScans,
      orderCache,
      setOrderCache,
    }),
    [categorizationScans, orderCache],
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
    </div>
  );
}
