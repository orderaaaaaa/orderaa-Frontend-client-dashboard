'use client';

import React from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaExclamationTriangleSolid } from 'react-icons/lia';
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="رؤية المنتج"
      showFooter={false}
      maxWidth="md:max-w-[600px]"
    >
      <div className="flex flex-col items-center justify-center gap-6 py-6">
        <LiaExclamationTriangleSolid className="w-24 h-24 text-primary" />

        <h3 className="text-xl font-bold text-black">
          لا يمكن مشاهده هذا الطلب
        </h3>

        <p className="text-gray-600 text-center">
          الطلب مفتوح من قبل {lockedBy.name} في قسم {lockedBy.department}
        </p>
      </div>
    </BaseModal>
  );
}
