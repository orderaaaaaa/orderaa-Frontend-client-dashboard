'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LiaTimesSolid } from 'react-icons/lia';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (availableFrom: string, availableTo: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

// Convert Arabic time format (e.g., "10:00 ص") to { hour, period }
const parseArabicTime = (time?: string): { hour: number | null; period: string | null } => {
  if (!time) return { hour: null, period: null };

  // Try Arabic format first (e.g., "10:00 ص" or "10:30 م")
  const arabicMatch = time.match(/(\d{1,2}):?\d{0,2}\s*(ص|م)/);
  if (arabicMatch) {
    return {
      hour: parseInt(arabicMatch[1]),
      period: arabicMatch[2] === 'ص' ? 'am' : 'pm',
    };
  }

  // Try English format (e.g., "10:00 am" or "10 pm")
  const englishMatch = time.match(/(\d{1,2}):?\d{0,2}\s*(am|pm)/i);
  if (englishMatch) {
    return {
      hour: parseInt(englishMatch[1]),
      period: englishMatch[2].toLowerCase(),
    };
  }

  return { hour: null, period: null };
};

// Format time for API (e.g., "10 am" or "3 pm")
const formatTimeForApi = (hour: number, period: string): string => {
  return `${hour} ${period}`;
};

export default function TimePickerModal({
  isOpen,
  onClose,
  onSave,
  initialFrom,
  initialTo,
}: TimePickerModalProps) {
  const [tempStartHour, setTempStartHour] = useState<number | null>(null);
  const [tempStartPeriod, setTempStartPeriod] = useState<string | null>(null);
  const [tempEndHour, setTempEndHour] = useState<number | null>(null);
  const [tempEndPeriod, setTempEndPeriod] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset temp values when modal opens
  useEffect(() => {
    if (isOpen) {
      const fromParsed = parseArabicTime(initialFrom);
      const toParsed = parseArabicTime(initialTo);

      setTempStartHour(fromParsed.hour);
      setTempStartPeriod(fromParsed.period);
      setTempEndHour(toParsed.hour);
      setTempEndPeriod(toParsed.period);
    }
  }, [isOpen, initialFrom, initialTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const isComplete =
    tempStartHour !== null &&
    tempStartPeriod !== null &&
    tempEndHour !== null &&
    tempEndPeriod !== null &&
    !isNaN(tempStartHour) &&
    !isNaN(tempEndHour) &&
    tempStartHour >= 1 &&
    tempStartHour <= 12 &&
    tempEndHour >= 1 &&
    tempEndHour <= 12;

  const handleApply = () => {
    if (isComplete && tempStartHour && tempStartPeriod && tempEndHour && tempEndPeriod) {
      const availableFrom = formatTimeForApi(tempStartHour, tempStartPeriod);
      const availableTo = formatTimeForApi(tempEndHour, tempEndPeriod);
      onSave(availableFrom, availableTo);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
            اختر وقت التوصيل
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LiaTimesSolid className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Start Time */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 text-center mb-4 sm:mb-6">
                من
              </h3>

              {/* Hour Selection */}
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                  الساعة
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setTempStartHour(hour)}
                      className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all cursor-pointer text-sm sm:text-base ${
                        tempStartHour === hour
                          ? 'bg-[#5D24E1] text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                  الفترة
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setTempStartPeriod('am')}
                    className={`py-3 sm:py-4 rounded-lg font-medium transition-all cursor-pointer text-xs sm:text-base ${
                      tempStartPeriod === 'am'
                        ? 'bg-[#5D24E1] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    AM (صباحاً)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempStartPeriod('pm')}
                    className={`py-3 sm:py-4 rounded-lg font-medium transition-all cursor-pointer text-xs sm:text-base ${
                      tempStartPeriod === 'pm'
                        ? 'bg-[#5D24E1] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    PM (مساءً)
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">الوقت المحدد</p>
                {tempStartHour !== null &&
                tempStartPeriod !== null &&
                !isNaN(tempStartHour) ? (
                  <div className="text-xl sm:text-2xl font-bold text-[#5D24E1] flex items-center justify-center gap-1">
                    <span>{tempStartHour}</span>
                    <span>{tempStartPeriod.toUpperCase()}</span>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg text-gray-400">
                    لم يتم الاختيار بعد
                  </p>
                )}
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 text-center mb-4 sm:mb-6">
                إلى
              </h3>

              {/* Hour Selection */}
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                  الساعة
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setTempEndHour(hour)}
                      className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all cursor-pointer text-sm sm:text-base ${
                        tempEndHour === hour
                          ? 'bg-[#5D24E1] text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                  الفترة
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setTempEndPeriod('am')}
                    className={`py-3 sm:py-4 rounded-lg font-medium transition-all cursor-pointer text-xs sm:text-base ${
                      tempEndPeriod === 'am'
                        ? 'bg-[#5D24E1] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    AM (صباحاً)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempEndPeriod('pm')}
                    className={`py-3 sm:py-4 rounded-lg font-medium transition-all cursor-pointer text-xs sm:text-base ${
                      tempEndPeriod === 'pm'
                        ? 'bg-[#5D24E1] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    PM (مساءً)
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">الوقت المحدد</p>
                {tempEndHour !== null &&
                tempEndPeriod !== null &&
                !isNaN(tempEndHour) ? (
                  <div className="text-xl sm:text-2xl font-bold text-[#5D24E1] flex items-center justify-center gap-1">
                    <span>{tempEndHour}</span>
                    <span>{tempEndPeriod.toUpperCase()}</span>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg text-gray-400">
                    لم يتم الاختيار بعد
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Final Preview */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              وقت التوصيل
            </p>
            {isComplete ? (
              <div className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <span>{tempStartHour}</span>
                <span>{tempStartPeriod?.toUpperCase()}</span>
                <span>-</span>
                <span>{tempEndHour}</span>
                <span>{tempEndPeriod?.toUpperCase()}</span>
              </div>
            ) : (
              <p className="text-base sm:text-xl text-gray-400">
                يرجى اختيار جميع الأوقات
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex gap-3 sm:gap-4 justify-center">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer text-sm sm:text-base"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!isComplete}
            className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-colors shadow-lg text-sm sm:text-base ${
              isComplete
                ? 'bg-[#5D24E1] text-white hover:bg-[#4a1cb8] cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            تطبيق
          </button>
        </div>
      </div>
    </div>
  );
}
