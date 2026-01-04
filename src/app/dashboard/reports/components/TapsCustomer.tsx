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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-15 gap-4 w-full">
      {TapCustomerConst.map(({ id, title, icon }) => (
        <div
          key={id}
          className="relative w-full max-w-[240px] mx-auto cursor-pointer group"
        >
          {/* Gradient border wrapper */}
          <div className="p-[2px] rounded-full bg-gradient-to-r from-primary to-[#B8A3EB] transition-transform duration-200 group-hover:scale-[1.02]">
            {/* Inner content */}
            <div className="flex items-center justify-center gap-2 rounded-full bg-[#efebfa] py-2 px-5 sm:px-6">
              <Image
                src={`/images${icon}`}
                alt={title}
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="font-medium text-[13px] sm:text-[14px] text-primary whitespace-nowrap">
                {title}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TapsCustomer;
