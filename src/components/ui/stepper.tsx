'use client';

import React, { Children, ReactNode } from 'react';
import { LiaCheckSolid } from 'react-icons/lia';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void;
  children: ReactNode;
  className?: string;
}

function Stepper({ steps, currentStep, completedSteps, onStepClick, children, className }: StepperProps) {
  const childArray = Children.toArray(children);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-center gap-0 w-full">
        {steps.map((step, index) => {
          const isCompleted = completedSteps
            ? completedSteps.includes(index)
            : index < currentStep;
          const isActive = index === currentStep;
          const isClickable = !!onStepClick;

          return (
            <React.Fragment key={index}>
              <div
                className={cn('flex flex-col items-center gap-2', isClickable && 'cursor-pointer')}
                onClick={isClickable ? () => onStepClick(index) : undefined}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                    isCompleted
                      ? 'border-primary bg-primary text-white'
                      : isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <LiaCheckSolid className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap transition-colors duration-300',
                    isCompleted
                      ? 'text-primary'
                      : isActive
                        ? 'text-primary font-bold'
                        : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="relative mb-6 h-0.5 flex-1 bg-gray-200">
                  <div
                    className={cn(
                      'absolute inset-y-0 right-0 bg-primary transition-all duration-500',
                      isCompleted ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div>{childArray[currentStep]}</div>
    </div>
  );
}

function StepContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      {children}
    </div>
  );
}

export { Stepper, StepContent };
export type { Step, StepperProps };
