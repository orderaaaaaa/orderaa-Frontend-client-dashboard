import React from 'react';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/searchable-select';

export interface PaymentStatusSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}


const paymentStatusOptions = ['دفع عند الاستلام', 'مدفوع'];


export function PaymentStatusSelect({
  value,
  onChange,
  className = '',
}: PaymentStatusSelectProps) {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <p className="font-bold text-[#121212]">حالة الدفع</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px]">
        <LiaMoneyBillWaveSolid size={18} className="flex-shrink-0" />
        <SearchableSelect
          value={value}
          onValueChange={onChange}
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
