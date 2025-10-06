import PageTab from '@/components/ui/PageTab';
import Heading1 from '@/components/ui/typography/Heading1';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export default function LeftSide() {
  return (
    <div className="flex flex-col justify-between items-center">
      <div className="flex flex-col gap-2">
        <span className="text-[#121212] text-[16px]">منذ 3 ايام و 5 ساعات</span>

        <PageTab
          label="طلبات جديده"
          icon={<CheckCircle width={18} height={18} />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-center items-center">
          <Heading1>2000</Heading1>
          <Heading1>جنيه</Heading1>
        </div>

        <div className="flex gap-2 justify-center items-center">
          <Image
            src="/Icons/repeat.svg"
            alt="Refresh Icon"
            width={16}
            height={16}
          />
          <Heading1>المحاولات:</Heading1>
          <Heading1>15</Heading1>
        </div>
      </div>
    </div>
  );
}
