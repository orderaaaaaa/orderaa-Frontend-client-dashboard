import React from "react";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";
import Image from "next/image";

interface OrderCardProps {
  id: number;
  name: string;
  phone: string;
  government: string;
  items: string[];
  price: number;
  trys: number;
  status: string;
  city: string;
}

export default function OrderCard({
  id,
  name,
  phone,
  government,
  items,
  price,
  trys,
  status,
  city,
}: OrderCardProps) {
  return (
    <div
      className="
      grid
      grid-cols-[1fr_1fr_auto]
      w-[500px]
      bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] border-2 border-[#5D24E147]
      rounded-[20px] py-4 px-2
      shadow-[0px_4px_4px_0px_#5D24E114]
    "
    >
      <RightSide
        id={id}
        name={name}
        phone={phone}
        government={government}
        items={items}
        city={city}
      />

      <LeftSide price={price} trys={trys} status={status} />

      <Image
        src="/Icons/warningLight.svg"
        alt="Refresh Icon"
        width={24}
        height={24}
      />
    </div>
  );
}
