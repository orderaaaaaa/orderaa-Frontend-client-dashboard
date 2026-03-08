'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCheckCircle } from 'react-icons/lia';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={handleConfirm}
      confirmText={isLoading ? 'جاري التأكيد...' : confirmText}
      confirmIcon={<LiaCheckCircle className="w-5 h-5 text-white" />}
      cancelText={cancelText}
      isLoading={isLoading}
      maxWidth="md:max-w-[500px]"
    >
      <div className="relative">
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-10">
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

        <p className="text-base text-[#1F1F1F] text-center py-6">
          {message}
        </p>
      </div>
    </BaseModal>
  );
}
