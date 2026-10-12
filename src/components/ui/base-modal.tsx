'use client';

import React, { ReactNode, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from './button';
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
}: BaseModalProps) {
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
          toast.error(getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'));
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
            'fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2',
            'bg-white rounded-[20px] shadow-xl flex flex-col max-h-[85vh]',
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
          }}
        >
          <ModalContainerContext.Provider value={contentEl}>
            <div
              className="min-h-[60px] py-3 ps-15 pe-15 rounded-t-[20px] flex items-center justify-center flex-shrink-0 relative"
              style={{
                background:
                  'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
              }}
            >
              <DialogPrimitive.Title className="text-xl font-bold text-black text-center break-words min-w-0">
                {title}
              </DialogPrimitive.Title>

              <DialogPrimitive.Close
                disabled={isLoading}
                aria-label="إغلاق"
                className="absolute end-5 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center hover:opacity-70 transition-opacity disabled:opacity-50"
              >
                <LiaTimesSolid className="w-4 h-4 text-black cursor-pointer" />
              </DialogPrimitive.Close>
            </div>

            <DialogPrimitive.Description className="sr-only">
              {title}
            </DialogPrimitive.Description>

            <div className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">{children}</div>

          {showFooter && (
            <div className="px-4 sm:px-8 pb-4 flex gap-2 sm:gap-4 justify-between flex-shrink-0 pt-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className={
                  cancelButtonClassName ||
                  'w-[120px] h-10 sm:w-[146px] sm:h-[37px] bg-white border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50'
                }
              >
                <LiaTimesSolid className="w-4 h-4 sm:w-5 sm:h-5 text-[#5F5E5E]" />
                <span className="text-sm sm:text-lg font-bold text-[#5F5E5E]">
                  {cancelText}
                </span>
              </Button>

              {onConfirm && (
                <Button
                  variant="outline"
                  onClick={handleConfirm}
                  disabled={isLoading || confirmDisabled}
                  className={
                    confirmButtonClassName ||
                    'w-[120px] h-10 sm:w-[146px] sm:h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  }
                >
                  {confirmIcon}
                  <span className="text-sm sm:text-lg font-bold text-white">
                    {isLoading ? 'جاري الحفظ...' : confirmText}
                  </span>
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
