import React, { useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import AddLeadModal from './Modal/AddLeadModal';
function LeadsHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="py-2 flex flex-row-reverse justify-between items-start">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary cursor-pointer text-white px-2 sm:px-10 py-2 rounded-full font-semibold text-sm flex items-center gap-1 sm:gap-2 hover:bg-[#5a3ec7] transition-colors"
        >
          <BsPlus className="w-5 h-5" />
          <span>إضافة ليد جديد</span>
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            العملاء و الليدز
          </h1>
        </div>
      </header>

      {isModalOpen && <AddLeadModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

export default LeadsHeader;
