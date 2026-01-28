'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid, LiaTimesCircleSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title = 'فشل في تأكيد الطلب',
  message,
}: ErrorModalProps) {
  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[calc(100%-2rem)] bg-white rounded-[20px] shadow-xl flex flex-col max-h-[85vh]">
          <div
            className="h-[60px] rounded-t-[20px] flex items-center justify-center px-8 flex-shrink-0 relative"
            style={{
              background:
                'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Title className="text-xl font-bold text-black text-center">
              {title}
            </DialogPrimitive.Title>

            <DialogPrimitive.Close className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity">
              <LiaTimesSolid className="w-6 h-6 text-black cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            {title}
          </DialogPrimitive.Description>

          <div className="flex-1 px-8 py-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <LiaTimesCircleSolid className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-base text-[#1F1F1F] text-center whitespace-pre-line">{message}</p>
            </div>
          </div>

          <div className="px-8 pb-8 flex justify-center flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-[146px] h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors"
            >
              <span className="text-lg font-bold text-white">إغلاق</span>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
