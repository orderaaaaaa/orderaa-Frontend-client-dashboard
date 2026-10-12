'use client';

import React, { useState, memo } from 'react';
import {
  User,
  Phone,
  MessageCircle,
  TrendingUp,
  CalendarClock,
  CalendarDays,
  Mail,
  Edit,
  UserX,
  UserCheck,
} from 'lucide-react';
// Removed useUpdateEmployeeStatus import
import {
  getAccessLevelLabel,
  getActivationLabel,
  getDepartmentLabel,
} from '../utils/employeeMappers';
import { useSetEmployeeActivation } from '../hooks/useEmployees';
import { AttendanceModal } from './AttendanceModal';
import { EmployeeCardProps } from '../add-employee/types/employee.types';
import Link from 'next/link';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import BaseModal from '@/components/ui/base-modal';

export const EmployeeCard = memo(function EmployeeCard({
  employee,
}: EmployeeCardProps) {
  // Removed updateStatusMutation logic
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const setActivationMutation = useSetEmployeeActivation();

  const isOnline = employee.isOnline ?? false;
  // Absent only on a client cached before this field existed; treat as active so
  // an employee never silently reads as retired.
  const isActive = employee.isActive ?? true;

  // Reactivating is harmless, so it applies immediately. Deactivating stops the
  // account on its next request and releases its order locks, so it confirms.
  const handleActivationToggle = () => {
    if (isActive) {
      setConfirmDeactivateOpen(true);
      return;
    }
    setActivationMutation.mutate({ id: employee.id, isActive: true });
  };

  const confirmDeactivate = async () => {
    await setActivationMutation
      .mutateAsync({ id: employee.id, isActive: false })
      .then(
        () => setConfirmDeactivateOpen(false),
        () => undefined,
      );
  };

  const statusColor = isOnline ? '#3cc900' : '#9ca3af';
  const borderColor = isOnline ? '#3cc900' : '#9ca3af';

  const performance = employee.performanceChange ?? 0;
  const isNegative = performance < 0;
  const performanceColor = isNegative ? '#ff0004' : '#3cc900';

  const workDays = employee.workingDaysThisMonth ?? 0;
  const vacationDays = employee.leaveDaysThisMonth ?? 0;

  const normalizedPhone = employee.phoneNumber.replace(/\D/g, '');

  // Removed handleStatusToggle function

  const handleWorkDaysClick = () => {
    setAttendanceModalOpen(true);
  };

  const handleVacationDaysClick = () => {
    setLeaveModalOpen(true);
  };

  const roles = employee.roles ?? [];

  return (
    <div
      className={`bg-white relative rounded-2xl shadow-sm border border-gray-100 p-4 w-full max-w-[420px] ${
        isActive ? '' : 'opacity-60 grayscale'
      }`}
    >
      {/* Header */}
      <div className="flex flex-row-reverse items-center justify-end gap-4 mb-4">
        <Can code={PERMISSIONS.EMPLOYEES_UPDATE}>
          <Link
            href={`/dashboard/employees/employee-settings/${employee.id}`}
            aria-label={`تعديل ${employee.fullName}`}
            className="absolute top-3 end-5 size-10 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Edit size={20} aria-hidden />
          </Link>
        </Can>

        {/* Name, roles & organisational chips */}
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 my-2 pe-10 break-words">
            {employee.fullName}
          </h3>

          {/* Roles decide access — show them first and highlighted. */}
          {roles.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-start mb-2">
              {roles.map((role) => (
                <span
                  key={role.id}
                  className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                >
                  {role.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-start">
            <span className="inline-block border text-gray-500 px-2 lg:px-4 py-1 rounded-full text-xs">
              {getDepartmentLabel(employee.department)}
            </span>
            <span className="inline-block border text-gray-500 px-4 py-1 rounded-full text-xs">
              {getAccessLevelLabel(employee.accessLevel)}
            </span>
            <span
              className={`inline-block px-4 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {getActivationLabel(isActive)}
            </span>
          </div>
        </div>
        {/* Avatar Area */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: borderColor }}
          >
            <User size={32} className="text-primary" strokeWidth={2} />
          </div>

          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white transition-transform"
            style={{ backgroundColor: statusColor }}
            title={isOnline ? 'متصل' : 'غير متصل'}
            aria-label={isOnline ? 'متصل' : 'غير متصل'}
          />
        </div>
      </div>

      {/* Performance */}
      <div className="mb-5">
        <div className="flex flex-row-reverse items-center justify-between mb-1">
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
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={handleWorkDaysClick}
          className="bg-[#f2eefd] shadow-md rounded-2xl p-3 text-center border-2 border-[#5D24E129] hover:bg-[#e8dff9] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <CalendarClock className="text-gray-700 w-5 h-5 lg:w-6 lg:h-6" />
            <span className="text-gray-700 lg:text-xl font-semibold">
              أيام العمل
            </span>
          </div>
          <div className="text-xl lg:text-2xl text-gray-900">{workDays}</div>
        </button>

        <button
          onClick={handleVacationDaysClick}
          className="bg-[#f2eefd] shadow-md rounded-2xl p-3 text-center border-2 border-[#5D24E129] hover:bg-[#e8dff9] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <CalendarDays className="text-gray-700 w-5 h-5 lg:w-6 lg:h-6" />
            <span className="text-gray-700 lg:text-xl font-semibold">
              أيام الإجازة
            </span>
          </div>
          <div className="text-xl lg:text-2xl text-gray-900">
            {vacationDays}
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Phone + Email */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <a
            href={`tel:${normalizedPhone}`}
            className="bg-white hover:bg-gray-50 text-primary
             border-2 border-primary rounded-2xl
             py-3 lg:px-4
             flex items-center justify-center gap-2
             min-w-0 overflow-hidden
             transition-colors font-medium"
          >
            <span dir="ltr" className="truncate max-w-full min-w-0">
              {employee.phoneNumber}
            </span>
            <Phone className="max-md:hidden shrink-0 w-4 h-4 lg:h-5 lg:w-5" />
          </a>

          <a
            href={`mailto:${employee.email}`}
            className="bg-white hover:bg-gray-50 text-primary
             border-2 border-primary rounded-2xl
             py-3 lg:px-4
             flex items-center justify-center gap-2
             min-w-0 overflow-hidden
             transition-colors font-medium"
          >
            <span dir="ltr" className="truncate max-w-full min-w-0">
              {employee.email}
            </span>
            <Mail className="max-md:hidden shrink-0 w-4 h-4 lg:h-5 lg:w-5" />
          </a>
        </div>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/+2${normalizedPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 bg-primary hover:bg-[#682fee] text-white rounded-2xl py-3 px-5 flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <span className="text-xl">WhatsApp</span>
          <MessageCircle size={25} />
        </a>

        {/* Account state (T17). Hidden without employees:activate, which the
            Manager template deliberately excludes. */}
        <Can code={PERMISSIONS.EMPLOYEES_ACTIVATE}>
          <button
            type="button"
            onClick={handleActivationToggle}
            disabled={setActivationMutation.isPending}
            className={`col-span-2 rounded-2xl py-3 px-5 flex items-center justify-center gap-2 transition-colors font-medium border-2 disabled:opacity-60 ${
              isActive
                ? 'bg-white border-red-500 text-red-600 hover:bg-red-50'
                : 'bg-white border-green-600 text-green-700 hover:bg-green-50'
            }`}
          >
            {isActive ? <UserX size={22} /> : <UserCheck size={22} />}
            <span>{isActive ? 'إيقاف الحساب' : 'تنشيط الحساب'}</span>
          </button>
        </Can>
      </div>

      {/* Deactivation confirmation — states both consequences, per T17 §7. */}
      <BaseModal
        isOpen={confirmDeactivateOpen}
        onClose={() => setConfirmDeactivateOpen(false)}
        title={`إيقاف حساب ${employee.fullName}؟`}
        onConfirm={confirmDeactivate}
        confirmText="إيقاف الحساب"
        isLoading={setActivationMutation.isPending}
        confirmButtonClassName="w-[120px] h-10 sm:w-[146px] sm:h-[37px] bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        maxWidth="md:max-w-[420px]"
      >
        <p className="text-sm text-gray-600 leading-relaxed text-right">
          لن يتمكن الموظف من استخدام النظام مباشرةً، وسيتم إلغاء قفل الطلبات
          التي يعمل عليها ليتمكن الموظفون الآخرون من متابعتها. يمكنك تنشيط
          الحساب مرة أخرى في أي وقت.
        </p>
      </BaseModal>

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
});
