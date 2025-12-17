// components/employees/EmployeeCard.tsx
'use client';

import React from 'react';
import {
  User,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  TrendingUp,
  SlidersVertical,
  CalendarClock,
  CalendarDays,
} from 'lucide-react';

interface Employee {
  id: number;
  accessLevel: string;
  department: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  workingHours?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EmployeeCardProps {
  employee: Employee;
  performance?: number; // نسبة الأداء
  workDays?: number; // أيام العمل
  vacationDays?: number; // أيام الإجازة
}

export function EmployeeCard({
  employee,
  performance = 12,
  workDays = 5,
  vacationDays = 0,
}: EmployeeCardProps) {
  const isNegative = performance < 0;
  const performanceColor = isNegative ? '#ff0004' : '#3cc900';
  // const borderColor = Online ? 'gray-500 : '#3cc900'; // will edit later

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-[420px]">
      {/* Header: الأيقونة والاسم والقسم */}
      <div className="flex flex-row-reverse items-center justify-end gap-5 mb-6">
        {/* الاسم والقسم */}
        <div className="text-right">
          <h3 className="text-2xl font-bold text-gray-900 my-4 ">
            {employee.fullName}
          </h3>
          <span className="inline-block border text-gray-700 px-4 py-1 rounded-full text-sm">
            {employee.department}
          </span>
        </div>

        {/* أيقونة المستخدم مع النقطة الخضراء */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full border-2  flex items-center justify-center"
            style={{ borderColor: '#3cc900' }}
          >
            <User size={32} className="text-[#5d24e1]" strokeWidth={2} />
          </div>
          {/* النقطة الملونة */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white"
            style={{ backgroundColor: '#3cc900' }}
          />
        </div>
      </div>

      {/* Progress Bar: الأداء */}
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
        {/* Custom Progress Bar */}
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

      {/* Stats: أيام العمل والإجازة */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f2eefd] shadow-md rounded-2xl p-3 max-h-23 text-center border-2 border-[#5D24E129]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarClock size={24} className="text-gray-700" />
            <span className="text-gray-700 text-xl font-semibold">
              أيام العمل
            </span>
          </div>
          <div className="text-2xl text-gray-900">{workDays}</div>
        </div>

        <div className="bg-[#f2eefd] shadow-md rounded-2xl p-3 max-h-23 text-center border-2 border-[#5D24E129]">
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
      <div className="flex justify-center gap-4">
        <button className="bg-white hover:bg-gray-50 text-[#5D24E1] border-2 border-[#5D24E1] rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors font-medium">
          <span dir="ltr">+2 {employee.phoneNumber}</span>
          <Phone size={20} />
        </button>

        <button className="bg-[#5d24e1] cursor-pointer text-white rounded-2xl py-3 px-5 flex items-center justify-center gap-2 transition-colors font-medium">
          <span className="text-xl">What's App</span>
          <MessageCircle size={25} />
        </button>
      </div>
    </div>
  );
}
