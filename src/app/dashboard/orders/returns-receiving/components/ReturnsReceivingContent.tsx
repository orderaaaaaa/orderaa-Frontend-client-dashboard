'use client';

import { useCallback, useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/dashboard-layout/Breadcrumb';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { Step1Receive } from './Step1Receive';
import { Step2Categorize } from './Step2Categorize';
import { WizardFooter } from './WizardFooter';

const STEPS = [{ label: 'الاستلام' }, { label: 'التقسيم' }];

export function ReturnsReceivingContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

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
          <Step2Categorize />
        </StepContent>
      </Stepper>

      <div className="p-4 sm:p-6">
        <WizardFooter
          totalSteps={STEPS.length}
          currentStep={currentStep}
          isStep1Valid={isStep1Valid}
          onNext={next}
          onPrev={prev}
        />
      </div>
    </div>
  );
}
