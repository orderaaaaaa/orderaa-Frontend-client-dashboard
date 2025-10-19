import React from 'react';
import Content from './Content';
import { Plus } from 'lucide-react';
interface RightSideProps {
  id: number;
  name: string;
  phone: string;
  government: string;
  items: string[];
  city: string;
}

export default function RightSide({
  id,
  name,
  phone,
  government,
  items,
  city,
}: RightSideProps) {
  return (
    <div className="flex flex-col relative gap-1 px-4 ">
      <div className="flex items-center gap-2">
        <Content icon="id" content="الكود:" />
        <span className="text-[18px]">{id}</span>
      </div>
      <Content icon="user" content={name} />
      <Content icon="phone" content={phone} />
      <div className="flex gap-2">
        <Content icon="location" content={government} />
        <span className="font-bold">-</span>
        <Content content={city} />
      </div>
      {items?.map((item, index) => (
        <Content key={index} icon="package" content={item} />
      ))}
    </div>
  );
}
