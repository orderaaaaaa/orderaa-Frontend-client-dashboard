'use client';

import React from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { LiaTimesCircleSolid } from 'react-icons/lia';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showFooter={false}
      maxWidth="md:max-w-[500px]"
    >
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <LiaTimesCircleSolid className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-base text-[#1F1F1F] text-center whitespace-pre-line">
          {message}
        </p>
      </div>
      <div className="flex justify-center pt-4">
        <Button
          variant="default"
          onClick={onClose}
          className="w-[146px] h-[37px] rounded-[28px]"
        >
          <span className="text-lg font-bold text-white">إغلاق</span>
        </Button>
      </div>
    </BaseModal>
  );
}
