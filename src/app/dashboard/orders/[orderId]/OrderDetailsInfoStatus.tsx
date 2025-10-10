import { PhoneMissed, CirclePlus } from 'lucide-react';

const dumymyData = [
  { id: 1, status: 'لا يرد' },
  { id: 2, status: 'مغلق' },
  { id: 3, status: 'مش بيجمع' },
];

function OrderDetailsInfoStatus() {
  return (
    <div className="max-sm:hidden">
      <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg text-[#5D24E1] font-bold">الحالات</h2>
            <p className="border-1 border-[#5D24E1] text-[#5D24E1] w-5 h-5 text-sm text-center rounded-full">
              3
            </p>
          </div>

          <CirclePlus className="w-4 h-4 text-[#5D24E1] cursor-pointer" />
        </div>

        <div className="flex flex-wrap gap-4 pb-2">
          {dumymyData.map((item) => (
            <div key={item.id}>
              <div className="flex flex-col gap-2 bg-white p-3 rounded-lg min-w-[200px] text-center">
                <div className="flex gap-2">
                  <PhoneMissed className="w-4" />
                  <p className="text-[14px] font-bold">
                    {item.status} ,<span>12/12/2024</span>,
                    <span>منذ 2 يوم, 5 ساعات </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-[5400]">
                    بواسطة الموظف محمد علاء في قسم التاكيد
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsInfoStatus;
