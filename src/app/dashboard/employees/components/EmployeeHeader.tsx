import { Plus } from 'lucide-react';
import Link from 'next/link';
import React, { memo } from 'react';

const EmployeeHeader = memo(() => {
  return (
    <div className="sm:px-8 py-2 flex flex-row-reverse justify-between items-start gap-3">
      <Link
        href="/dashboard/employees/add-employee"
        className="bg-primary text-white h-10 px-4 sm:px-10 rounded-full font-semibold text-sm flex items-center gap-1 sm:gap-2 hover:bg-[#5a3ec7] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        <Plus className="w-5 h-5" aria-hidden />
        <span>إضافة موظف</span>
      </Link>
      <div className="text-right">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">جميع الموظفين</h1>
        <p className="text-base sm:text-2xl text-black/90">عرض و إدارة جميع الموظفين</p>
      </div>
    </div>
  );
});

EmployeeHeader.displayName = 'EmployeeHeader';

export default EmployeeHeader;
