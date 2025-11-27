'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';

export interface DatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  isClearable?: boolean;
  icon?: React.ComponentType<{ className?: string; size?: string | number }>;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
  dropdownMode?: 'scroll' | 'select';
  scrollableYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      selected,
      onChange,
      placeholder = 'اختر التاريخ',
      className,
      dateFormat = 'dd/MM/yyyy',
      showTimeSelect = false,
      minDate,
      maxDate,
      disabled = false,
      isClearable = false,
      icon: Icon = Calendar,
      showMonthDropdown = true,
      showYearDropdown = true,
      dropdownMode = 'select',
      scrollableYearDropdown = true,
      yearDropdownItemNumber = 15,
    },
    ref
  ) => {
    return (
      <div className={cn('relative', className)}>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon className="text-gray-400" size={20} />
        </div>
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          dateFormat={dateFormat}
          placeholderText={placeholder}
          showTimeSelect={showTimeSelect}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          isClearable={isClearable}
          showMonthDropdown={showMonthDropdown}
          showYearDropdown={showYearDropdown}
          dropdownMode={dropdownMode}
          scrollableYearDropdown={scrollableYearDropdown}
          yearDropdownItemNumber={yearDropdownItemNumber}
          className={cn(
            'w-full h-10 text-sm rounded-[4px]',
            'border-0 sm:border sm:border-[#CED4DA]',
            'pr-10 pl-3 text-right',
            'placeholder:text-black placeholder:opacity-60',
            'focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'cursor-pointer'
          )}
          calendarClassName="datepicker-rtl"
          popperClassName="datepicker-popper-rtl"
          wrapperClassName="w-full"
          showPopperArrow={false}
          popperPlacement="bottom-end"
          popperModifiers={[
            {
              name: 'preventOverflow',
              options: {
                rootBoundary: 'viewport',
                tether: false,
                altAxis: true,
              },
            } as any,
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['top-end', 'bottom-start', 'top-start'],
              },
            } as any,
          ]}
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  className?: string;
  dateFormat?: string;
  showIcon?: boolean;
  separator?: React.ReactNode;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = 'من تاريخ',
  endPlaceholder = 'إلى تاريخ',
  className,
  dateFormat = 'dd/MM/yyyy',
  showIcon = true,
  separator,
}) => {
  return (
    <div className={cn('flex items-center gap-2 sm:gap-3', className)}>
      <DatePicker
        selected={startDate}
        onChange={onStartDateChange}
        placeholder={startPlaceholder}
        dateFormat={dateFormat}
        maxDate={endDate || undefined}
        className="w-12 sm:w-auto"
        icon={showIcon ? Calendar : undefined}
      />

      {separator}

      <DatePicker
        selected={endDate}
        onChange={onEndDateChange}
        placeholder={endPlaceholder}
        dateFormat={dateFormat}
        minDate={startDate || undefined}
        className="w-12 sm:w-auto"
        icon={showIcon ? Calendar : undefined}
      />
    </div>
  );
};

DateRangePicker.displayName = 'DateRangePicker';
