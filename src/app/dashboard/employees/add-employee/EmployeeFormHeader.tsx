import React from 'react';
import { User } from 'lucide-react';

export default function EmployeeFormHeader() {
  return (
    <div
      className="h-[137px] bg-[rgba(93,36,225,0.08)] flex items-center px-6 md:px-12"
      style={{ direction: 'rtl', justifyContent: 'flex-start' }}
    >
      <div
        className="flex items-center gap-5"
        style={{ direction: 'rtl', justifyContent: 'flex-start' }}
      >
        <div className="w-[53px] h-[52px] bg-[#5D24E1] shadow-[0px_4px_22px_rgba(0,0,0,0.08)] rounded-lg flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <div
          className="flex flex-col items-end gap-1"
          style={{ textAlign: 'right', alignItems: 'flex-end' }}
        >
          <h1
            className="text-xl md:text-2xl font-normal"
            style={{ textAlign: 'right', width: '100%' }}
          >
            إضافة موظف جديد
          </h1>
          <p
            className="text-sm md:text-base font-normal text-black"
            style={{ textAlign: 'right', width: '100%' }}
          >
            املأ جميع البيانات لإضافة الموظف
          </p>
        </div>
      </div>
    </div>
  );
}

