import React, { useMemo, useState } from 'react';
import { LiaTruckSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useShippingTypes } from '@/hooks';

export interface ShippingTypeSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

export function ShippingTypeSelect({
  value,
  onChange,
  className = '',
}: ShippingTypeSelectProps) {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const { shippingTypes, isLoading } = useShippingTypes(hasBeenOpened);

  const handleOpenChange = (open: boolean) => {
    if (open && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  };

  const typeMap = useMemo(() => {
    const map: Record<string, string> = {};
    shippingTypes.forEach((type) => {
      map[type.key] = type.label;
    });
    return map;
  }, [shippingTypes]);

  const reverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    shippingTypes.forEach((type) => {
      map[type.label] = type.key;
    });
    return map;
  }, [shippingTypes]);

  const displayValue = value ? typeMap[value] || value : '';

  const handleChange = (label: string) => {
    const key = reverseMap[label] || label;
    onChange(key);
  };

  const options = shippingTypes.map((type) => type.label);

  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">نوع الشحنة</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px] overflow-hidden">
        <LiaTruckSolid size={18} className="flex-shrink-0" />
        <SearchableSelect
          value={displayValue}
          onValueChange={handleChange}
          options={options}
          placeholder="اختر نوع الشحنة"
          searchPlaceholder="بحث..."
          emptyMessage="لا توجد أنواع شحن متاحة"
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
