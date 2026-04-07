'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Textarea } from '@/components/ui/textarea';
import { usePostShippingReasons } from '@/services/logistics';
import clsx from 'clsx';

interface PostShippingCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostShippingCancelModal({
  isOpen,
  onClose,
}: PostShippingCancelModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const { data: reasons = [], isLoading } = usePostShippingReasons(isOpen);

  const handleConfirm = () => {
    if (!selectedReasonId) return;
    console.log('[PostShippingCancel]', {
      reasonId: selectedReasonId,
      notes,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedReasonId(null);
    setNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إلغاء بعد الشحن"
      onConfirm={handleConfirm}
      confirmText="تأكيد الإلغاء"
      confirmDisabled={!selectedReasonId}
      confirmButtonClassName="px-8 py-2 bg-red-600 rounded-[28px] font-bold text-white hover:bg-red-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            سبب الإلغاء <span className="text-red-600">*</span>
          </label>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
              {reasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  className={clsx(
                    'p-3 rounded-lg cursor-pointer border transition-all text-sm text-right',
                    selectedReasonId === reason.id
                      ? 'border-primary bg-[#F6F2FC] text-primary font-semibold'
                      : 'border-[#ECECEC] hover:border-[#CBB5FD] hover:bg-[#FDFBFF] text-[#1F1F1F]'
                  )}
                  onClick={() => setSelectedReasonId(reason.id)}
                >
                  {reason.reasonName}
                </button>
              ))}
              {reasons.length === 0 && (
                <p className="text-sm text-gray-400 col-span-full text-center py-4">
                  لا توجد أسباب متاحة
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">ملاحظات (اختياري)</label>
          <Textarea
            name="postShippingCancelNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظات إضافية..."
          />
        </div>
      </div>
    </BaseModal>
  );
}
