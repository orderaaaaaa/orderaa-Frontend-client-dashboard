'use client';

import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { DatePicker } from '@/components/ui/datepicker';
import { LiaCalendarAltSolid } from 'react-icons/lia';

type DurationOption = '1day' | '2days' | '3days' | 'week';

interface PostponeDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { duration?: DurationOption; date?: Date }) => void | Promise<void>;
}

const dayOptions = [
  { label: 'يوم', value: '1day' as const, days: 1 },
  { label: 'يومين', value: '2days' as const, days: 2 },
  { label: '3 ايام', value: '3days' as const, days: 3 },
  { label: 'اسبوع', value: 'week' as const, days: 7 },
];

const getDateFromDuration = (duration: DurationOption): Date => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  const option = dayOptions.find(o => o.value === duration);
  if (option) {
    date.setDate(date.getDate() + option.days);
  }
  return date;
};

const getDurationFromDate = (date: Date): DurationOption | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const option = dayOptions.find(o => o.days === diffDays);
  return option?.value || null;
};

export default function PostponeDaysModal({
  isOpen,
  onClose,
  onConfirm,
}: PostponeDaysModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [postponeDate, setPostponeDate] = useState<Date | null>(null);

  // Sync date when duration is selected
  useEffect(() => {
    if (selectedDuration) {
      setPostponeDate(getDateFromDuration(selectedDuration));
    }
  }, [selectedDuration]);

  const handleDateChange = (date: Date | null) => {
    setPostponeDate(date);
    if (date) {
      const matchingDuration = getDurationFromDate(date);
      setSelectedDuration(matchingDuration);
    } else {
      setSelectedDuration(null);
    }
  };

  const handleConfirm = async () => {
    if (!postponeDate) {
      return;
    }
    await onConfirm({
      duration: selectedDuration || undefined,
      date: postponeDate
    });
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
      confirmDisabled={!postponeDate}
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
            onChange={handleDateChange}
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

