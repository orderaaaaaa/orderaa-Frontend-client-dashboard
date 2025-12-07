import { Order, OrderEvent } from "@/types/orders";
import { PhoneOff, CirclePlus, History, CheckCircle2, XCircle, Clock } from "lucide-react";

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
  NEW_ORDER: 'طلب جديد',
  CALL_AGAIN: 'اعادة اتصال',
  STOPPED: 'متوقف',
  POSTPONED: 'مؤجل',
  REGISTERED: 'مسجل',
};

// Helper function to format time ago
const getTimeAgo = (date: string): string => {
  const eventDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - eventDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `منذ ${diffDays} يوم ${diffHours > 0 ? `و ${diffHours} ساعات` : ''}`;
  } else if (diffHours > 0) {
    return `منذ ${diffHours} ساعات`;
  } else if (diffMinutes > 0) {
    return `منذ ${diffMinutes} دقيقة`;
  } else {
    return 'الآن';
  }
};

// Helper function to get icon for event type
const getEventIcon = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case 'status_change':
    case 'confirmed':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'cancelled':
    case 'stopped':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'postponed':
    case 'pending':
      return <Clock className="w-4 h-4 text-orange-600" />;
    case 'call_attempt':
    case 'tried_to_reach':
      return <PhoneOff className="w-4 h-4 text-blue-600" />;
    default:
      return <History className="w-4 h-4 text-gray-600" />;
  }
};

function OrderDetailsInfoStatus({ order }: OrderDetailsInfoStatusProps) {
  // Use events from API if available, otherwise create default event
  const events = order.events && order.events.length > 0
    ? order.events.map(event => ({
      id: event.id,
      status: event.status ? (statusLabelMap[event.status] || event.status) : event.description || event.eventType,
      date: new Date(event.createdAt).toLocaleDateString('ar-EG'),
      time: getTimeAgo(event.createdAt),
      eventType: event.eventType,
      description: event.description,
    }))
    : [
      {
        id: 1,
        status: statusLabelMap[order.status] || order.status,
        date: new Date(order.createdAt).toLocaleDateString('ar-EG'),
        time: getTimeAgo(order.createdAt),
        eventType: 'created',
        description: 'تم إنشاء الطلب',
      },
    ];

  // Add number of tries if greater than 0
  const displayData = [...events];
  if (order.numberOfTriesToReach > 0 && !events.some(e => e.eventType === 'call_attempt')) {
    displayData.push({
      id: events.length + 1,
      status: "محاولات الوصول",
      date: `${order.numberOfTriesToReach} مرة`,
      time: "",
      eventType: 'call_attempt',
      description: `تم محاولة الاتصال ${order.numberOfTriesToReach} مرة`,
    });
  }

  return (
    <div className="max-sm:hidden">
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
              title={item.description}
            >
              {getEventIcon(item.eventType)}
              <div className="flex flex-col">
                <p className="text-[14px] font-bold text-[#1F1F1F]">
                  {item.status}
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsInfoStatus;
