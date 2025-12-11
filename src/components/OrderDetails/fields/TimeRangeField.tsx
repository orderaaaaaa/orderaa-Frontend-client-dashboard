import React from 'react';
import { LiaClockSolid } from 'react-icons/lia';
import { DatePicker } from '@/components/ui/datepicker';

/**
 * Props for TimeRangeField component
 */
export interface TimeRangeFieldProps {
  timeFrom: Date | null;
  timeTo: Date | null;
  onTimeFromChange: (date: Date | null) => void;
  onTimeToChange: (date: Date | null) => void;
  className?: string;
}

/**
 * TimeRangeField Component
 *
 * Displays a time range picker with two DatePicker components
 *
 * @param props - Component props
 */
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
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <p className="font-bold text-[#121212]">الوقت</p>
      <div className={`${tagStyle} relative overflow-hidden`}>
        <LiaClockSolid size={18} className="flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <DatePicker
            selected={timeFrom}
            onChange={onTimeFromChange}
            placeholder="من"
            showTimeSelect={true}
            showTimeSelectOnly={true}
            dateFormat="h:mm aa"
            timeCaption="الوقت"
            showIcon={false}
            className="flex-1 min-w-0 border-none shadow-none bg-transparent p-0 h-auto font-bold text-[15px] text-[#000000]"
          />
          <span className="text-[#5F5E5E] flex-shrink-0">-</span>
          <DatePicker
            selected={timeTo}
            onChange={onTimeToChange}
            placeholder="إلى"
            showTimeSelect={true}
            showTimeSelectOnly={true}
            dateFormat="h:mm aa"
            timeCaption="الوقت"
            showIcon={false}
            className="flex-1 min-w-0 border-none shadow-none bg-transparent p-0 h-auto font-bold text-[15px] text-[#000000]"
          />
        </div>
      </div>
    </div>
  );
}
