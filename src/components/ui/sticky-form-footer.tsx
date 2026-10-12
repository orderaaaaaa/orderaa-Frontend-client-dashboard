'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FIXED_BOTTOM_BAR_CLASS } from '@/constants/dashboard-layout';

interface StickyFormFooterProps {
  children: ReactNode;
  isDirty?: boolean;
  isSaving?: boolean;
  status?: ReactNode;
  className?: string;
}

const statusTextOf = (isDirty: boolean, isSaving: boolean) => {
  if (isSaving) return 'جارٍ الحفظ...';
  return isDirty ? 'لديك تغييرات غير محفوظة' : 'لا توجد تغييرات';
};

export function StickyFormFooter({
  children,
  isDirty = false,
  isSaving = false,
  status,
  className,
}: StickyFormFooterProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="h-[calc(7rem_+_env(safe-area-inset-bottom))]"
      />
      <div
        data-sticky-form-footer=""
        className={cn(
          FIXED_BOTTOM_BAR_CLASS,
          'border-t border-gray-200 bg-white px-4 pt-3 shadow-lg',
          className,
        )}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div
            className={cn(
              'min-w-0 text-sm',
              isDirty && !isSaving ? 'text-amber-700' : 'text-gray-500',
            )}
            aria-live="polite"
          >
            {status ?? statusTextOf(isDirty, isSaving)}
          </div>
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
