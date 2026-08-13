'use client';

import { SearchableSelect } from '@/components/ui/SearchableSelect';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { TimePeriod } from '@/utils/dateRangeUtils';
import type { StockFilters as Filters } from '../types';
import { ALL_WAREHOUSES_OPTION } from '@/constants/warehouses';
import { useWarehouseOptions } from '@/services/warehouses';

interface StockFilterOption {
  key: string;
  value: string;
}

interface StockFiltersProps {
  filters: Filters;
  colorOptions: StockFilterOption[];
  sizeOptions: StockFilterOption[];
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClearFilter: (key: keyof Filters) => void;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  onTimePeriodChange: (period: TimePeriod | '') => void;
  onWarehouseChange?: (value: string) => void;
}

export function StockFilters({
  filters,
  colorOptions,
  sizeOptions,
  onFilterChange,
  onClearFilter,
  onFromDateChange,
  onToDateChange,
  onTimePeriodChange,
  onWarehouseChange,
}: StockFiltersProps) {
  const { options: warehouseOptions } = useWarehouseOptions();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchableSelect
          options={colorOptions}
          value={filters.color}
          onChange={(val) => onFilterChange('color', val)}
          onClear={() => onClearFilter('color')}
          placeholder="اللون"
          clearable
        />
        <SearchableSelect
          options={sizeOptions}
          value={filters.size}
          onChange={(val) => onFilterChange('size', val)}
          onClear={() => onClearFilter('size')}
          placeholder="المقاس"
          clearable
        />
        <SearchableSelect
          options={[ALL_WAREHOUSES_OPTION, ...warehouseOptions]}
          value={filters.warehouseId}
          onChange={(val) => onWarehouseChange?.(val)}
          placeholder="المخزن"
        />
      </div>
      <DateRangeFilter
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        timePeriod={filters.timePeriod}
        onFromDateChange={onFromDateChange}
        onToDateChange={onToDateChange}
        onTimePeriodChange={onTimePeriodChange}
        className="!justify-start"
      />
    </div>
  );
}
