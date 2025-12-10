import React from 'react';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Props for PaymentStatusSelect component
 */
export interface PaymentStatusSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Payment status options
 */
const paymentStatusOptions = [
  { value: 'دفع عند الاستلام', label: 'دفع عند الاستلام' },
  { value: 'مدفوع', label: 'مدفوع' },
];

/**
 * PaymentStatusSelect Component
 *
 * Displays a dropdown for selecting payment status
 *
 * @param props - Component props
 */
export function PaymentStatusSelect({
  value,
  onChange,
  className = '',
}: PaymentStatusSelectProps) {
  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p className="font-bold text-[#121212]">حالة الدفع</p>
      <div className={`${tagStyle} relative`}>
        <LiaMoneyBillWaveSolid size={18} />
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="w-full border-none shadow-none h-auto p-0 bg-transparent">
            <SelectValue placeholder="اختر حالة الدفع" />
          </SelectTrigger>
          <SelectContent>
            {paymentStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
