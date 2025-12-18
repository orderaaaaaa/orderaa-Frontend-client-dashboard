import React, { useState } from 'react';
import { LiaClockSolid } from 'react-icons/lia';
import TimePickerModal from '../TimePickerModal';

// Format display time (e.g., "10 am" -> "10:00 AM")
const formatDisplayTime = (time?: string): string => {
  if (!time) return '--';

  // Try parsing "X am/pm" format
  const match = time.match(/(\d{1,2})\s*(am|pm)/i);
  if (match) {
    const hour = match[1];
    const period = match[2].toUpperCase();
    return `${hour}:00 ${period}`;
  }

  // Try parsing Arabic format "X:XX ص/م"
  const arabicMatch = time.match(/(\d{1,2}):?(\d{0,2})\s*(ص|م)/);
  if (arabicMatch) {
    const hour = arabicMatch[1];
    const minute = arabicMatch[2] || '00';
    const period = arabicMatch[3] === 'ص' ? 'AM' : 'PM';
    return `${hour}:${minute.padStart(2, '0')} ${period}`;
  }

  return time;
};

export interface TimeRangeFieldProps {
  timeFrom?: string;
  timeTo?: string;
  onTimeChange: (availableFrom: string, availableTo: string) => Promise<void>;
  className?: string;
}

export function TimeRangeField({
  timeFrom,
  timeTo,
  onTimeChange,
  className = '',
}: TimeRangeFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tagStyle =
    "flex gap-1 sm:gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[13px] sm:text-[15px] text-[#000000]";

  const handleSave = async (availableFrom: string, availableTo: string) => {
    await onTimeChange(availableFrom, availableTo);
  };

  const displayFrom = formatDisplayTime(timeFrom);
  const displayTo = formatDisplayTime(timeTo);

  return (
    <>
      <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
        <p className="font-bold text-[#121212] text-sm sm:text-base">الوقت</p>
        <div
          className={`${tagStyle} relative cursor-pointer hover:bg-gray-50 transition-colors`}
          onClick={() => setIsModalOpen(true)}
        >
          <LiaClockSolid size={18} className="flex-shrink-0" />
          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <span className="font-bold text-[13px] sm:text-[15px] text-[#000000] whitespace-nowrap">
              {displayFrom}
            </span>
            <span className="text-[#5F5E5E] flex-shrink-0">-</span>
            <span className="font-bold text-[13px] sm:text-[15px] text-[#000000] whitespace-nowrap">
              {displayTo}
            </span>
          </div>
        </div>
      </div>

      <TimePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialFrom={timeFrom}
        initialTo={timeTo}
      />
    </>
  );
}
