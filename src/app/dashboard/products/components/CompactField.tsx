'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface CompactFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  className?: string;
  hideLabel?: boolean;
}

export function CompactField({
  label,
  error,
  className,
  hideLabel = false,
  ...inputProps
}: CompactFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <label
        htmlFor={id}
        className={cn('text-xs font-medium text-gray-600', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full min-h-10 rounded-lg border bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          error ? 'border-red-500' : 'border-gray-200',
        )}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
