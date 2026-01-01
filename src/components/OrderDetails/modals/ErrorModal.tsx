'use client';

import React from 'react';
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
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className="relative w-[500px] bg-white rounded-[20px] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-[60px] sm:h-[79px] rounded-t-[20px] flex items-center justify-center px-8 flex-shrink-0 relative"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center">{title}</h2>

          <button
            onClick={onClose}
            className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <LiaTimesSolid className="w-6 h-6 text-black cursor-pointer" />
          </button>
        </div>

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
            className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors"
          >
            <span className="text-lg font-bold text-white">إغلاق</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
