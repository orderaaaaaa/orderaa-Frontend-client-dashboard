'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeIntervals?: number;
  timeCaption?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  isClearable?: boolean;
  showIcon?: boolean;
  icon?: React.ComponentType<{ className?: string; size?: string | number }>;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
  dropdownMode?: 'scroll' | 'select';
  scrollableYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  portalId?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      selected,
      onChange,
      placeholder = 'اختر التاريخ',
      className,
      dateFormat = 'dd/MM/yyyy',
      showTimeSelect = false,
      showTimeSelectOnly = false,
      timeIntervals = 30,
      minDate,
      maxDate,
      disabled = false,
      showIcon = false,
      icon: Icon = CalendarIcon,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    // Time-only picker
    if (showTimeSelectOnly) {
      return (
        <TimePicker
          selected={selected}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          timeIntervals={timeIntervals}
          disabled={disabled}
          showIcon={showIcon}
          icon={Icon}
        />
      );
    }

    const formatDisplayDate = (date: Date) => {
      if (showTimeSelect) {
        return format(date, 'dd/MM/yyyy h:mm aa', { locale: ar });
      }
      return format(
        date,
        dateFormat
          .replace('dd', 'd')
          .replace('MM', 'M')
          .replace('yyyy', 'yyyy'),
        { locale: ar }
      );
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full h-auto py-3 px-4 justify-start text-right font-normal text-base',
              'border border-gray-200 rounded-lg bg-white',
              'hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent',
              !selected && 'text-muted-foreground',
              className
            )}
          >
            {showIcon && (
              <Icon className="ml-2 h-4 w-4 text-gray-400 shrink-0" />
            )}
            <span className="flex-1 text-right truncate">
              {selected ? formatDisplayDate(selected) : placeholder}
            </span>
            {selected && !disabled ? (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
                className="mr-1 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </span>
            ) : !showIcon ? (
              <CalendarIcon className="mr-auto h-4 w-4 text-gray-400 shrink-0" />
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={selected || undefined}
            onSelect={(date) => {
              if (showTimeSelect && date) {
                // Preserve the time from the previously selected date
                if (selected) {
                  date.setHours(selected.getHours());
                  date.setMinutes(selected.getMinutes());
                }
              }
              onChange(date || null);
              if (!showTimeSelect) {
                setOpen(false);
              }
            }}
            disabled={(date) => {
              // Compare dates without time
              const dateOnly = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              );

              if (minDate) {
                const minDateOnly = new Date(
                  minDate.getFullYear(),
                  minDate.getMonth(),
                  minDate.getDate()
                );
                if (dateOnly < minDateOnly) return true;
              }
              if (maxDate) {
                const maxDateOnly = new Date(
                  maxDate.getFullYear(),
                  maxDate.getMonth(),
                  maxDate.getDate()
                );
                if (dateOnly > maxDateOnly) return true;
              }
              return false;
            }}
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2030, 11)}
            autoFocus
          //dir="rtl"
          />
          {showTimeSelect && (
            <div className="border-t p-3">
              <TimeSelector
                selected={selected}
                onChange={(time) => {
                  onChange(time);
                }}
                timeIntervals={timeIntervals}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

DatePicker.displayName = 'DatePicker';

// Time Picker Component for time-only selection
interface TimePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  timeIntervals?: number;
  disabled?: boolean;
  showIcon?: boolean;
  icon?: React.ComponentType<{ className?: string; size?: string | number }>;
}

function TimePicker({
  selected,
  onChange,
  placeholder = 'اختر الوقت',
  className,
  timeIntervals = 30,
  disabled = false,
  showIcon = false,
  icon: Icon = CalendarIcon,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Generate time options
  const timeOptions = React.useMemo(() => {
    const options: { value: string; label: string; date: Date }[] = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    for (let minutes = 0; minutes < 24 * 60; minutes += timeIntervals) {
      const date = new Date(baseDate);
      date.setMinutes(minutes);
      options.push({
        value: format(date, 'HH:mm'),
        label: format(date, 'h:mm aa', { locale: ar }),
        date,
      });
    }
    return options;
  }, [timeIntervals]);

  const formatDisplayTime = (date: Date) => {
    return format(date, 'h:mm aa', { locale: ar });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full h-auto py-3 px-4 justify-start text-right font-normal text-base',
            'border border-gray-200 rounded-lg bg-white',
            'hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          {showIcon && <Icon className="ml-2 h-4 w-4 text-gray-400 shrink-0" />}
          <span className="flex-1 text-right truncate">
            {selected ? formatDisplayTime(selected) : placeholder}
          </span>
          {selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
              className="mr-1 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-0 max-h-60 overflow-auto"
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                const newDate = new Date();
                newDate.setHours(option.date.getHours());
                newDate.setMinutes(option.date.getMinutes());
                newDate.setSeconds(0);
                newDate.setMilliseconds(0);
                onChange(newDate);
                setOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-right text-sm hover:bg-accent transition-colors cursor-pointer',
                selected && format(selected, 'HH:mm') === option.value
                  ? 'bg-primary text-white hover:bg-[#4a1db5]' // Use your purple here
                  : 'text-gray-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Time Selector for date+time picker
interface TimeSelectorProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  timeIntervals?: number;
}

function TimeSelector({
  selected,
  onChange,
  timeIntervals = 30,
}: TimeSelectorProps) {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDate = selected ? new Date(selected) : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    onChange(newDate);
  };

  const currentTime = selected
    ? format(selected, 'HH:mm')
    : format(new Date(), 'HH:mm');

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">الوقت:</span>
      <input
        type="time"
        value={currentTime}
        onChange={handleTimeChange}
        step={timeIntervals * 60}
        className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

// DateRangePicker Component
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
        showIcon={showIcon}
      />

      {separator}

      <DatePicker
        selected={endDate}
        onChange={onEndDateChange}
        placeholder={endPlaceholder}
        dateFormat={dateFormat}
        minDate={startDate || undefined}
        className="w-12 sm:w-auto"
        showIcon={showIcon}
      />
    </div>
  );
};

DateRangePicker.displayName = 'DateRangePicker';
