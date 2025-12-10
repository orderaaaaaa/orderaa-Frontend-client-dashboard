import React from 'react';
import { LiaCreditCardSolid } from 'react-icons/lia';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Props for PaymentMethodSelect component
 */
export interface PaymentMethodSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Payment method options
 */
const paymentMethodOptions = [
  { value: 'كاش', label: 'كاش' },
  { value: 'فيزا', label: 'فيزا' },
  { value: 'انستا باي', label: 'انستا باي' },
  { value: 'محفظة الكترونيه', label: 'محفظة الكترونيه' },
];

/**
 * PaymentMethodSelect Component
 *
 * Displays a dropdown for selecting payment method
 *
 * @param props - Component props
 */
export function PaymentMethodSelect({
  value,
  onChange,
  className = '',
}: PaymentMethodSelectProps) {
  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p className="font-bold text-[#121212]">طريقة الدفع</p>
      <div className={`${tagStyle} relative`}>
        <LiaCreditCardSolid size={18} />
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="w-full border-none shadow-none h-auto p-0 bg-transparent">
            <SelectValue placeholder="اختر طريقة الدفع" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethodOptions.map((option) => (
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
