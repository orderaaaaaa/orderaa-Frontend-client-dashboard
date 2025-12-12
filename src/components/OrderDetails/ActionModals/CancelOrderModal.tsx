'use client';

import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCommentDotsSolid } from 'react-icons/lia';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; notes: string }) => void;
}

// TODO: Fetch these from backend
const cancelReasons = [
  'العميل لا يرد',
  'العميل رفض الطلب',
  'العميل طلب إلغاء الطلب',
  'المنتج غير متوفر',
  'خطأ في الطلب',
  'سعر غير مناسب',
  'مشكلة في الشحن',
  'أخرى',
];

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConfirm = () => {
    if (!reason) {
      alert('السبب مطلوب');
      return;
    }
    onConfirm({ reason, notes });
    // Don't reset here - only reset when modal closes (on success via handleClose)
  };

  const handleReset = () => {
    setReason('');
    setNotes('');
    setIsDropdownOpen(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إلغاء الطلب"
      onConfirm={handleConfirm}
      confirmText="تأكيد الإلغاء"
      confirmButtonClassName="px-8 py-2 bg-red-600 rounded-[28px] font-bold text-white hover:bg-red-700 transition-all duration-200 hover:scale-105"
    >
      <div className="space-y-6">
        {/* Cancel Reason - Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            سبب الإلغاء <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-right text-base flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#5D24E1]"
            >
              <span className={reason ? 'text-[#1F1F1F]' : 'text-[#5F5E5E]'}>
                {reason || 'اختر السبب'}
              </span>
              <svg
                width="15"
                height="30"
                viewBox="0 0 15 30"
                fill="none"
                className={`transform rotate-90 transition-transform ${
                  isDropdownOpen ? 'rotate-[-90deg]' : ''
                }`}
              >
                <path
                  d="M13.5 7.5L7.5 13.5L1.5 7.5"
                  stroke="#5F5E5E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full bg-white border border-[#ECECEC] rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {cancelReasons.map((cancelReason) => (
                  <button
                    key={cancelReason}
                    onClick={() => {
                      setReason(cancelReason);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-right text-base text-[#5F5E5E] hover:bg-purple-50 transition-colors"
                  >
                    {cancelReason}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaCommentDotsSolid className="w-5 h-5" />
            ملاحظات
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظات إضافية..."
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
          />
        </div>
      </div>
    </BaseModal>
  );
}

