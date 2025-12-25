import React from 'react';
import { LuHistory } from 'react-icons/lu';

interface OrdersTabProps {
  orders: any[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const getRelativeTime = (dateString: string) => {
    const past = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - past.getTime();

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return `منذ ${days} يوم، ${hours} ساعات`;
  };

  return (
    <div className="mt-6 w-full flex flex-col gap-4" dir="rtl">
      {/* Table Header Card */}
      <div className="grid grid-cols-7 items-center bg-white border border-gray-100 rounded-xl py-4 px-6 text-gray-500 text-sm font-medium">
        <div className="text-center">رقم الطلب</div>
        <div className="text-center">التاريخ</div>
        <div className="text-center">الحالة</div>
        <div className="text-center">عدد القطع</div>
        <div className="text-center">تاريخ الطلب</div>
        <div className="text-center">المبلغ</div>
        <div className="text-center">ملاحظات</div>
      </div>

      {/* Order Data Cards */}
      {orders?.map((order) => (
        <div
          key={order.id}
          className="grid grid-cols-7 items-center bg-white border border-gray-100 rounded-2xl py-8 px-6 hover:border-blue-100 transition-colors"
        >
          {/* Order Code */}
          <div className="text-center text-gray-800 font-medium text-sm break-all px-2">
            {order.code}
          </div>

          {/* Date */}
          <div className="text-center text-gray-600 text-sm">
            {new Date(order.createdAt).toLocaleDateString('en-GB')}
          </div>

          {/* Status */}
          <div className="flex justify-center">
            <span
              className={`px-6 py-1.5 rounded-full text-xs font-bold border uppercase ${
                order.status === 'SHIPPING'
                  ? 'bg-blue-50 text-blue-500 border-blue-50'
                  : 'bg-blue-50 text-blue-600 border-blue-50'
              }`}
            >
              {order.status === 'DELIVERED' ? 'تم التوصيل' : order.status}
            </span>
          </div>

          {/* Item Count */}
          <div className="text-center text-gray-800 text-sm">
            {order.order_products?.reduce(
              (sum: number, item: any) => sum + (item.quantity || 1),
              0
            )}
          </div>

          {/* Missing Col: Order Date (Relative) */}
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <LuHistory className="text-purple-500 text-lg" />
            <span>{getRelativeTime(order.createdAt)}</span>
          </div>

          {/* Amount */}
          <div className="text-center text-gray-900 font-bold text-base">
            {order.totalCost}
          </div>

          {/* Notes */}
          <div className="text-center text-gray-500 text-sm truncate px-2">
            {order.notes || 'تم التوصيل بنجاح'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersTab;
