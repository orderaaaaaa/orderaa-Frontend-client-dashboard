import { Files, TriangleAlert, History, CirclePlus } from "lucide-react";

const OrderDetailsCardId = () => {
  return (
    <div className="hidden">
      <div className="relative max-xl:mb-20">
        <div>
          <h3 className="flex gap-2 text-lg items-center font-semibold mb-1">
            <Files className="w-4 text-[#7038f3]" />
            123456789
            <History className="bg-[#F6F2FC] w-8 h-8 p-1 rounded-full text-[#5D24E1] border-1 border-[#CBB5FD]" />
          </h3>
          <p className="text-xs font-semibold mr-6 mb-4">
            12/12/2024 <span>منذ 2 يوم, 5ساعات</span>
          </p>
          <div className="absolute top-1 left-[-16px] overflow-x-auto">
            <div className="flex flex-col xl:flex-row gap-2">
              <button className=" relative bg-[#F6F2FC] text-white border-1 border-[#CBB5FD] !rounded-full max-xl:!rounded-l-3xl p-2 px-4 cursor-pointer">
                <h3 className="flex gap-2 text-sm items-center font-semibold mb-1 text-[#5D24E1] ">
                  <TriangleAlert className="w-5 text-[#5D24E1] relative " />
                  الطلب مفتوح من قبل محمد علاء في قسم التاكيد{" "}
                </h3>
              </button>
              <button className="bg-[#F6F2FC] text-white border-1 border-[#CBB5FD] !rounded-r-3xl p-2 px-4 cursor-pointer">
                <h3 className="flex gap-2 text-sm items-center font-semibold mb-1 text-[#5D24E1] relative ">
                  <TriangleAlert className="w-5 text-yellow-500 " />
                  <p className="bg-red-600 absolute top-[-3px] right-[-4px] w-3 h-3 text-[8px] text-center rounded-full text-white">
                    {" "}
                    3
                  </p>
                  هذا العميل قام بالطلب اكثر من مره
                </h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsCardId;
