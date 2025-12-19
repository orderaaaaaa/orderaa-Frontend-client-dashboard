'use client';

import React, { useEffect, useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { useEmployeeAttendance } from '../hooks/useEmployees';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarClock, CalendarDays, Loader2 } from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
  type: 'attendance' | 'leave';
}

export function AttendanceModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  type,
}: AttendanceModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), 'yyyy-MM')
  );

  const { data, isLoading, error } = useEmployeeAttendance(
    employeeId,
    selectedMonth,
    isOpen
  );

  const dates = type === 'attendance' ? data?.attendanceDates : data?.leaveDates;
  const title =
    type === 'attendance' ? 'أيام العمل' : 'أيام الإجازة';
  const emptyMessage =
    type === 'attendance'
      ? 'لا توجد أيام عمل مسجلة لهذا الشهر'
      : 'لا توجد أيام إجازة مسجلة لهذا الشهر';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ar });
    } catch {
      return dateString;
    }
  };

  const getMonthName = (monthString: string) => {
    try {
      const [year, month] = monthString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return format(date, 'MMMM yyyy', { locale: ar });
    } catch {
      return monthString;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${title} - ${employeeName}`}
      showFooter={false}
      maxWidth="w-[600px]"
    >
      <div className="space-y-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-4">
          <label className="text-gray-700 font-medium">الشهر:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
            dir="ltr"
          />
        </div>

        {/* Statistics */}
        {data?.statistics && (
          <div className="bg-[#f2eefd] rounded-xl p-4 mb-4 border-2 border-[#5D24E129]">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">إجمالي أيام العمل</div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.statistics.totalWorkingDays}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {type === 'attendance' ? 'أيام الحضور' : 'أيام الإجازة'}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {type === 'attendance'
                    ? data.statistics.attendedDays
                    : data.statistics.leaveDays}
                </div>
              </div>
            </div>
            {type === 'attendance' && (
              <div className="mt-4 pt-4 border-t border-[#5D24E129] text-center">
                <div className="text-sm text-gray-600 mb-1">نسبة الحضور</div>
                <div className="text-2xl font-bold text-[#3cc900]">
                  {data.statistics.attendancePercentage.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D24E1]" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
            حدث خطأ أثناء تحميل البيانات
          </div>
        )}

        {/* Dates List */}
        {!isLoading && !error && (
          <>
            {dates && dates.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  {type === 'attendance' ? (
                    <CalendarClock className="w-5 h-5 text-[#5D24E1]" />
                  ) : (
                    <CalendarDays className="w-5 h-5 text-[#5D24E1]" />
                  )}
                  <span className="font-semibold text-gray-700">
                    {getMonthName(selectedMonth)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dates.map((date, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {emptyMessage}
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}

