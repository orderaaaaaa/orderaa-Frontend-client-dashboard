import React, { useMemo, useState } from 'react';
import { LiaCreditCardSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { usePaymentMethods } from '@/hooks';

export interface PaymentMethodSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

export function PaymentMethodSelect({
  value,
  onChange,
  className = '',
}: PaymentMethodSelectProps) {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const { paymentMethods, isLoading } = usePaymentMethods(hasBeenOpened);

  const handleOpenChange = (open: boolean) => {
    if (open && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  };

  // Create a map of key -> label for lookups
  const methodMap = useMemo(() => {
    const map: Record<string, string> = {};
    paymentMethods.forEach((method) => {
      map[method.key] = method.label;
    });
    return map;
  }, [paymentMethods]);

  // Create reverse map label -> key
  const reverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    paymentMethods.forEach((method) => {
      map[method.label] = method.key;
    });
    return map;
  }, [paymentMethods]);

  // Get label from key for display
  const displayValue = value ? methodMap[value] || value : '';

  // Handle change - convert label back to key
  const handleChange = (label: string) => {
    const key = reverseMap[label] || label;
    onChange(key);
  };

  // Get labels for options
  const options = paymentMethods.map((method) => method.label);

  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">طريقة الدفع</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px] overflow-hidden">
        <LiaCreditCardSolid size={18} className="flex-shrink-0" />
        <SearchableSelect
          value={displayValue}
          onValueChange={handleChange}
          options={options}
          placeholder="اختر طريقة الدفع"
          searchPlaceholder="بحث..."
          emptyMessage="لا توجد طرق دفع متاحة"
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
