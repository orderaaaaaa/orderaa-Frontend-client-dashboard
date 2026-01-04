import React, { useState, useRef, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

interface WorkHoursTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export default function WorkHoursTimePicker({
  value = '',
  onChange,
  error,
  placeholder = 'اختر ساعات العمل',
}: WorkHoursTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartHour, setTempStartHour] = useState<number | null>(null);
  const [tempStartPeriod, setTempStartPeriod] = useState<string | null>(null);
  const [tempEndHour, setTempEndHour] = useState<number | null>(null);
  const [tempEndPeriod, setTempEndPeriod] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset temp values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (value && value.includes('-')) {
        try {
          // Parse format: "AM : 12 - PM : 10"
          const [start, end] = value.split('-').map((s) => s.trim());
          const [startP, , startH] = start.split(' ').map((s) => s.trim());
          const [endP, , endH] = end.split(' ').map((s) => s.trim());

          const parsedStartHour = parseInt(startH);
          const parsedEndHour = parseInt(endH);

          // Only set if parsing was successful
          if (!isNaN(parsedStartHour) && !isNaN(parsedEndHour)) {
            setTempStartHour(parsedStartHour);
            setTempStartPeriod(startP);
            setTempEndHour(parsedEndHour);
            setTempEndPeriod(endP);
          } else {
            // Reset to null if parsing fails
            setTempStartHour(null);
            setTempStartPeriod(null);
            setTempEndHour(null);
            setTempEndPeriod(null);
          }
        } catch (e) {
          // Reset to null if parsing fails
          setTempStartHour(null);
          setTempStartPeriod(null);
          setTempEndHour(null);
          setTempEndPeriod(null);
        }
      } else {
        // Clear all selections when opening with no value
        setTempStartHour(null);
        setTempStartPeriod(null);
        setTempEndHour(null);
        setTempEndPeriod(null);
      }
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // Check if all selections are made and are valid numbers
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
    if (isComplete) {
      // Format: AM : 12 - PM : 10 (right to left for Arabic)
      const formattedValue = `${tempStartPeriod} : ${tempStartHour} - ${tempEndPeriod} : ${tempEndHour}`;
      onChange(formattedValue);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Input Display */}
      <div className="w-full relative">
        <input
          type="text"
          value={value}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          readOnly
          style={{ direction: 'ltr', textAlign: 'right' }}
          className={`w-full h-[46px] px-4 bg-[rgba(234,234,234,0.25)] border ${error ? 'border-red-500' : 'border-black/16'
            } rounded text-base font-normal text-black placeholder:text-black/60 cursor-pointer`}
        />
        {error && (
          <span
            className="text-red-500 text-sm text-right mt-1 block"
            style={{ textAlign: 'right' }}
          >
            {error}
          </span>
        )}
      </div>

      {/* Time Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-100 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                اختر ساعات العمل
              </h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Start Time */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700 text-center mb-6">
                    وقت البداية
                  </h3>

                  {/* Hour Selection */}
                  <div>
                    <p className="text-sm text-gray-600 mb-3 text-center">
                      الساعة
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {hours.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => setTempStartHour(hour)}
                          className={`py-3 px-4 rounded-lg font-medium transition-all cursor-pointer ${tempStartHour === hour
                              ? 'bg-primary text-white shadow-lg scale-105'
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
                    <p className="text-sm text-gray-600 mb-3 text-center">
                      الفترة
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTempStartPeriod('AM')}
                        className={`py-4 rounded-lg font-medium transition-all cursor-pointer ${tempStartPeriod === 'AM'
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        AM (صباحاً)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempStartPeriod('PM')}
                        className={`py-4 rounded-lg font-medium transition-all cursor-pointer ${tempStartPeriod === 'PM'
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        PM (مساءً)
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">الوقت المحدد</p>
                    {tempStartHour !== null &&
                      tempStartPeriod !== null &&
                      !isNaN(tempStartHour) ? (
                      <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                        <span>{tempStartPeriod}</span>
                        <span>:</span>
                        <span>{tempStartHour}</span>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-400">
                        لم يتم الاختيار بعد
                      </p>
                    )}
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700 text-center mb-6">
                    وقت النهاية
                  </h3>

                  {/* Hour Selection */}
                  <div>
                    <p className="text-sm text-gray-600 mb-3 text-center">
                      الساعة
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {hours.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => setTempEndHour(hour)}
                          className={`py-3 px-4 rounded-lg font-medium transition-all cursor-pointer ${tempEndHour === hour
                              ? 'bg-primary text-white shadow-lg scale-105'
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
                    <p className="text-sm text-gray-600 mb-3 text-center">
                      الفترة
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTempEndPeriod('AM')}
                        className={`py-4 rounded-lg font-medium transition-all cursor-pointer ${tempEndPeriod === 'AM'
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        AM (صباحاً)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempEndPeriod('PM')}
                        className={`py-4 rounded-lg font-medium transition-all cursor-pointer ${tempEndPeriod === 'PM'
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        PM (مساءً)
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">الوقت المحدد</p>
                    {tempEndHour !== null &&
                      tempEndPeriod !== null &&
                      !isNaN(tempEndHour) ? (
                      <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                        <span>{tempEndPeriod}</span>
                        <span>:</span>
                        <span>{tempEndHour}</span>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-400">
                        لم يتم الاختيار بعد
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Final Preview */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-2">
                  ساعات العمل النهائية
                </p>
                {isComplete ? (
                  <div className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <span>{tempStartPeriod}</span>
                    <span>:</span>
                    <span>{tempStartHour}</span>
                    <span>-</span>
                    <span>{tempEndPeriod}</span>
                    <span>:</span>
                    <span>{tempEndHour}</span>
                  </div>
                ) : (
                  <p className="text-xl text-gray-400">
                    يرجى اختيار جميع الأوقات
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4 justify-center">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!isComplete}
                className={`px-8 py-3 rounded-lg font-medium transition-colors shadow-lg ${isComplete
                    ? 'bg-primary text-white hover:bg-[#4a1cb8] cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
