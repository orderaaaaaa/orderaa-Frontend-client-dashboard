import React from 'react';
import LeftSide from './LeftSide';
import RightSide from './RightSide';
import { OrderCardProps } from '@/types/orders';
import { TriangleAlert } from 'lucide-react';
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
    <div
      className={`
      relative
      z-[0]
      grid
      max-sm:min-w-[400px]
      max-w-[450px] min-w-[442px]
      bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] border-2 border-[#5D24E147]
      rounded-[20px] py-3 px-2
      shadow-[0px_4px_4px_0px_#5D24E114]
      grid-cols-[1px_1fr_1fr_10px] gap-3 
    `}
    >
      <input
        className={`w-5 h-5 cursor-pointer mt-[3px] border-2 border-[#5D24E1] rounded accent-[#5D24E1] ${
          select ? null : 'invisible'
        }`}
        type="checkbox"
        name="select"
        id=""
      />

      <RightSide
        id={id}
        name={name}
        phone={phone}
        government={government}
        items={items}
        city={city}
      />

      <LeftSide alert={alert} price={price} trys={trys} status={status} />
      {alert ? (
        <div className="relative top-0 left-6">
          <p className=" absolute max-sm:left-[-8px] top-[-3px] left-[1px] bg-red-500 text-[9px] text-white min-w-3 h-3 rounded-2xl text-center">
            {alert}
          </p>
          <TriangleAlert
            className="absolute max-sm:left-[-23px] top-[-30] left-[20] text-red-500"
            width={24}
            height={24}
          />
        </div>
      ) : null}
    </div>
  );
}
