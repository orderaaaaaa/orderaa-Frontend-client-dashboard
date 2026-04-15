import React, { useMemo, useState } from 'react';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { usePaymentStatuses } from '@/hooks';

export interface PaymentStatusSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

export function PaymentStatusSelect({
  value,
  onChange,
  className = '',
}: PaymentStatusSelectProps) {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const { paymentStatuses, isLoading } = usePaymentStatuses(hasBeenOpened);

  const handleOpenChange = (open: boolean) => {
    if (open && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  };

  // Create a map of key -> label for lookups
  const statusMap = useMemo(() => {
    const map: Record<string, string> = {};
    paymentStatuses.forEach((status) => {
      map[status.key] = status.label;
    });
    return map;
  }, [paymentStatuses]);

  // Create reverse map label -> key
  const reverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    paymentStatuses.forEach((status) => {
      map[status.label] = status.key;
    });
    return map;
  }, [paymentStatuses]);

  // Get label from key for display
  const displayValue = value ? statusMap[value] || value : '';

  // Handle change - convert label back to key
  const handleChange = (label: string) => {
    const key = reverseMap[label] || label;
    onChange(key);
  };

  // Get labels for options
  const options = paymentStatuses.map((status) => status.label);

  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <p className="font-bold text-[#121212]">حالة الدفع</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px]">
        <LiaMoneyBillWaveSolid size={18} className="flex-shrink-0" />
        <SearchableSelect
          value={displayValue}
          onValueChange={handleChange}
          options={options}
          placeholder="اختر حالة الدفع"
          searchPlaceholder="بحث..."
          emptyMessage="لا توجد حالات دفع متاحة"
          noResultsMessage="لا توجد نتائج للبحث"
          triggerClassName="flex-1 border-none shadow-none h-auto p-0 bg-transparent font-bold text-[15px] text-[#000000]"
          searchThreshold={5}
          loading={isLoading}
          onOpenChange={handleOpenChange}
        />
      </div>
    </div>
  );
}
