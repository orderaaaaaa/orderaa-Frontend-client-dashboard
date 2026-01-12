import Image from 'next/image';
import React from 'react';
import {
  TapCustomerConst,
  SummaryCardConst,
} from '@/constants/customer-service/TapAndSummary';

interface ITapsCustomer {
  title: string;
  icon: string;
}

function TapsCustomer() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-15 gap-4 w-full">
      {TapCustomerConst.map(({ id, title, icon }) => (
        <div
          key={id}
          className="relative w-full  mx-auto cursor-pointer group border border-[#CED4DA] rounded-lg hover:shadow-lg hover:border-primary transition-all duration-300C"
        >
          <div className="flex items-center justify-center gap-2 rounded-full py-2 px-5 sm:px-6">
            <Image
              src={`/images${icon}`}
              alt={title}
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="font-semibold text-lg  whitespace-nowrap">
              {title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TapsCustomer;
