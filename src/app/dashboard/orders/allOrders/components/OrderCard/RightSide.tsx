import React from 'react';
import Content from './Content';
import { Plus } from 'lucide-react';
interface RightSideProps {
  id: number;
  code: string;
  name: string;
  phone: string;
  government: string;
  items: string[];
  city: string;
}

export default function RightSide({
  id,
  code,
  name,
  phone,
  government,
  items,
  city,
}: RightSideProps) {
  return (
    <div className="flex flex-col relative gap-1 px-4 min-w-0">
      <div className="flex items-start gap-2 min-w-0">
        <div className="flex-shrink-0">
          <Content icon="id" content="الكود:" />
        </div>
        <span className="text-[14px] break-all flex-1 min-w-0">{code}</span>
      </div>
      <Content icon="user" content={name} />
      <Content icon="phone" content={phone} />
      <div className="flex gap-2 items-center">
        <Content icon="location" content={`${government} - ${city}`} />
      </div>
      {items?.map((item, index) => (
        <Content key={index} icon="package" content={item} />
      ))}
    </div>
  );
}
