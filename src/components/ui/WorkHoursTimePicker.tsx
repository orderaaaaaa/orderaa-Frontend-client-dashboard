import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';

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

  useEffect(() => {
    if (isOpen) {
      if (value && value.includes('-')) {
        try {
          const [start, end] = value.split('-').map((s) => s.trim());
          const [startP, , startH] = start.split(' ').map((s) => s.trim());
          const [endP, , endH] = end.split(' ').map((s) => s.trim());

          const parsedStartHour = parseInt(startH);
          const parsedEndHour = parseInt(endH);

          if (!isNaN(parsedStartHour) && !isNaN(parsedEndHour)) {
            setTempStartHour(parsedStartHour);
            setTempStartPeriod(startP);
            setTempEndHour(parsedEndHour);
            setTempEndPeriod(endP);
          } else {
            setTempStartHour(null);
            setTempStartPeriod(null);
            setTempEndHour(null);
            setTempEndPeriod(null);
          }
        } catch (e) {
          setTempStartHour(null);
          setTempStartPeriod(null);
          setTempEndHour(null);
          setTempEndPeriod(null);
        }
      } else {
        setTempStartHour(null);
        setTempStartPeriod(null);
        setTempEndHour(null);
        setTempEndPeriod(null);
      }
    }
  }, [isOpen, value]);

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
    if (isComplete) {
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

      <DialogPrimitive.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setIsOpen(false);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden mx-4">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
              <DialogPrimitive.Title className="text-2xl font-bold text-gray-800">
                اختر ساعات العمل
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <LiaTimesSolid className="w-5 h-5 text-gray-600 cursor-pointer" />
              </DialogPrimitive.Close>
            </div>

            <DialogPrimitive.Description className="sr-only">
              اختيار ساعات العمل
            </DialogPrimitive.Description>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700 text-center mb-6">
                    وقت البداية
                  </h3>

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

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700 text-center mb-6">
                    وقت النهاية
                  </h3>

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

            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6 flex gap-4 justify-center">
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
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
