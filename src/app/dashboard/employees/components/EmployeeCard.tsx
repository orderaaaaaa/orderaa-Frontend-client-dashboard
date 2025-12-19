'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  MessageCircle,
  TrendingUp,
  CalendarClock,
  CalendarDays,
  Mail,
} from 'lucide-react';
import { useUpdateEmployeeStatus } from '@/app/dashboard/employees/hooks/useEmployees';
import { Employee } from '@/schemas/employee.schema';
import {
  getAccessLevelLabel,
  getDepartmentLabel,
} from '../utils/employeeMappers';
import { AttendanceModal } from './AttendanceModal';
import { EmployeeCardProps } from '../types/employee.types';

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const updateStatusMutation = useUpdateEmployeeStatus();
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const isOnline = employee.isOnline ?? false;

  const statusColor = isOnline ? '#3cc900' : '#9ca3af';
  const borderColor = isOnline ? '#3cc900' : '#9ca3af';

  const performance = employee.performanceChange ?? 0;
  const isNegative = performance < 0;
  const performanceColor = isNegative ? '#ff0004' : '#3cc900';

  const workDays = employee.workingDaysThisMonth ?? 0;
  const vacationDays = employee.leaveDaysThisMonth ?? 0;

  const normalizedPhone = employee.phoneNumber.replace(/\D/g, '');

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatusMutation.mutate({
      id: employee.id,
      isOnline: !isOnline,
    });
  };

  const handleWorkDaysClick = () => {
    setAttendanceModalOpen(true);
  };

  const handleVacationDaysClick = () => {
    setLeaveModalOpen(true);
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
          <div className="flex flex-wrap gap-2 justify-start">
            <span className="inline-block border text-gray-700 px-4 py-1 rounded-full text-sm">
              {getDepartmentLabel(employee.department)}
            </span>
            <span className="inline-block border text-gray-700 px-4 py-1 rounded-full text-sm">
              {getAccessLevelLabel(employee.accessLevel)}
            </span>
          </div>
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
        <button
          onClick={handleWorkDaysClick}
          className="bg-[#f2eefd] shadow-md rounded-2xl p-3 text-center border-2 border-[#5D24E129] hover:bg-[#e8dff9] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarClock size={24} className="text-gray-700" />
            <span className="text-gray-700 text-xl font-semibold">
              أيام العمل
            </span>
          </div>
          <div className="text-2xl text-gray-900">{workDays}</div>
        </button>

        <button
          onClick={handleVacationDaysClick}
          className="bg-[#f2eefd] shadow-md rounded-2xl p-3 text-center border-2 border-[#5D24E129] hover:bg-[#e8dff9] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays size={25} className="text-gray-700" />
            <span className="text-gray-700 text-xl font-semibold">
              أيام الإجازة
            </span>
          </div>
          <div className="text-2xl text-gray-900">{vacationDays}</div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Phone + Email */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {/* Phone Call */}
          <a
            href={`tel:${normalizedPhone}`}
            className="bg-white hover:bg-gray-50 text-[#5D24E1] border-2 border-[#5D24E1] rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <span dir="ltr">{employee.phoneNumber}</span>
            <Phone size={20} />
          </a>

          {/* Email */}
          <a
            href={`mailto:${employee.email}`}
            className="bg-white hover:bg-gray-50 truncate text-[#5D24E1] border-2 border-[#5D24E1] rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <span dir="ltr">{employee.email}</span>
            <Mail size={20} />
          </a>
        </div>

        {/* WhatsApp (full width second row) */}
        <a
          href={`https://wa.me/+2${normalizedPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 bg-[#5d24e1] hover:bg-[#682fee] text-white rounded-2xl py-3 px-5 flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <span className="text-xl">WhatsApp</span>
          <MessageCircle size={25} />
        </a>
      </div>

      {/* Attendance Modals */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        employeeId={employee.id}
        employeeName={employee.fullName}
        type="attendance"
      />
      <AttendanceModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        employeeId={employee.id}
        employeeName={employee.fullName}
        type="leave"
      />
    </div>
  );
}
