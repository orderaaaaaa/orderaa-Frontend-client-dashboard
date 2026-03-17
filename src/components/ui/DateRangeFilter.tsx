'use client';

import { memo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { TimePeriod } from '@/utils/dateRangeUtils';
import clsx from 'clsx';

const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'day', label: 'يوم' },
  { value: 'week', label: 'اسبوع' },
  { value: 'month', label: 'شهر' },
  { value: 'quarter', label: 'ربع سنوي' },
  { value: 'year', label: 'سنه' },
];

const TIME_PERIOD_LABELS = TIME_PERIOD_OPTIONS.map((opt) => opt.label);

const getLabelFromValue = (value: TimePeriod | ''): string => {
  const option = TIME_PERIOD_OPTIONS.find((opt) => opt.value === value);
  return option?.label || '';
};

const getValueFromLabel = (label: string): TimePeriod | '' => {
  const option = TIME_PERIOD_OPTIONS.find((opt) => opt.label === label);
  return option?.value || '';
};

interface DateRangeFilterProps {
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: TimePeriod | '';
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  onTimePeriodChange: (period: TimePeriod | '') => void;
  className?: string;
}

const DateRangeFilter = memo(
  ({
    fromDate,
    toDate,
    timePeriod,
    onFromDateChange,
    onToDateChange,
    onTimePeriodChange,
    className,
  }: DateRangeFilterProps) => {
    return (
      <div
        className={clsx(
          'flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto',
          className,
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <DatePicker
            selected={fromDate}
            onChange={onFromDateChange}
            placeholder="من تاريخ"
            showIcon
            className="flex-1 sm:flex-none sm:w-[160px]"
            maxDate={toDate || undefined}
          />

          <ArrowLeft className="text-primary flex-shrink-0" size={20} />

          <DatePicker
            selected={toDate}
            onChange={onToDateChange}
            placeholder="إلى تاريخ"
            showIcon
            className="flex-1 sm:flex-none sm:w-[160px]"
            minDate={fromDate || undefined}
          />
        </div>

        <div className="w-full sm:w-[160px] flex-shrink-0">
          <SearchableSelect
            value={getLabelFromValue(timePeriod)}
            onValueChange={(label) =>
              onTimePeriodChange(getValueFromLabel(label))
            }
            options={TIME_PERIOD_LABELS}
            placeholder="الفترة الزمنية"
            triggerClassName={clsx(
              'w-full',
              timePeriod && 'text-primary font-bold',
            )}
            searchThreshold={10}
            clearable
          />
        </div>
      </div>
    );
  },
);

DateRangeFilter.displayName = 'DateRangeFilter';

export default DateRangeFilter;
