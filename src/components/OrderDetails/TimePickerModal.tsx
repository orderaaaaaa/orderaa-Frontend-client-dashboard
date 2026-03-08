'use client';

import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (availableFrom: string, availableTo: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

const parseArabicTime = (time?: string): { hour: number | null; period: string | null } => {
  if (!time) return { hour: null, period: null };

  const arabicMatch = time.match(/(\d{1,2}):?\d{0,2}\s*(ص|م)/);
  if (arabicMatch) {
    return {
      hour: parseInt(arabicMatch[1]),
      period: arabicMatch[2] === 'ص' ? 'am' : 'pm',
    };
  }

  const englishMatch = time.match(/(\d{1,2}):?\d{0,2}\s*(am|pm)/i);
  if (englishMatch) {
    return {
      hour: parseInt(englishMatch[1]),
      period: englishMatch[2].toLowerCase(),
    };
  }

  return { hour: null, period: null };
};

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="اختر وقت التوصيل"
      onConfirm={handleApply}
      confirmText="تطبيق"
      confirmDisabled={!isComplete}
      maxWidth="md:max-w-3xl"
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 text-center mb-4 sm:mb-6">
              من
            </h3>

            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                الساعة
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    type="button"
                    variant="ghost"
                    onClick={() => setTempStartHour(hour)}
                    className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${tempStartHour === hour
                        ? 'bg-primary text-white shadow-lg scale-105 hover:bg-primary hover:text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                الفترة
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTempStartPeriod('am')}
                  className={`py-3 sm:py-4 rounded-lg font-medium transition-all text-xs sm:text-base ${tempStartPeriod === 'am'
                      ? 'bg-primary text-white shadow-lg hover:bg-primary hover:text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  AM (صباحاً)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTempStartPeriod('pm')}
                  className={`py-3 sm:py-4 rounded-lg font-medium transition-all text-xs sm:text-base ${tempStartPeriod === 'pm'
                      ? 'bg-primary text-white shadow-lg hover:bg-primary hover:text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  PM (مساءً)
                </Button>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">الوقت المحدد</p>
              {tempStartHour !== null &&
                tempStartPeriod !== null &&
                !isNaN(tempStartHour) ? (
                <div className="text-xl sm:text-2xl font-bold text-primary flex items-center justify-center gap-1">
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

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 text-center mb-4 sm:mb-6">
              إلى
            </h3>

            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                الساعة
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    type="button"
                    variant="ghost"
                    onClick={() => setTempEndHour(hour)}
                    className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${tempEndHour === hour
                        ? 'bg-primary text-white shadow-lg scale-105 hover:bg-primary hover:text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center">
                الفترة
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTempEndPeriod('am')}
                  className={`py-3 sm:py-4 rounded-lg font-medium transition-all text-xs sm:text-base ${tempEndPeriod === 'am'
                      ? 'bg-primary text-white shadow-lg hover:bg-primary hover:text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  AM (صباحاً)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTempEndPeriod('pm')}
                  className={`py-3 sm:py-4 rounded-lg font-medium transition-all text-xs sm:text-base ${tempEndPeriod === 'pm'
                      ? 'bg-primary text-white shadow-lg hover:bg-primary hover:text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  PM (مساءً)
                </Button>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">الوقت المحدد</p>
              {tempEndHour !== null &&
                tempEndPeriod !== null &&
                !isNaN(tempEndHour) ? (
                <div className="text-xl sm:text-2xl font-bold text-primary flex items-center justify-center gap-1">
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

        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl text-center">
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
    </BaseModal>
  );
}
