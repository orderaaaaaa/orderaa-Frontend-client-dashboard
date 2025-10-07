import { Files, TriangleAlert } from "lucide-react";

const OrderDetailsCardId = () => {
  return (
    <div className="relative">
      <div>
        <h3 className="flex gap-2 text-lg items-center font-semibold mb-1">
          <Files className="w-4 text-[#7038f3]" />
          123456789
        </h3>
        <p className="text-xs font-semibold mr-6 mb-4">
          12/12/2024 <span>منذ 2 يوم, 5ساعات</span>
        </p>
        <div className="absolute overflow-x-auto top-1 left-[-16px] bg-[#F6F2FC] text-white border-1 border-[#CBB5FD] !rounded-r-3xl p-2 px-4">
          <h3 className="flex gap-2 text-xs items-center font-semibold mb-1 text-[#5D24E1] ">
            <TriangleAlert className="w-5 text-yellow-500 relative " />
            <p className="bg-red-600 absolute top-2 right-3 w-3 h-3 text-[8px] text-center rounded-full text-white">
              {" "}
              3
            </p>
            هذا العميل قام بالطلب اكثر من مره
          </h3>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsCardId;
