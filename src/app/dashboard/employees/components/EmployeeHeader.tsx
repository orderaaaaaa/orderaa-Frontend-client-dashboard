import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const EmployeeHeader = () => {
  return (
    <div className="px-8 py-2 flex flex-row-reverse justify-between items-start">
      <Link href="/dashboard/employees/add-employee">
        <button className="bg-[#5D24E1] cursor-pointer text-white px-10 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-[#5a3ec7] transition-colors">
          <Plus className="w-5 h-5" />
          <span>إضافة موظف جديد</span>
        </button>
      </Link>
      <div className="text-right">
        <h1 className="text-3xl font-bold text-black mb-4">جميع الموظفين</h1>
        <p className="text-2xl text-black/90">عرض و إدارة جميع الموظفين</p>
      </div>
    </div>
  );
};

export default EmployeeHeader;
