import React from 'react';
import { BsFiletypeCsv } from 'react-icons/bs';
import { FiMail } from 'react-icons/fi';
import { LiaWhatsapp } from 'react-icons/lia';
import { CustomersDetailsShareProps } from '../../../types/CustomersDetailsModal';

function CustomersDetailsShare({
  email,
  phoneNumbers,
}: CustomersDetailsShareProps) {
  const handleEmailClick = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleWhatsappClick = () => {
    if (phoneNumbers?.[0]) {
      const cleanNumber = phoneNumbers[0].replace(/\D/g, '');
      const formattedNumber = cleanNumber.startsWith('2')
        ? cleanNumber
        : `2${cleanNumber}`;
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    }
  };
  return (
    <div className="flex flex-wrap gap-2 p-3 md:p-5 bg-[#f4f4f4] mb-5 rounded-md">
      <button
        onClick={handleWhatsappClick}
        className="flex-1 min-w-[140px] justify-center cursor-pointer flex gap-2 items-center bg-[#5d24e1] text-white px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-[#4a1cb5] transition-colors"
      >
        <LiaWhatsapp className="text-xl" /> <span>واتساب</span>
      </button>
      <button
        onClick={handleEmailClick}
        className="flex-1 min-w-[140px] justify-center cursor-pointer flex gap-2 items-center bg-white border border-gray-200 px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-gray-50 transition-colors"
      >
        <FiMail /> <span>بريد</span>
      </button>
      <button className="flex-1 min-w-[140px] justify-center cursor-pointer flex gap-2 items-center bg-white border border-gray-200 px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-gray-50 transition-colors">
        <BsFiletypeCsv /> <span>تصدير</span>
      </button>
    </div>
  );
}

export default CustomersDetailsShare;
