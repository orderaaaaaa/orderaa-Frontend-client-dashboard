import React, { useMemo, useState } from 'react';
import { LiaTruckSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useShippingTypes } from '@/hooks';
import { ShippingType } from '@/types/orders';

const SHIPPING_TYPE_FALLBACK: Record<string, string> = {
  [ShippingType.DELIVERY]: 'توصيل',
  [ShippingType.EXCHANGE]: 'استبدال',
  [ShippingType.RETURN]: 'مرتجع',
  [ShippingType.PARTIAL_RETURN]: 'مرتجع جزئي',
};

export interface ShippingTypeSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
  /** When false the value is shown read-only (no selectable dropdown). */
  canEdit?: boolean;
}

export function ShippingTypeSelect({
  value,
  onChange,
  className = '',
  canEdit = true,
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

  const displayValue = value ? typeMap[value] || SHIPPING_TYPE_FALLBACK[value] || value : '';

  const handleChange = (label: string) => {
    const key = reverseMap[label] || label;
    onChange(key);
  };

  const options = shippingTypes.map((type) => type.label);

  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <p className="font-bold text-[#121212]">نوع الشحنة</p>
      <div className="flex gap-2 bg-white shadow-xs items-center py-1 px-2 rounded-[5px]">
        <LiaTruckSolid size={18} className="flex-shrink-0" />
        {!canEdit ? (
          <p className="flex-1 py-1 font-bold text-[15px] text-[#000000] truncate">
            {displayValue || '-'}
          </p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
