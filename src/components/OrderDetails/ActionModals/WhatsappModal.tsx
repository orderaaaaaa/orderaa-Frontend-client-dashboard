'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaWhatsapp, LiaCommentDotsSolid } from 'react-icons/lia';

interface WhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void | Promise<void>;
}

export default function WhatsappModal({
  isOpen,
  onClose,
  onConfirm,
}: WhatsappModalProps) {
  const [note, setNote] = useState('');

  const handleConfirm = async () => {
    await onConfirm(note.trim() || undefined);
    setNote('');
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="متابعة واتساب"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#5F5E5E]">
          <LiaWhatsapp className="w-5 h-5" />
          <p className="text-sm">سيتم إرسال متابعة واتساب للعميل</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaCommentDotsSolid className="w-5 h-5" />
            ملاحظة
            <span className="text-gray-400 text-sm font-normal">(اختياري)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أضف ملاحظة..."
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </BaseModal>
  );
}
