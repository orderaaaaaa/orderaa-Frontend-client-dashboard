'use client';

import React from 'react';
import { LiaTrashAltSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  storeName: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  storeName,
  isLoading = false,
}: DeleteConfirmationModalProps) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="حذف المتجر"
      onConfirm={onConfirm}
      confirmText="حذف"
      confirmIcon={<LiaTrashAltSolid className="w-4 h-4" />}
      confirmButtonClassName="w-[120px] h-[33px] sm:w-[146px] sm:h-[37px] bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-red-700 transition-colors text-white hover:text-white disabled:opacity-50"
      cancelText="إلغاء"
      isLoading={isLoading}
      maxWidth="md:max-w-md"
    >
      <div className="text-center py-4 space-y-3">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <LiaTrashAltSolid className="w-7 h-7 text-red-600" />
          </div>
        </div>
        <p className="text-gray-900 font-medium text-lg">
          هل أنت متأكد من حذف &quot;{storeName}&quot;؟
        </p>
        <p className="text-gray-500 text-sm">
          سيتم حذف المتجر وجميع إعدادات الربط المرتبطة به. لا يمكن التراجع عن هذا الإجراء.
        </p>
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmationModal;
