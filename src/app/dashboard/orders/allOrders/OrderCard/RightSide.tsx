import React from 'react';
import Content from './Content';

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
      <div className=" relative ">
        {items?.map((item, index) => (
          <Content key={index} icon="package" content={item} />
        ))}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          className="absolute  bottom-[0px] cursor-pointer left-[-25px] font-bold w-5 h-5 text-[linear-gradient(105.28deg,_#FFFFFF_1.48%,_#CBB5FD_182.49%,_#FFFFFF_187.88%)]"
        >
          <path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
        </svg>
      </div>
    </div>
  );
}
