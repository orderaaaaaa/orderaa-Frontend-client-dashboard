import React from "react";
import {
  User,
  Phone,
  MapPinned,
  Clock3,
  Package,
  Weight,
  Truck,
  CircleDollarSign,
} from "lucide-react";

function OrderDetailsInfoComponent() {
  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-semibold";

  return (
    <>
      <div className="flex flex-col gap-4 font-medium p-4 bg-gray-50 mt-8 rounded-xl ">
        <div className="">
          <h2 className="text-[#5D24E1] font-semibold mb-3">بيانات العميل</h2>
          <div className="grid grid-col-1 md:grid-cols-3 gap-6 ">
            <p className={tagStyle}>
              <User />
              محمد يحيي عبداللطيف
            </p>
            <p className={tagStyle}>
              <Phone width={18} />
              01027464951
            </p>
            <p className={tagStyle}>
              <Phone width={18} />
              01027464951
            </p>
            <p className={tagStyle}>
              <MapPinned width={18} />
              القاهره
            </p>
            <p className={tagStyle}>
              <MapPinned width={18} />
              مدينة نصر
            </p>
            <p className={tagStyle}>
              {" "}
              <Clock3 width={18} />
              10:30 مساءآ | 6:00 صباحآ
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-[#5D24E1] font-semibol mb-3">بيانات المنتج</h2>
          <div className="grid grid-col-1 md:grid-cols-3 gap-6 ">
            <p className={tagStyle}>
              {" "}
              <Package width={20} />
              جلد
            </p>
            <p className={tagStyle}>
              <Weight width={18} />
              خفيف
            </p>
            <p className={tagStyle}>
              <Package width={20} />
              مستورد
            </p>
            <p className={tagStyle}>
              <Truck width={20} />
              اراميكس
            </p>
            <p className={tagStyle}>
              <CircleDollarSign width={18} />
              2000 جنيه
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:grid-rows-1 gap-6">
          <div className="max-w-[500px]">
            <h3 className="mb-3">العنوان:</h3>
            <p className={tagStyle}>
              <span className="max-w-3/4">
                ٣٣٧ ح -خدائق الاهرام - البوابه الرابعه - الدور الاول امام
                الاسانسير خامس شارع خلف الكنيسه
              </span>
            </p>
          </div>

          <div className="max-w-[500px]">
            <h3 className="mb-3">الملاحظات:</h3>

            <p className={tagStyle}>
              <span className="max-w-3/4">
                انا مسافر يوم التلات ومحتاجه بسرعه من فضلكم وعايز مقاس 43 لون
                زيتي
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-6 mb-3">
        <button className="py-1 px-10 border-1 rounded-2xl border-[#5D24E1] text-[#5D24E1] text-sm font-bold">
          متابعة
        </button>
        <button className="py-1 px-10 rounded-2xl bg-[#5D24E1] text-white text-sm font-bold">
          تأكيد
        </button>
      </div>
    </>
  );
}

export default OrderDetailsInfoComponent;
