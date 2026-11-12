'use client';

import React, { ReactNode, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from './button';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';
import { OverlayLayerContext } from './overlay-layer';
import { getApiErrorMessage } from '@/utils/apiError';
import { useVisualViewportHeight } from '@/hooks/useVisualViewportHeight';

export const ModalContainerContext = React.createContext<HTMLElement | null>(
  null
);

const isToastTarget = (target: EventTarget | null) =>
  target instanceof Element && target.closest('.Toastify, .Toastify__toast') !== null;

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
  headerContent?: ReactNode;
  subheader?: ReactNode;
  mobileFullScreen?: boolean;
  bodyClassName?: string;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
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
  headerContent,
  subheader,
  mobileFullScreen = false,
  bodyClassName,
  onOpenAutoFocus,
  onCloseAutoFocus,
}: BaseModalProps) {
  const { t } = useI18n();
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = externalIsLoading || internalIsLoading;
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  useVisualViewportHeight(mobileFullScreen ? contentEl : null);

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
        <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-modal) bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={setContentEl}
          className={cn(
            'fixed top-[50%] left-[50%] z-(--z-modal) -translate-x-1/2 -translate-y-1/2 duration-200',
            'flex flex-col max-h-[85vh] rounded-2xl border border-border bg-card text-card-foreground shadow-elevated',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
            'w-[95vw] sm:w-[90vw]',
            maxWidth,
            height,
            'max-sm:w-[95vw]',
            mobileFullScreen &&
              'max-sm:inset-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:max-h-none max-sm:h-[var(--vvh,100dvh)] max-sm:top-[var(--vv-offset,0px)] max-sm:rounded-none max-sm:border-0 max-sm:data-[state=open]:zoom-in-100'
          )}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          onPointerDownOutside={(e) => {
            if (isLoading || isToastTarget(e.target)) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isToastTarget(e.target)) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
            onEscapeKeyDown?.(e);
          }}
        >
          <OverlayLayerContext.Provider value={true}>
            <ModalContainerContext.Provider value={contentEl}>
              <div
                className={cn(
                  'flex shrink-0 items-center gap-3 rounded-t-2xl border-b border-border bg-card px-5 py-4 sm:px-6',
                  mobileFullScreen && 'max-sm:rounded-none'
                )}
              >
                {headerContent ? (
                  <>
                    <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                    <div className="min-w-0 flex-1">{headerContent}</div>
                  </>
                ) : (
                  <DialogPrimitive.Title className="min-w-0 flex-1 text-start text-lg font-semibold break-words text-foreground">
                    {title}
                  </DialogPrimitive.Title>
                )}

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

              {subheader !== undefined && (
                <div className="shrink-0 border-b border-border bg-card px-5 pb-3 sm:px-6">{subheader}</div>
              )}

              <div
                className={
                  bodyClassName
                    ? cn('min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6', bodyClassName)
                    : 'min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6'
                }
              >
                {children}
              </div>

              {footer !== undefined && (
                <div
                  className={cn(
                    'flex shrink-0 flex-col gap-3 rounded-b-2xl border-t border-border bg-card px-5 py-4 sm:px-6',
                    mobileFullScreen && 'max-sm:rounded-none'
                  )}
                >
                  {footer}
                </div>
              )}

              {footer === undefined && showFooter && (
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-card px-5 py-4 sm:px-6',
                    mobileFullScreen && 'max-sm:rounded-none'
                  )}
                >
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
          </OverlayLayerContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
