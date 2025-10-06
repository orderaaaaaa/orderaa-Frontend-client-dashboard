import React from 'react';
import LeftSide from './LeftSide';
import RightSide from './RightSide';
import Image from 'next/image';

export default function OrderCard() {
  return (
    <div
      className="
      grid
      grid-cols-[1fr_1fr_auto]
      w-[500px]
      bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] border border-[#5D24E147]
      rounded-[20px] py-4 px-2
      shadow-[0px_4px_4px_0px_#5D24E114]
    "
    >
      <RightSide />

      <LeftSide />

      <Image
        src="/Icons/warningLight.svg"
        alt="Refresh Icon"
        width={24}
        height={24}
      />
    </div>
  );
}
