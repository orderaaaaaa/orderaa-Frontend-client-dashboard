'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCommentDotsSolid } from 'react-icons/lia';

interface RejectModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void | Promise<void>;
}

export default function RejectModificationModal({
  isOpen,
  onClose,
  onConfirm,
}: RejectModificationModalProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    await onConfirm(notes);
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const isFormValid = !!notes.trim();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="رفض التعديل"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
      confirmDisabled={!isFormValid}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaCommentDotsSolid className="w-5 h-5" />
            سبب رفض التعديل <span className="text-red-600">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف سبب رفض التعديل..."
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>
    </BaseModal>
  );
}
