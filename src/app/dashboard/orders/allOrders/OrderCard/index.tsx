import React from "react";
import Link from "next/link";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";
import Image from "next/image";
import { TriangleAlert } from "lucide-react";

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
  alert: number;
  select: boolean;
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
  alert,
  select,
}: OrderCardProps) {
  return (
    <Link href={`/dashboard/orders/${id}`} className="block">
      <div
        className={`
        relative
        z-[0]
        grid
        max-w-[500px] min-w-[300px]
        bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] border-2 border-[#5D24E147]
        rounded-[20px] py-4 px-2
        shadow-[0px_4px_4px_0px_#5D24E114]
        transition-all hover:shadow-lg cursor-pointer
        ${select ? "grid-cols-[10px_1fr_1fr] gap-3" : "grid-cols-[1fr_1fr_auto]"}
      `}
      >
        {select ? (
          <input
            className="w-5 h-5 cursor-pointer border-2 border-[#5D24E1] rounded accent-[#5D24E1] transform"
            type="checkbox"
            name="select"
            id=""
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}

        <RightSide
          id={id}
          name={name}
          phone={phone}
          government={government}
          items={items}
          city={city}
        />

        <LeftSide alert={alert} price={price} trys={trys} status={status} />
      </div>
    </Link>
  );
}
