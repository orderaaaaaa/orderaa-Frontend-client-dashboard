'use client';

import BaseModal from '@/components/ui/base-modal';
import { LiaExclamationTriangleSolid } from 'react-icons/lia';

interface SendBackConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function SendBackConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: SendBackConfirmModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تأكيد التعديل"
      onConfirm={onConfirm}
      confirmText="متابعة"
      toastOnConfirmError
      maxWidth="md:max-w-[480px]"
    >
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <LiaExclamationTriangleSolid className="w-8 h-8 text-amber-600" />
        </div>

        <p className="text-lg font-bold text-[#1F1F1F]">
          الطلب تم تغليفه. التعديل سيعيده إلى «في انتظار التغليف» ويحتاج إعادة تجهيز. متابعة؟
        </p>
      </div>
    </BaseModal>
  );
}
