'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCommentDotsSolid } from 'react-icons/lia';

interface StopOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

export default function StopOperationModal({
  isOpen,
  onClose,
  onConfirm,
}: StopOperationModalProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!notes.trim()) {
      alert('الملاحظات مطلوبة');
      return;
    }
    onConfirm(notes);
    // Don't reset here - only reset when modal closes (on success via handleClose)
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="وقف التشغيل"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaCommentDotsSolid className="w-5 h-5" />
            سبب وقف التشغيل <span className="text-red-600">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف سبب وقف التشغيل..."
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
            required
          />
        </div>
      </div>
    </BaseModal>
  );
}

