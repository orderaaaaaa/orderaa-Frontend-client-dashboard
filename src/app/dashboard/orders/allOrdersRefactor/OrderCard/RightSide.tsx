import React from "react";
import Content from "./Content";
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
    <div className="flex flex-col gap-2 px-4">
      <div className="flex items-center gap-2">
        <Content icon="id" content="الكود:" />
        <span className="text-[18px]">{id}</span>
      </div>
      <Content icon="user" content={name} />
      <Content icon="location" content={government} />
      <Content icon="location" content={city} />
      <Content icon="phone" content={phone} />
      {items?.map((item, index) => (
        <Content key={index} icon="package" content={item} />
      ))}
    </div>
  );
}
