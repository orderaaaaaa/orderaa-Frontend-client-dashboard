import { PhoneOff, CirclePlus } from "lucide-react";
import { Order } from "@/types/orders";

interface OrderDetailsInfoStatusProps {
  order: Order;
}

function OrderDetailsInfoStatus({ order }: OrderDetailsInfoStatusProps) {
  return (
    <div className="max-sm:hidden">
      <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg text-[#5D24E1] font-bold">الحالة</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pb-2">
          <div className="flex gap-2 bg-white p-3 rounded-lg min-w-[100px] text-center">
            <p className="text-[14px] font-bold">
              الحالة: <span className="text-[#5D24E1]">{order.status}</span>
            </p>
          </div>
          {order.deliveryAttempts && order.deliveryAttempts > 0 && (
            <div className="flex gap-2 bg-white p-3 rounded-lg min-w-[100px] text-center">
              <PhoneOff className="w-4" />
              <p className="text-[14px] font-bold">
                محاولات التوصيل: {order.deliveryAttempts}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsInfoStatus;
