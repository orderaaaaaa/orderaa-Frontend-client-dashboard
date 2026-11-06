'use client';

import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-panels';
import type { WarehouseOption } from '@/services/warehouses';

export interface WarehouseSelectSource {
  options: WarehouseOption[];
  pickerOptions: WarehouseOption[];
  isLoading: boolean;
  isError: boolean;
  onRetry?(): void;
}

interface WarehouseSelectProps {
  value: number | null;
  onChange(id: number): void;
  source: WarehouseSelectSource;
  includeHidden?: boolean;
  disabledIds?: number[];
  placeholder?: string;
  disabled?: boolean;
}

export function WarehouseSelect({
  value,
  onChange,
  source,
  includeHidden = false,
  disabledIds = [],
  placeholder = 'اختر المخزن',
  disabled = false,
}: WarehouseSelectProps) {
  if (source.isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (source.isError) {
    return (
      <ErrorState error={undefined} fallback="تعذر تحميل المخازن" onRetry={source.onRetry} />
    );
  }

  const list = includeHidden ? source.options : source.pickerOptions;

  return (
    <SearchableSelect
      options={list.map((option) => ({
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
      disabled={disabled}
    />
  );
}
