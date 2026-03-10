'use client';

import { memo } from 'react';
import BaseModal from '@/components/ui/base-modal';

interface AddVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

const AddVariantsModal = memo(
  ({ isOpen, onClose, productName }: AddVariantsModalProps) => {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={`إضافة متغيرات - ${productName}`}
        showFooter={false}
      >
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-gray-400">سيتم إضافة محتوى المتغيرات لاحقاً</p>
        </div>
      </BaseModal>
    );
  }
);

AddVariantsModal.displayName = 'AddVariantsModal';

export default AddVariantsModal;
