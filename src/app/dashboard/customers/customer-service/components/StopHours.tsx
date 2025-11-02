import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import { stopHoursData } from '../constants/StopHoursConst';

function StopHours() {
  return (
    <div className="w-full p-6 bg-white mt-10 rounded-2xl shadow-xl py-10">
      <h1 className="text-xl font-semibold text-[#292D32]">ساعات التوقف</h1>

      <div className="!w-full flex items-center justify-between max-md:flex-col-reverse max-md:gap-10 mt-10 px-8">
        {/* Left side - progress list */}
        <div className="w-full flex flex-col gap-10">
          {stopHoursData.map(({ id, value, from, to, total }) => (
            <div key={id} className="flex flex-col gap-3">
              <div className="flex gap-4 items-center">
                <p className="font-medium text-[#292D32]">{from}</p>
                <ArrowLeft className="w-4" />
                <p className="font-medium text-[#292D32]">{to}</p>
                <p className="text-[#292D32] text-[13px]">{total}</p>
              </div>
              <div className="relative flex items-center justify-center w-1 h-1 flex-shrink-0">
                <svg className="w-16 h-16 absolute top-[-45px] left-[-410px] max-sm:left-[-265px] transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="20"
                    stroke="#E8E8E8"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="20"
                    stroke="#5D24E1"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - value / 100)}`}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1s ease-in-out',
                      animation: 'fillCircle 1s ease-in-out forwards',
                    }}
                  />
                </svg>
                <div className="relative right-[235px] top-[-15px] sm:absolute sm:left-[-525px] sm:top-[-30px]   inset-0 flex flex-col items-center gap-[3px] justify-center">
                  <span className="text-[#292D32] font-semibold !text-[10px] leading-none">
                    {total.split(' ').slice(0, 2)}
                  </span>
                  <span className="text-[#292D32] flex justify-center items-center font-semibold !text-[10px] leading-none">
                    {total.split(' ').slice(2, 3)}
                  </span>
                </div>
              </div>
              <Progress
                value={value}
                className="!w-full !max-w-[420px] bg-[#5D24E129]/80 !rounded-md"
              />
            </div>
          ))}
        </div>

        {/* Right side - circular info */}
        <div className="flex flex-col items-center lg:relative lg:left-30 lg:bottom-4 ">
          <div>
            <h3 className="mb-5 font-medium text-[#292D32] w-[300px] text-center">
              اول محاولة التواصل بعد الطلب
            </h3>
          </div>
          <div className="flex flex-col justify-center h-[200px] w-[200px] shadow-xl items-center py-5 bg-gradient-to-b from-[#321082] to-[#7849E6] rounded-full text-white">
            <h3 className="font-medium text-[32px]">50</h3>
            <p className="text-xl">ساعه</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StopHours;
