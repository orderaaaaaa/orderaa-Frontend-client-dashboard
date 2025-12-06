'use client';

import React from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCheckCircle } from 'react-icons/lia';

interface SimpleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function SimpleConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
}: SimpleConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={handleConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      maxWidth="w-[500px]"
    >
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-16 h-16 rounded-full bg-[#F6F2FC] flex items-center justify-center mb-4">
          <LiaCheckCircle className="w-10 h-10 text-[#5D24E1]" />
        </div>
        <p className="text-base text-[#1F1F1F] text-center">
          {message}
        </p>
      </div>
    </BaseModal>
  );
}

