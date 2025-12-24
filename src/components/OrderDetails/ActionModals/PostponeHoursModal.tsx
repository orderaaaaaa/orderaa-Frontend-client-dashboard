'use client';

import React, { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { DatePicker } from '@/components/ui/datepicker';
import { LiaClockSolid } from 'react-icons/lia';

interface PostponeHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { duration?: '30min' | '1hour' | '2hours'; time?: Date }) => void | Promise<void>;
}

const durationOptions = [
  { label: '30 دقيقة', value: '30min' as const },
  { label: 'ساعة', value: '1hour' as const },
  { label: 'ساعتين', value: '2hours' as const },
];

export default function PostponeHoursModal({
  isOpen,
  onClose,
  onConfirm,
}: PostponeHoursModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<'30min' | '1hour' | '2hours' | null>(null);
  const [postponeTime, setPostponeTime] = useState<Date | null>(null);

  const handleConfirm = async () => {
    await onConfirm({
      duration: selectedDuration || undefined,
      time: postponeTime || undefined
    });
    // Reset form after successful confirmation
    handleReset();
  };

  const handleReset = () => {
    setSelectedDuration(null);
    setPostponeTime(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isFormValid = !!selectedDuration || !!postponeTime;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تأجيل ساعات"
      onConfirm={handleConfirm}
      confirmText="حفظ"
      confirmDisabled={!isFormValid}
    >
      <div className="space-y-6">
        {/* Duration Radio Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            {durationOptions.map((option) => (
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

        {/* Time Picker */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
            <LiaClockSolid className="w-5 h-5" />
            وقت التأجيل
          </label>
          <DatePicker
            selected={postponeTime}
            onChange={setPostponeTime}
            placeholder="اختر الوقت"
            showTimeSelect={true}
            dateFormat="h:mm aa"
            showIcon={true}
            icon={LiaClockSolid}
            className="w-full"
          />
        </div>
      </div>
    </BaseModal>
  );
}

