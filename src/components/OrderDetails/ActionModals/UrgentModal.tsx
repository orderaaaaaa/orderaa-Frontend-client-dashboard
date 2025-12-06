'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { DatePicker } from '@/components/ui/datepicker';
import { LiaTruckSolid, LiaCalendarAltSolid } from 'react-icons/lia';

interface UrgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { shippingCompany?: string; urgentDate: string }) => void;
}

export default function UrgentModal({
  isOpen,
  onClose,
  onConfirm,
}: UrgentModalProps) {
  const [shippingCompany, setShippingCompany] = useState('');
  const [urgentDate, setUrgentDate] = useState<Date | null>(null);

  const handleConfirm = () => {
    if (!urgentDate) {
      alert('التاريخ مطلوب');
      return;
    }
    // Format date as ISO string or your preferred format
    const formattedDate = urgentDate.toISOString().split('T')[0];
    onConfirm({ shippingCompany: shippingCompany || undefined, urgentDate: formattedDate });
    handleReset();
  };

  const handleReset = () => {
    setShippingCompany('');
    setUrgentDate(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="مستعجل"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
    >
      <div className="space-y-6">
        {/* Shipping Company - Optional */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaTruckSolid className="w-5 h-5" />
            شركة الشحن (اختياري)
          </label>
          <input
            type="text"
            value={shippingCompany}
            onChange={(e) => setShippingCompany(e.target.value)}
            placeholder="أدخل اسم شركة الشحن"
            className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
          />
        </div>

        {/* Urgent Date - Mandatory */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaCalendarAltSolid className="w-5 h-5" />
            التاريخ <span className="text-red-600">*</span>
          </label>
          <DatePicker
            selected={urgentDate}
            onChange={setUrgentDate}
            placeholder="اختر التاريخ"
            minDate={new Date()}
            showIcon={true}
            icon={LiaCalendarAltSolid}
            className="w-full"
          />
        </div>
      </div>
    </BaseModal>
  );
}

