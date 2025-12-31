import { Order, OrderEvent } from "@/types/orders";
import { PhoneOff, CirclePlus, History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getTimeAgo } from "@/utils/timeAgo";

interface OrderDetailsInfoStatusProps {
  order: Order;
  isLockedByOther?: boolean;
}

const statusLabelMap: Record<string, string> = {
  NEW_ORDER: 'طلب جديد',
  ATTEMPTED: 'تمت المحاولة',
  WAITING_FOR_PAYMENT: 'في انتظار الدفع',
  WHATSAPP: 'واتساب',
  POSTPONED: 'مؤجل',
  CALL_AGAIN: 'اعادة اتصال',
  STOPPED: 'متوقف',
  CANCELLED: 'ملغي',
  UNCOMPLETED: 'غير مكتمل',
  CONFIRMED: 'مؤكد',
  PREPARED: 'تم التحضير',
  SHIPPING: 'في الشحن',
  RETURNED_DELIVERED: 'مرتجع بعد التوصيل',
  DELIVERED: 'تم التوصيل',
  PARTIAL_DELIVERY: 'توصيل جزئي',
  MISSING: 'مفقود',
  REGISTERED: 'مسجل',
  REPORTS: 'تقارير',
};

const getEventIcon = (eventType?: string) => {
  if (!eventType) {
    return <History className="w-4 h-4 text-gray-600" />;
  }

  switch (eventType) {
    case 'CONFIRMED':
    case 'DELIVERED':
    case 'PREPARED':
    case 'REGISTERED':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'CANCELLED':
    case 'STOPPED':
    case 'RETURNED_DELIVERED':
    case 'MISSING':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'POSTPONED':
    case 'WAITING_FOR_PAYMENT':
    case 'UNCOMPLETED':
    case 'PARTIAL_DELIVERY':
      return <Clock className="w-4 h-4 text-orange-600" />;
    case 'ATTEMPTED':
    case 'CALL_AGAIN':
    case 'WHATSAPP':
      return <PhoneOff className="w-4 h-4 text-blue-600" />;
    case 'SHIPPING':
      return <History className="w-4 h-4 text-purple-600" />;
    case 'NEW_ORDER':
      return <History className="w-4 h-4 text-[#5D24E1]" />;
    default:
      return <History className="w-4 h-4 text-gray-600" />;
  }
};

function OrderDetailsInfoStatus({ order }: OrderDetailsInfoStatusProps) {
  const allEvents = order.order_events || [];

  const events = allEvents.map((event: OrderEvent, index: number) => {
    const statusLabel = event.status ? (statusLabelMap[event.status] || event.status) : 'حدث';
    return {
      id: event.id || index + 1,
      status: statusLabel,
      date: new Date(event.createdAt).toLocaleDateString('ar-EG'),
      time: getTimeAgo(event.createdAt),
      eventType: event.status || 'default',
      note: event.note || statusLabel,
      employee: event.employee,
    };
  });

  const displayData = [...events];

  return (
    <div>
      <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg text-[#5D24E1] font-bold">سجل الأحداث</h2>
            <p className="border-1 border-[#5D24E1] text-[#5D24E1] w-6 h-6 text-sm text-center rounded-full flex items-center justify-center">
              {displayData.length}
            </p>
          </div>

          {/* <CirclePlus className="w-4 h-4 text-[#5D24E1] cursor-pointer" /> */}
        </div>

        <div className="flex flex-wrap gap-3 pb-2">
          {displayData.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 bg-white p-3 rounded-lg min-w-[120px] hover:shadow-md transition-shadow"
              title={item.note}
            >
              {getEventIcon(item.eventType)}
              <div className="flex flex-col">
                <p className="text-[14px] font-bold text-[#1F1F1F]">
                  {item.note}
                </p>
                <p className="text-[12px] text-gray-600">
                  {item.date}
                  {item.time && (
                    <>
                      {" • "}
                      <span className="text-[#5D24E1]">{item.time}</span>
                    </>
                  )}
                </p>
                {/* {item.employee && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    بواسطة: <span className="font-medium text-[#5D24E1]">{item.employee.fullName}</span>
                    {item.employee.department && (
                      <span className="text-gray-400"> ({item.employee.department})</span>
                    )}
                  </p>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsInfoStatus;
