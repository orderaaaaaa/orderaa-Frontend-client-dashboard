'use client';

import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-[600px] bg-white rounded-[20px] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-[60px] rounded-t-[20px] flex items-center justify-center px-8 flex-shrink-0 relative"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center">
            رؤية المنتج
          </h2>

          <button
            onClick={onClose}
            className="absolute left-8 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <LiaTimesSolid className="w-4 h-4 text-black cursor-pointer" />
          </button>
        </div>

        <div className="flex-1 px-8 py-12 flex flex-col items-center justify-center gap-6">
          <LiaExclamationTriangleSolid className="w-24 h-24 text-primary" />

          <h3 className="text-xl font-bold text-black">
            لا يمكن مشاهده هذا الطلب
          </h3>

          <p className="text-gray-600 text-center">
            الطلب مفتوح من قبل {lockedBy.name} في قسم {lockedBy.department}
          </p>
        </div>
      </div>
    </div>
  );
}
