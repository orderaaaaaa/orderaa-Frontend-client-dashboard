import React from 'react';
import { LiaCreditCardSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/searchable-select';

export interface PaymentMethodSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

const paymentMethodOptions = ['كاش', 'فيزا', 'انستا باي', 'محفظة الكترونيه'];

export function PaymentMethodSelect({
  value,
  onChange,
  className = '',
}: PaymentMethodSelectProps) {
  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">طريقة الدفع</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px] overflow-hidden">
        <LiaCreditCardSolid size={18} className="flex-shrink-0" />
        <SearchableSelect
          value={value}
          onValueChange={onChange}
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
