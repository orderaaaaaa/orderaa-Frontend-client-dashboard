import React from 'react';
import { LiaCreditCardSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PaymentMethod, PaymentMethodLabels } from '@/types/orders';

export interface PaymentMethodSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

// Get Arabic label from enum value
const getArabicLabel = (enumValue: string | undefined): string => {
  if (!enumValue) return '';
  return PaymentMethodLabels[enumValue as PaymentMethod] || enumValue;
};

// Get enum value from Arabic label
const getEnumValue = (arabicLabel: string): string => {
  const entry = Object.entries(PaymentMethodLabels).find(
    ([, label]) => label === arabicLabel
  );
  return entry ? entry[0] : arabicLabel;
};

// Arabic options for display
const paymentMethodOptions = Object.values(PaymentMethodLabels);

export function PaymentMethodSelect({
  value,
  onChange,
  className = '',
}: PaymentMethodSelectProps) {
  // Convert enum value to Arabic for display
  const displayValue = getArabicLabel(value);

  // Handle change - convert Arabic back to enum value
  const handleChange = (arabicValue: string) => {
    const enumValue = getEnumValue(arabicValue);
    onChange(enumValue);
  };

  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">طريقة الدفع</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px] overflow-hidden">
        <LiaCreditCardSolid size={18} className="flex-shrink-0" />
        <SearchableSelect
          value={displayValue}
          onValueChange={handleChange}
          options={paymentMethodOptions}
          placeholder="اختر طريقة الدفع"
          searchPlaceholder="بحث..."
          emptyMessage="لا توجد طرق دفع متاحة"
          noResultsMessage="لا توجد نتائج للبحث"
          triggerClassName="flex-1 border-none shadow-none h-auto p-0 bg-transparent font-bold text-[15px] text-[#000000]"
          searchThreshold={5}
        />
      </div>
    </div>
  );
}
