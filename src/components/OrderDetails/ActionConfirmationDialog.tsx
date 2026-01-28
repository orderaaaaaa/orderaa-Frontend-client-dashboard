'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid, LiaCheckCircle } from 'react-icons/lia';
import { Button } from '../ui/button';

interface ActionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ActionConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
}: ActionConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsLoading(false);
        onClose();
      }, 600);
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setIsLoading(false);
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
          className={`fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] md:w-[500px] max-w-[500px] bg-white rounded-[20px] shadow-xl transition-all duration-300 ${showSuccess ? 'scale-95 opacity-90' : 'scale-100 opacity-100'}`}
          onPointerDownOutside={(e) => {
            if (isLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
          }}
        >
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-[20px] z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <LiaCheckCircle
                    className="w-24 h-24 text-green-500 animate-[bounce_0.6s_ease-in-out]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-600 animate-pulse">تم التأكيد</p>
              </div>
            </div>
          )}

          <div
            className="h-[60px] rounded-t-[20px] flex items-center justify-center px-8"
            style={{
              background:
                'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Title className="text-xl font-bold text-black text-center">
              {title}
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              disabled={isLoading}
            >
              <LiaTimesSolid className="w-6 h-6 text-black" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            {message}
          </DialogPrimitive.Description>

          <div className="px-8 py-6">
            <p className="text-base text-[#1F1F1F] text-center mb-6">
              {message}
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-8 py-2 border-2 border-primary text-primary rounded-[28px] font-bold hover:bg-purple-50 transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                className="px-8 py-2 bg-primary rounded-[28px] font-bold text-white hover:bg-[#4B1BC4] transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <LiaCheckCircle className="w-5 h-5 ml-2" />
                {isLoading ? 'جاري التأكيد...' : confirmText}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
