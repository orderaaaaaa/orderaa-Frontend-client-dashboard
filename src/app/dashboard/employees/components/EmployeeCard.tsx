'use client';

import React from 'react';
import {
  User,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EmployeeCardProps {
  id: number;
  fullName: string;
  department: string;
  phoneNumber: string;
  email: string;
  address: string;
  workingHours: string;
  accessLevel: string;
  performance?: number; // نسبة الأداء
  workDays?: number; // أيام العمل
  vacationDays?: number; // أيام الإجازة
}

export function EmployeeCard({
  fullName,
  department,
  phoneNumber,
  performance = 12,
  workDays = 5,
  vacationDays = 0,
}: EmployeeCardProps) {
  // استخراج الاسم الأول من الاسم الكامل
  const firstName = fullName.split(' ')[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-[420px]">
      {/* Header: الأيقونة والاسم والقسم */}
      <div className="flex items-start justify-between mb-6">
        {/* الاسم والقسم */}
        <div className="text-right">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{firstName}</h3>
          <span className="inline-block bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm">
            {department}
          </span>
        </div>

        {/* أيقونة المستخدم مع النقطة الخضراء */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-green-500 bg-purple-100 flex items-center justify-center">
            <User size={32} className="text-purple-600" strokeWidth={2} />
          </div>
          {/* النقطة الخضراء */}
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-white" />
        </div>
      </div>

      {/* Progress Bar: الأداء */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp size={20} />
            <span className="text-lg font-semibold">{performance} %</span>
          </div>
          <span className="text-gray-700 font-medium">الأداء</span>
        </div>
        <Progress value={performance} />
      </div>

      {/* Stats: أيام العمل والإجازة */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* أيام العمل */}
        <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={20} className="text-purple-600" />
            <span className="text-gray-700 font-medium">أيام العمل</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{workDays}</div>
        </div>

        {/* أيام الإجازة */}
        <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar size={20} className="text-purple-600" />
            <span className="text-gray-700 font-medium">أيام الإجازة</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{vacationDays}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* WhatsApp Button */}
        <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors font-medium">
          <MessageCircle size={20} />
          <span>What's App</span>
        </button>

        {/* Phone Button */}
        <button className="bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors font-medium">
          <span dir="ltr">+2 {phoneNumber}</span>
          <Phone size={20} />
        </button>
      </div>
    </div>
  );
}
