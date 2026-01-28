'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid, LiaExclamationTriangleSolid } from 'react-icons/lia';
import { OrderLockedBy } from '@/types/orders';

interface OrderLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedBy: OrderLockedBy;
}

export function OrderLockedModal({
  isOpen,
  onClose,
  lockedBy,
}: OrderLockedModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-[20px] shadow-xl flex flex-col"
        >
          <div
            className="h-[60px] rounded-t-[20px] flex items-center justify-center px-8 flex-shrink-0 relative"
            style={{
              background:
                'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Title className="text-xl font-bold text-black text-center">
              رؤية المنتج
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              className="absolute left-8 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <LiaTimesSolid className="w-4 h-4 text-black cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            الطلب مفتوح من قبل مستخدم آخر
          </DialogPrimitive.Description>

          <div className="flex-1 px-8 py-12 flex flex-col items-center justify-center gap-6">
            <LiaExclamationTriangleSolid className="w-24 h-24 text-primary" />

            <h3 className="text-xl font-bold text-black">
              لا يمكن مشاهده هذا الطلب
            </h3>

            <p className="text-gray-600 text-center">
              الطلب مفتوح من قبل {lockedBy.name} في قسم {lockedBy.department}
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
