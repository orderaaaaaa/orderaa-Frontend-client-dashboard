'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid, LiaTrashAltSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      toast.success('تم حذف المنتج بنجاح');
      onClose();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('فشل في حذف المنتج. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 w-[827px] bg-white rounded-[20px] shadow-xl flex flex-col"
          onPointerDownOutside={(e) => {
            if (isDeleting) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isDeleting) e.preventDefault();
          }}
        >
          <div
            className="h-[60px] rounded-t-[20px] flex items-center justify-between px-8"
            style={{
              background:
                'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Title className="text-xl font-bold text-black text-center flex-1">
              حذف المنتج
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              disabled={isDeleting}
            >
              <LiaTimesSolid className="w-6 h-6 text-black cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            تأكيد حذف المنتج
          </DialogPrimitive.Description>

          <div className="flex-1 px-8 py-6 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <LiaTrashAltSolid className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <p className="text-lg font-bold text-[#1F1F1F]">
                هل أنت متأكد من حذف هذا المنتج؟
              </p>

              <p className="text-base font-normal text-[#5F5E5E]">
                {productName}
              </p>

              <p className="text-sm font-normal text-[#5F5E5E]">
                لا يمكن التراجع عن هذا الإجراء
              </p>
            </div>
          </div>

          <div className="px-8 pb-8 flex gap-4 justify-end">
            <Button
              onClick={onClose}
              disabled={isDeleting}
              className="w-[146px] h-[37px] bg-white border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg font-bold text-[#5F5E5E]">
                إلغاء
              </span>
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="w-[146px] h-[37px] bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaTrashAltSolid className="w-5 h-5 text-white" />
              <span className="text-lg font-bold text-white">
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </span>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
