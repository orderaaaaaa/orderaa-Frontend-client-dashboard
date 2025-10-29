import { PhoneOff, CirclePlus } from "lucide-react";
import { Order } from "@/types/orders";

interface OrderDetailsInfoStatusProps {
  order: Order;
}

const statusLabelMap: Record<string, string> = {
  TRIED_TO_REACH_CUSTOMER: 'لا يرد',
  WAITING_FOR_PAYMENT: 'في انتظار الدفع',
  ON_HOLD: 'معلق',
  CALLED_CUSTOMER_AGAIN: 'اعادة اتصال',
  CANCELLED: 'ملغي',
  CONFIRMED: 'مؤكد',
  PREPARED: 'تم التحضير',
  SHIPPED: 'في الشحن',
  RETURNED: 'مرتجع',
  DELIVERED: 'تم التوصيل',
  DOWN_PAYMENT: 'دفعة مقدمة',
  MISSING: 'مفقود',
};

function OrderDetailsInfoStatus({ order }: OrderDetailsInfoStatusProps) {
  const createdDate = new Date(order.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const timeAgo = diffDays > 0
    ? `منذ ${diffDays} يوم ,${diffHours} ساعات`
    : `منذ ${diffHours} ساعات`;

  const dumymyData = [
    { id: 1, status: statusLabelMap[order.status] || order.status, date: createdDate.toLocaleDateString('ar-EG'), time: timeAgo },
  ];

  if (order.numberOfTriesToReach > 0) {
    dumymyData.push({ id: 2, status: "محاولات الوصول", date: `${order.numberOfTriesToReach} مرة`, time: "" });
  }

  return (
    <div className="max-sm:hidden">
      <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg text-[#5D24E1] font-bold">الحالات</h2>
            <p className="border-1 border-[#5D24E1] text-[#5D24E1] w-5 h-5 text-sm text-center rounded-full">
              {dumymyData.length}
            </p>
          </div>

          <CirclePlus className="w-4 h-4 text-[#5D24E1] cursor-pointer" />
        </div>

        <div className="flex flex-wrap gap-4 pb-2">
          {dumymyData.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 bg-white p-3 rounded-lg min-w-[100px] text-center"
            >
              <PhoneOff className="w-4" />
              <p className="text-[14px] font-bold">
                {item.status},<span>{item.date}</span>,{""}{" "}
                <span>{item.time}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsInfoStatus;
