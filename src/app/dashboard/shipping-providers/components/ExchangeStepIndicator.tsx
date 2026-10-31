'use client';

import { Fragment } from 'react';
import { LiaCheckSolid } from 'react-icons/lia';
import { cn } from '@/lib/utils';

interface ExchangeStepIndicatorProps {
  labels: string[];
  currentStep: number;
}

export function ExchangeStepIndicator({ labels, currentStep }: ExchangeStepIndicatorProps) {
  return (
    <div className="flex w-full items-center justify-center">
      {labels.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        return (
          <Fragment key={label}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isActive && 'border-border bg-card text-muted-foreground',
                )}
              >
                {isCompleted ? <LiaCheckSolid className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  isActive ? 'font-bold text-primary' : isCompleted ? 'font-medium text-primary' : 'font-medium text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {index < labels.length - 1 && (
              <div className="relative mb-6 h-0.5 flex-1 bg-border">
                <div
                  className={cn(
                    'absolute inset-y-0 right-0 bg-primary transition-all duration-500',
                    isCompleted ? 'w-full' : 'w-0',
                  )}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
