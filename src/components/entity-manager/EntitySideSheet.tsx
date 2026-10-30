'use client';

import type { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ErrorWithRetry, QueueSkeleton } from './StateViews';

export interface EntitySideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  side?: 'right' | 'bottom';
  loading?: boolean;
  error?: { message: string; onRetry: () => void } | null;
  children?: ReactNode;
  footer?: ReactNode;
  onCloseAutoFocus?: (event: Event) => void;
}

export function EntitySideSheet({
  open,
  onOpenChange,
  title,
  description,
  side = 'right',
  loading = false,
  error,
  children,
  footer,
  onCloseAutoFocus,
}: EntitySideSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        onCloseAutoFocus={onCloseAutoFocus}
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md"
      >
        <SheetHeader className="gap-1 border-b p-4 pe-12 text-start">
          <SheetTitle className="break-words text-lg font-bold text-foreground-heading">
            {title}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {description}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 p-4">
          {loading && <QueueSkeleton rows={3} />}
          {!loading && error && (
            <ErrorWithRetry message={error.message} onRetry={error.onRetry} />
          )}
          {!loading && !error && children}
        </div>
        {footer && <div className="border-t p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
