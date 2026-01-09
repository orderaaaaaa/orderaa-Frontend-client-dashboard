import React from 'react';
import { BsPlus } from 'react-icons/bs';

function LeadsHeader() {
  return (
    <header className="py-2 flex flex-row-reverse justify-between items-start">
      <button className="bg-primary cursor-pointer text-white px-2 sm:px-10 py-2 rounded-full font-semibold text-sm flex items-center gap-1 sm:gap-2 hover:bg-[#5a3ec7] transition-colors">
        <BsPlus className="w-5 h-5" />
        <span>إضافة موظف</span>
      </button>
      <div className="text-right">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {' '}
          العملاء و الليدز
        </h1>
      </div>
    </header>
  );
}

export default LeadsHeader;
