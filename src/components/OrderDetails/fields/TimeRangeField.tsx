import React, { useMemo } from 'react';
import { LiaClockSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/searchable-select';

// Generate time options in 30-minute intervals
const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'ص' : 'م';
      const minuteStr = minute.toString().padStart(2, '0');
      options.push(`${hour12}:${minuteStr} ${period}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export interface TimeRangeFieldProps {
  timeFrom?: string;
  timeTo?: string;
  onTimeFromChange: (time: string) => void;
  onTimeToChange: (time: string) => void;
  className?: string;
}

export function TimeRangeField({
  timeFrom,
  timeTo,
  onTimeFromChange,
  onTimeToChange,
  className = '',
}: TimeRangeFieldProps) {
  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">الوقت</p>
      <div className={`${tagStyle} relative overflow-hidden`}>
        <LiaClockSolid size={18} className="flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <SearchableSelect
            className='w-full'
            value={timeFrom}
            onValueChange={onTimeFromChange}
            options={TIME_OPTIONS}
            placeholder="من"
            searchPlaceholder="ابحث عن الوقت..."
            noResultsMessage="لا توجد نتائج"
            triggerClassName="!border-0 !shadow-none !bg-transparent !px-1 !py-0 !h-auto !rounded-none !w-auto min-w-[70px] font-bold text-[15px] text-[#000000] hover:!bg-gray-100"
            searchThreshold={0}
          />
          <span className="text-[#5F5E5E] flex-shrink-0">-</span>
          <SearchableSelect
            className='w-full'
            value={timeTo}
            onValueChange={onTimeToChange}
            options={TIME_OPTIONS}
            placeholder="إلى"
            searchPlaceholder="ابحث عن الوقت..."
            noResultsMessage="لا توجد نتائج"
            triggerClassName="!border-0 !shadow-none !bg-transparent !px-1 !py-0 !h-auto !rounded-none !w-auto min-w-[70px] font-bold text-[15px] text-[#000000] hover:!bg-gray-100"
            searchThreshold={0}
          />
        </div>
      </div>
    </div>
  );
}
