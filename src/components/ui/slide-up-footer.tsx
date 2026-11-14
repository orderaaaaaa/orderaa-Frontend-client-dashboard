'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { FIXED_BOTTOM_BAR_CLASS } from '@/constants/dashboard-layout';
import { cn } from '@/lib/utils';

interface SlideUpFooterProps {
  visible: boolean;
  inShell?: boolean;
  status?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const FULL_SCREEN_BAR_CLASS =
  'fixed inset-x-0 bottom-0 z-(--z-page-fixed) pb-[calc(1rem_+_env(safe-area-inset-bottom))]';

export function SlideUpFooter({
  visible,
  inShell = true,
  status,
  children,
  className,
}: SlideUpFooterProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) barRef.current.inert = !visible;
  }, [visible]);

  return (
    <>
      {visible && (
        <div
          aria-hidden="true"
          className="h-[calc(7rem_+_env(safe-area-inset-bottom))]"
        />
      )}
      <div
        ref={barRef}
        aria-hidden={!visible}
        className={cn(
          inShell ? FIXED_BOTTOM_BAR_CLASS : FULL_SCREEN_BAR_CLASS,
          'border-t border-gray-200 bg-card px-4 pt-3 shadow-lg',
          'transition-[transform,opacity,right] duration-300 motion-reduce:transition-none',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
          className,
        )}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="min-w-0 text-sm text-gray-500" aria-live="polite">
            {status}
          </div>
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
