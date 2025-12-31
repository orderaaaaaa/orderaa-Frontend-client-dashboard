'use client';

import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { DatePicker } from '@/components/ui/datepicker';
import { LiaCalendarAltSolid, LiaMoneyBillWaveSolid } from 'react-icons/lia';
import { z } from 'zod';

type UrgentOption = 'today' | 'tomorrow' | 'after2days';

const shippingCostSchema = z
  .string()
  .refine((val) => val === '' || /^\d*\.?\d*$/.test(val), {
    message: 'يجب إدخال أرقام فقط',
  })
  .transform((val) => (val === '' ? undefined : Number(val)));

interface UrgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { shippingCost?: number; urgentDate: string }) => void | Promise<void>;
}

const getDateFromOption = (option: UrgentOption): Date => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  switch (option) {
    case 'today':
      return today;
    case 'tomorrow':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    case 'after2days':
      const after2days = new Date(today);
      after2days.setDate(after2days.getDate() + 2);
      return after2days;
  }
};

export default function UrgentModal({
  isOpen,
  onClose,
  onConfirm,
}: UrgentModalProps) {
  const [selectedOption, setSelectedOption] = useState<UrgentOption | null>(null);
  const [urgentDate, setUrgentDate] = useState<Date | null>(null);
  const [shippingCost, setShippingCost] = useState('');
  const [shippingCostError, setShippingCostError] = useState('');

  useEffect(() => {
    if (selectedOption) {
      setUrgentDate(getDateFromOption(selectedOption));
    }
  }, [selectedOption]);

  const handleDateChange = (date: Date | null) => {
    setUrgentDate(date);
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) setSelectedOption('today');
      else if (diffDays === 1) setSelectedOption('tomorrow');
      else if (diffDays === 2) setSelectedOption('after2days');
      else setSelectedOption(null);
    } else {
      setSelectedOption(null);
    }
  };

  const handleConfirm = async () => {
    if (!urgentDate) {
      alert('التاريخ مطلوب');
      return;
    }

    const shippingCostResult = shippingCostSchema.safeParse(shippingCost);
    if (!shippingCostResult.success) {
      setShippingCostError(shippingCostResult.error.errors[0]?.message || 'قيمة غير صالحة');
      return;
    }

    await onConfirm({
      shippingCost: shippingCostResult.data,
      urgentDate: urgentDate.toISOString()
    });
    handleReset();
  };

  const handleReset = () => {
    setSelectedOption(null);
    setUrgentDate(null);
    setShippingCost('');
    setShippingCostError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleShippingCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setShippingCost(value);

    const result = shippingCostSchema.safeParse(value);
    if (!result.success) {
      setShippingCostError(result.error.errors[0]?.message || 'قيمة غير صالحة');
    } else {
      setShippingCostError('');
    }
  };

  const radioOptions: { value: UrgentOption; label: string }[] = [
    { value: 'today', label: 'اليوم' },
    { value: 'tomorrow', label: 'غدا' },
    { value: 'after2days', label: 'بعد يومين' },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="مستعجل"
      onConfirm={handleConfirm}
      confirmText="تأكيد"
      confirmDisabled={!urgentDate}
    >
      <div className="space-y-6">
        {/* Radio Options */}
        <div className="flex gap-6">
          {radioOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="urgentOption"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => setSelectedOption(e.target.value as UrgentOption)}
                className="w-5 h-5 accent-[#5D24E1]"
              />
              <span className="text-[#1F1F1F] font-medium">{option.label}</span>
            </label>
          ))}
        </div>

        {/* Date Picker and Shipping Cost */}
        <div className="flex gap-4">
          {/* Date Picker */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
              <LiaCalendarAltSolid className="w-5 h-5" />
              تاريخ
            </label>
            <DatePicker
              selected={urgentDate}
              onChange={handleDateChange}
              placeholder="اختر التاريخ"
              minDate={new Date()}
              showIcon={true}
              icon={LiaCalendarAltSolid}
              className="w-full"
            />
          </div>

          {/* Shipping Cost */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-bold text-[#1F1F1F] flex items-center gap-2">
              <LiaMoneyBillWaveSolid className="w-5 h-5" />
              مصاريف الشحن
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={shippingCost}
              onChange={handleShippingCostChange}
              placeholder="0"
              className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:border-transparent ${
                shippingCostError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-[#ECECEC] focus:ring-[#5D24E1]'
              }`}
            />
            {shippingCostError && (
              <span className="text-red-500 text-sm">{shippingCostError}</span>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

