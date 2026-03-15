'use client';

import { SearchableSelect } from '@/components/ui/SearchableSelect';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { MOCK_ALL_COLORS, MOCK_ALL_SIZES } from '../constants';
import type { StockFilters as Filters } from '../types';

interface StockFiltersProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClearFilter: (key: keyof Filters) => void;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  onTimePeriodChange: (period: TimePeriod | '') => void;
}

export function StockFilters({
  filters,
  onFilterChange,
  onClearFilter,
  onFromDateChange,
  onToDateChange,
  onTimePeriodChange,
}: StockFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchableSelect
          options={MOCK_ALL_COLORS}
          value={filters.color}
          onChange={(val) => onFilterChange('color', val)}
          onClear={() => onClearFilter('color')}
          placeholder="اللون"
          clearable
        />
        <SearchableSelect
          options={MOCK_ALL_SIZES}
          value={filters.size}
          onChange={(val) => onFilterChange('size', val)}
          onClear={() => onClearFilter('size')}
          placeholder="المقاس"
          clearable
        />
      </div>
      <DateRangeFilter
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        timePeriod={filters.timePeriod}
        onFromDateChange={onFromDateChange}
        onToDateChange={onToDateChange}
        onTimePeriodChange={onTimePeriodChange}
      />
    </div>
  );
}
