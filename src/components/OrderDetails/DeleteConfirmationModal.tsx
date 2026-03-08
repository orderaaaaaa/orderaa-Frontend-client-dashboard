'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaTrashAltSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="حذف المنتج"
      onConfirm={handleConfirm}
      confirmText={isDeleting ? 'جاري الحذف...' : 'حذف'}
      confirmIcon={<LiaTrashAltSolid className="w-5 h-5 text-white" />}
      confirmButtonClassName="w-[146px] h-[37px] bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      isLoading={isDeleting}
    >
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <LiaTrashAltSolid className="w-8 h-8 text-red-600" />
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
    </BaseModal>
  );
}
