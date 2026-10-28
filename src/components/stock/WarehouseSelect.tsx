'use client';

import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useWarehouseOptions } from '@/services/warehouses';

interface WarehouseSelectProps {
  value: number | null;
  onChange(id: number): void;
  includeHidden?: boolean;
  disabledIds?: number[];
  placeholder?: string;
}

export function WarehouseSelect({
  value,
  onChange,
  includeHidden = false,
  disabledIds = [],
  placeholder = 'اختر المخزن',
}: WarehouseSelectProps) {
  const { options, pickerOptions } = useWarehouseOptions();
  const source = includeHidden ? options : pickerOptions;

  return (
    <SearchableSelect
      options={source.map((option) => ({
        key: option.key,
        value: option.value,
        disabled:
          option.disabled || disabledIds.includes(Number(option.key)),
      }))}
      value={value === null ? '' : String(value)}
      onValueChange={(next) => {
        const id = Number(next);
        if (Number.isInteger(id) && id > 0) onChange(id);
      }}
      placeholder={placeholder}
    />
  );
}
