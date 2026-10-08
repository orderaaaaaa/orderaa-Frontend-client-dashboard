'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { calculateDateRangeFromPeriod, type TimePeriod } from '@/utils/dateRangeUtils';
import { MISSING_ORDER_SOURCE_OPTIONS, MISSING_ORDER_STATUS_FILTER_TABS } from '@/constants/missingOrders';
import type {
  MissingOrderSourceFormat,
  MissingOrderStatusFilter,
} from '@/types/missing-orders';

const SOURCE_LABEL_ALL = 'الكل';

interface MissingOrdersFiltersProps {
  status: MissingOrderStatusFilter;
  onStatusChange: (status: MissingOrderStatusFilter) => void;
  format: MissingOrderSourceFormat | undefined;
  onFormatChange: (format: MissingOrderSourceFormat | undefined) => void;
  fromDate: Date | null;
  toDate: Date | null;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
}

export function MissingOrdersFilters({
  status,
  onStatusChange,
  format,
  onFormatChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: MissingOrdersFiltersProps) {
  const sourceLabel =
    MISSING_ORDER_SOURCE_OPTIONS.find((o) => o.value === format)?.label ??
    SOURCE_LABEL_ALL;
  const sourceOptions = [
    SOURCE_LABEL_ALL,
    ...MISSING_ORDER_SOURCE_OPTIONS.map((o) => o.label),
  ];

  const handleSourceChange = (label: string) => {
    const match = MISSING_ORDER_SOURCE_OPTIONS.find((o) => o.label === label);
    onFormatChange(match?.value);
  };

  const timePeriod: TimePeriod | '' = '';

  const handleTimePeriodChange = (period: TimePeriod | '') => {
    if (!period) {
      onFromDateChange(null);
      onToDateChange(null);
      return;
    }
    const range = calculateDateRangeFromPeriod(period);
    onFromDateChange(range?.from ?? null);
    onToDateChange(range?.to ?? null);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <Tabs value={status} onValueChange={(v) => onStatusChange(v as MissingOrderStatusFilter)}>
        <TabsList>
          {MISSING_ORDER_STATUS_FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="w-full sm:w-[180px]">
        <SearchableSelect
          value={sourceLabel}
          onValueChange={handleSourceChange}
          options={sourceOptions}
          placeholder="المصدر"
          searchThreshold={10}
        />
      </div>

      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        timePeriod={timePeriod}
        onFromDateChange={onFromDateChange}
        onToDateChange={onToDateChange}
        onTimePeriodChange={handleTimePeriodChange}
      />
    </div>
  );
}
