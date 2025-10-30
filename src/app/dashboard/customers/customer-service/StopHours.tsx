import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';

const hoursConst = [
  {
    id: 1,
    value: 20,
    from: '12:30م',
    to: '1:30م',
    total: '1 س .30د',
  },
  {
    id: 2,
    value: 70,
    from: '2:00م',
    to: '2:30م',
    total: '1 س .30د',
  },
  {
    id: 3,
    value: 70,
    from: '3:00م',
    to: '3:30م',
    total: '1 س .30د',
  },
  {
    id: 4,
    value: 70,
    from: '4:30م',
    to: '5:30م',
    total: '1 س .30د',
  },
  {
    id: 5,
    value: 70,
    from: '5:30م',
    to: '6:30م',
    total: '1 س .30د',
  },
];

function StopHours() {
  return (
    <div className="w-full max-w-[100%] p-17 bg-white mt-10 rounded-2xl shadow-xl">
      <h1>ساعات التوقف</h1>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-13">
          {hoursConst.map(({ id, value, from, to, total }) => (
            <div key={id} className="flex flex-col gap-3">
              <div className="flex gap-4 items-center">
                {' '}
                <p className="font-medium text-[##292D32]">{from}</p>
                <ArrowLeft className="w-4" />
                <p className="font-medium text-[##292D32]">{to}</p>
                <p className="text-[#292D32] text-[13px]">{total}</p>
              </div>

              <Progress
                value={value}
                className="w-[420px] bg-[#5D24E129]/80 !rounded-md"
              />
            </div>
          ))}
        </div>
        <div className=" flex flex-col items-center">
          <h3 className="mb-5 font-medium"> اول محاولة التواصل بعد الطلب</h3>
          <div className="flex flex-col justify-center h-[150px] w-[150px] shadow-xl items-center py-5 bg-gradient-to-b from-[#321082] to-[#7849E6] rounded-full text-white ">
            <h3 className="font-medium text-[32px]">50</h3>
            <p className="text-xl">ساعه</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StopHours;
