'use client';

import React, { ReactNode, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from './button';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/utils/apiError';

export const ModalContainerContext = React.createContext<HTMLElement | null>(
  null
);

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  confirmIcon?: ReactNode;
  cancelText?: string;
  showFooter?: boolean;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  maxWidth?: string;
  height?: string;
  toastOnConfirmError?: boolean;
  confirmErrorFallback?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  footer?: ReactNode;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'حفظ',
  confirmIcon,
  cancelText = 'إلغاء',
  showFooter = true,
  confirmButtonClassName,
  cancelButtonClassName,
  isLoading: externalIsLoading = false,
  confirmDisabled = false,
  maxWidth = 'md:max-w-[827px]',
  height,
  toastOnConfirmError = false,
  confirmErrorFallback = 'حدث خطأ، حاول مرة أخرى',
  onEscapeKeyDown,
  footer,
}: BaseModalProps) {
  const { t } = useI18n();
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = externalIsLoading || internalIsLoading;
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

  const handleConfirm = async () => {
    if (onConfirm && !isLoading && !confirmDisabled) {
      try {
        setInternalIsLoading(true);
        await onConfirm();
        setInternalIsLoading(false);
      } catch (error) {
        if (toastOnConfirmError) {
          toast.error(getApiErrorMessage(error, confirmErrorFallback));
        } else {
          console.error('Confirmation action failed:', error);
        }
        setInternalIsLoading(false);
      }
    }
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={setContentEl}
          className={cn(
            'fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 duration-200',
            'flex flex-col max-h-[85vh] rounded-2xl border border-border bg-card text-card-foreground shadow-elevated',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
            'w-[95vw] sm:w-[90vw]',
            maxWidth,
            height,
            'max-sm:w-[95vw]'
          )}
          onPointerDownOutside={(e) => {
            if (isLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
            onEscapeKeyDown?.(e);
          }}
        >
          <ModalContainerContext.Provider value={contentEl}>
            <div className="flex shrink-0 items-center gap-3 rounded-t-2xl border-b border-border bg-card px-5 py-4 sm:px-6">
              <DialogPrimitive.Title className="min-w-0 flex-1 text-start text-lg font-semibold break-words text-foreground">
                {title}
              </DialogPrimitive.Title>

              <DialogPrimitive.Close
                disabled={isLoading}
                aria-label={t('common.close')}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md max-sm:size-10 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                <LiaTimesSolid className="size-4" />
              </DialogPrimitive.Close>
            </div>

            <DialogPrimitive.Description className="sr-only">
              {title}
            </DialogPrimitive.Description>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

            {footer !== undefined && (
              <div className="flex shrink-0 flex-col gap-3 rounded-b-2xl border-t border-border bg-card px-5 py-4 sm:px-6">
                {footer}
              </div>
            )}

            {footer === undefined && showFooter && (
              <div className="flex shrink-0 items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-card px-5 py-4 sm:px-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className={
                    cancelButtonClassName ||
                    'h-10 min-w-[7.5rem] gap-2 rounded-lg px-5 font-medium sm:min-w-36'
                  }
                >
                  <LiaTimesSolid className="size-4" />
                  <span>{cancelText}</span>
                </Button>

                {onConfirm && (
                  <Button
                    onClick={handleConfirm}
                    disabled={isLoading || confirmDisabled}
                    className={
                      confirmButtonClassName ||
                      'h-10 min-w-[7.5rem] gap-2 rounded-lg px-5 font-semibold shadow-soft sm:min-w-36'
                    }
                  >
                    {confirmIcon}
                    <span>{isLoading ? 'جاري الحفظ...' : confirmText}</span>
                  </Button>
                )}
              </div>
            )}
          </ModalContainerContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
