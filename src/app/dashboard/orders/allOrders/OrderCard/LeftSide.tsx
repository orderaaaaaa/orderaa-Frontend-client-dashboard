import PageTab from "@/components/ui/PageTab";
import Heading1 from "@/components/ui/typography/Heading1";
import { CheckCircle, TriangleAlert } from "lucide-react";
import Image from "next/image";
import React from "react";

interface LeftSideProps {
  price: number;
  trys: number;
  status: string;
  alert: number;
}

export default function LeftSide({
  price,
  trys,
  status,
  alert,
}: LeftSideProps) {
  return (
    <div className="flex flex-col justify-between items-center">
      <div className="flex flex-col gap-2">
        <span className="text-[#121212] text-[16px]">منذ 3 ايام و 5 ساعات</span>
        {alert ? (
          <div className="relative">
            <p className=" absolute top-[-35px] left-[-15px] bg-red-500 text-[9px] text-white min-w-3 h-3 rounded-2xl text-center">
              {alert}
            </p>
            <TriangleAlert
              className=" absolute top-[-32px] left-[-30px] text-red-500"
              width={24}
              height={24}
            />
          </div>
        ) : null}
        <PageTab label={status} icon={<CheckCircle width={18} height={18} />} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-center items-center">
          <Heading1>{price}</Heading1>
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
          <Heading1>{trys}</Heading1>
        </div>
      </div>
    </div>
  );
}
