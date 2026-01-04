'use client';

import React from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCheckCircle } from 'react-icons/lia';

interface SimpleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
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
  const handleConfirm = async () => {
    try {
      await onConfirm();
      // Only close if the operation succeeded
      onClose();
    } catch (error) {
      // If operation fails, don't close modal (user can retry)
      console.error('Confirmation action failed:', error);
    }
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
          <LiaCheckCircle className="w-10 h-10 text-primary" />
        </div>
        <p className="text-base text-[#1F1F1F] text-center">
          {message}
        </p>
      </div>
    </BaseModal>
  );
}

