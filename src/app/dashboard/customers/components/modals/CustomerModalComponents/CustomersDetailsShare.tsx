import React from 'react';
import { LiaWhatsapp, LiaEnvelopeSolid, LiaFileCsvSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
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
      <Button
        onClick={handleWhatsappClick}
        className="flex-1 min-w-[140px] justify-center flex gap-2 items-center bg-primary text-white px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-[#4a1cb5]"
      >
        <LiaWhatsapp className="text-xl" /> <span>واتساب</span>
      </Button>
      <Button
        variant="outline"
        onClick={handleEmailClick}
        className="flex-1 min-w-[140px] justify-center flex gap-2 items-center bg-white border border-gray-200 px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-gray-50"
      >
        <LiaEnvelopeSolid /> <span>بريد</span>
      </Button>
      <Button
        variant="outline"
        className="flex-1 min-w-[140px] justify-center flex gap-2 items-center bg-white border border-gray-200 px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-gray-50"
      >
        <LiaFileCsvSolid /> <span>تصدير</span>
      </Button>
    </div>
  );
}

export default CustomersDetailsShare;
