import { useEffect, useMemo, useState } from 'react';
import { FilterOptions, OrderFilters } from '@/types/orders';

//TODO: The executionDate field is not here
export const defaultEmptyFilters: OrderFilters = {
  productName: '',
  sizeColor: '',
  governorate: '',
  area: '',
  shipmentCode: '',
  customerName: '',
  phone: '',
  address: '',
};

export const defaultOptions: FilterOptions = {
  productOptions: ['تيشيرت', 'بنطال', 'حذاء', 'تيشيرت', 'بنطال', 'حذاء'],
  sizeColorOptions: ['صغير - أسود', 'متوسط - أبيض', 'كبير - أزرق'],
  governorateOptions: ['القاهرة', 'الجيزة', 'الإسكندرية'],
  areaOptions: ['مدينة نصر', 'المعادي', 'الدقي'],
};

export function useFilterState(
  params: {
    open?: boolean;
    defaultOpen?: boolean;
    filters?: OrderFilters;
    options?: FilterOptions;
    onChange?: (next: OrderFilters) => void;
  } = {}
) {
  const { open, defaultOpen = true, filters, options, onChange } = params;

  const [internalOpen, setInternalOpen] = useState<boolean>(
    open ?? defaultOpen
  );
  const [internalFilters, setInternalFilters] = useState<OrderFilters>(
    filters ?? defaultEmptyFilters
  );
  const effectiveOptions = useMemo<FilterOptions>(
    () => options ?? defaultOptions,
    [options]
  );

  useEffect(() => {
    if (open !== undefined) setInternalOpen(open);
  }, [open]);

  useEffect(() => {
    if (filters) setInternalFilters(filters);
  }, [filters]);

  const updateFilters = (next: OrderFilters) => {
    setInternalFilters(next);
    onChange?.(next);
  };

  return {
    internalOpen,
    setInternalOpen,
    internalFilters,
    updateFilters,
    effectiveOptions,
  } as const;
}
