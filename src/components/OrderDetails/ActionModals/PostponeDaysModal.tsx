'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { DatePicker } from '@/components/ui/datepicker';
import { LiaCalendarAltSolid } from 'react-icons/lia';

interface PostponeDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { duration?: '1day' | '2days' | '3days' | 'week'; date?: Date }) => void | Promise<void>;
}

const dayOptions = [
  { label: 'يوم', value: '1day' as const },
  { label: 'يومين', value: '2days' as const },
  { label: '3 ايام', value: '3days' as const },
  { label: 'اسبوع', value: 'week' as const },
];

export default function PostponeDaysModal({
  isOpen,
  onClose,
  onConfirm,
}: PostponeDaysModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<'1day' | '2days' | '3days' | 'week' | null>(null);
  const [postponeDate, setPostponeDate] = useState<Date | null>(null);

  const handleConfirm = async () => {
    if (!selectedDuration && !postponeDate) {
      alert('يرجى اختيار مدة التأجيل أو تاريخ التأجيل');
      return;
    }
    await onConfirm({
      duration: selectedDuration || undefined,
      date: postponeDate || undefined
    });
    // Reset form after successful confirmation
    handleReset();
  };

  const handleReset = () => {
    setSelectedDuration(null);
    setPostponeDate(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تأجيل أيام"
      onConfirm={handleConfirm}
      confirmText="حفظ"
    >
      <div className="space-y-6">
        {/* Duration Radio Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            {dayOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.value}
                  checked={selectedDuration === option.value}
                  onChange={() => setSelectedDuration(option.value)}
                  className="w-5 h-5 text-[#5D24E1] border-gray-300 focus:ring-[#5D24E1] focus:ring-2"
                />
                <span className="text-base font-bold text-[#1F1F1F]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaCalendarAltSolid className="w-5 h-5" />
            تاريخ التأجيل
          </label>
          <DatePicker
            selected={postponeDate}
            onChange={setPostponeDate}
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

