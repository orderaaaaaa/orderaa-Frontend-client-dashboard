// components/employees/EmployeeCard.tsx
'use client';

import React from 'react';
import {
  User,
  Phone,
  MessageCircle,
  TrendingUp,
  CalendarClock,
  CalendarDays,
} from 'lucide-react';
import { useUpdateEmployeeStatus } from '@/hooks/useEmployees';
import { Employee } from '@/schemas/employee.schema';

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const updateStatusMutation = useUpdateEmployeeStatus();

  // Get online status, default to false if not provided
  const isOnline = employee.isOnline ?? false;

  // Colors for online/offline status
  const statusColor = isOnline ? '#3cc900' : '#9ca3af'; // green when online, gray when offline
  const borderColor = isOnline ? '#3cc900' : '#9ca3af';

  // Get performance data, use performanceChange for display, default to 0
  const performance = employee.performanceChange ?? 0;
  const isNegative = performance < 0;
  const performanceColor = isNegative ? '#ff0004' : '#3cc900';

  // Get attendance data, defaults to 0
  const workDays = employee.workingDaysThisMonth ?? 0;
  const vacationDays = employee.leaveDaysThisMonth ?? 0;

  // Normalize phone number for links (WhatsApp requires digits only)
  const normalizedPhone = employee.phoneNumber.replace(/\D/g, '');

  // Handle status toggle
  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatusMutation.mutate({
      id: employee.id,
      isOnline: !isOnline,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-[420px]">
      {/* Header */}
      <div className="flex flex-row-reverse items-center justify-end gap-5 mb-6">
        {/* Name & Department */}
        <div className="text-right">
          <h3 className="text-2xl font-bold text-gray-900 my-4">
            {employee.fullName}
          </h3>
          <span className="inline-block border text-gray-700 px-4 py-1 rounded-full text-sm">
            {employee.department}
          </span>
        </div>
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: borderColor }}
          >
            <User size={32} className="text-[#5d24e1]" strokeWidth={2} />
          </div>

          {/* Online/Offline indicator */}
          <button
            onClick={handleStatusToggle}
            disabled={updateStatusMutation.isPending}
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white cursor-pointer hover:scale-110 transition-transform disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: statusColor }}
            title={isOnline ? 'متصل (اضغط للتغيير)' : 'غير متصل (اضغط للتغيير)'}
            aria-label={isOnline ? 'متصل' : 'غير متصل'}
          />
        </div>
      </div>

      {/* Performance */}
      <div className="mb-6">
        <div className="flex flex-row-reverse items-center justify-between mb-2">
          <div
            className="flex items-center gap-2"
            style={{ color: performanceColor }}
          >
            <span className="text-lg">% {performance}</span>
            <TrendingUp size={20} />
          </div>
          <span className="text-gray-700 font-medium">الأداء</span>
        </div>

        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-in-out rounded-full"
            style={{
              width: `${Math.abs(performance)}%`,
              backgroundColor: performanceColor,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f2eefd] shadow-md rounded-2xl p-3 text-center border-2 border-[#5D24E129]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarClock size={24} className="text-gray-700" />
            <span className="text-gray-700 text-xl font-semibold">
              أيام العمل
            </span>
          </div>
          <div className="text-2xl text-gray-900">{workDays}</div>
        </div>

        <div className="bg-[#f2eefd] shadow-md rounded-2xl p-3 text-center border-2 border-[#5D24E129]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays size={25} className="text-gray-700" />
            <span className="text-gray-700 text-xl font-semibold">
              أيام الإجازة
            </span>
          </div>
          <div className="text-2xl text-gray-900">{vacationDays}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Phone Call */}
        <a
          href={`tel:${normalizedPhone}`}
          className="bg-white hover:bg-gray-50 text-[#5D24E1] border-2 border-[#5D24E1] rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <span dir="ltr">{employee.phoneNumber}</span>
          <Phone size={20} />
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/+2${normalizedPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#5d24e1] text-white rounded-2xl py-3 px-5 flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <span className="text-xl">WhatsApp</span>
          <MessageCircle size={25} />
        </a>
      </div>
    </div>
  );
}
