import React from 'react';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PaymentStatus, PaymentStatusLabels } from '@/types/orders';

export interface PaymentStatusSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

// Get Arabic label from enum value
const getArabicLabel = (enumValue: string | undefined): string => {
  if (!enumValue) return '';
  return PaymentStatusLabels[enumValue as PaymentStatus] || enumValue;
};

// Get enum value from Arabic label
const getEnumValue = (arabicLabel: string): string => {
  const entry = Object.entries(PaymentStatusLabels).find(
    ([, label]) => label === arabicLabel
  );
  return entry ? entry[0] : arabicLabel;
};

// Arabic options for display
const paymentStatusOptions = Object.values(PaymentStatusLabels);

export function PaymentStatusSelect({
  value,
  onChange,
  className = '',
}: PaymentStatusSelectProps) {
  // Convert enum value to Arabic for display
  const displayValue = getArabicLabel(value);

  // Handle change - convert Arabic back to enum value
  const handleChange = (arabicValue: string) => {
    const enumValue = getEnumValue(arabicValue);
    onChange(enumValue);
  };

  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">حالة الدفع</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px] overflow-hidden">
        <LiaMoneyBillWaveSolid size={18} className="flex-shrink-0" />
        <SearchableSelect
          value={displayValue}
          onValueChange={handleChange}
          options={paymentStatusOptions}
          placeholder="اختر حالة الدفع"
          searchPlaceholder="بحث..."
          emptyMessage="لا توجد حالات دفع متاحة"
          noResultsMessage="لا توجد نتائج للبحث"
          triggerClassName="flex-1 border-none shadow-none h-auto p-0 bg-transparent font-bold text-[15px] text-[#000000]"
          searchThreshold={5}
        />
      </div>
    </div>
  );
}
