'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalStickyFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalStickyFooter({ children, className }: ModalStickyFooterProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-(--z-inpage-sticky) -mx-5 -mb-5 mt-2 border-t border-border bg-card px-5 py-3 sm:-mx-6 sm:px-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
