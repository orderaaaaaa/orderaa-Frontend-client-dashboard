'use client';

import { formatDate } from '@/utils/format';
import React from 'react';
import { LuHistory } from 'react-icons/lu';
import { getStatusColor } from '../../../lib/getBadgeColor';
import { formatAmount } from '../../../lib/formatAmount';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getTimeAgo } from '@/utils/timeAgo';
import { CustomerDetailOrder } from '../../../types/customer';

interface OrdersTabProps {
  orders: CustomerDetailOrder[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const { getStatusLabel } = useStatusLabel();

  const renderStatus = (status: string) => (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusColor(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );

  return (
    <div className="w-full" dir="rtl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1 h-8 bg-primary rounded-full"></div>
        <h2 className="text-lg font-bold text-gray-900">سجل الطلبات</h2>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-6">
          لا توجد طلبات لهذا العميل
        </p>
      ) : (
        <>
          <ul className="md:hidden flex flex-col gap-3 pb-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm text-gray-800 break-all min-w-0">
                    {order.code}
                  </span>
                  {renderStatus(order.status)}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                  <span>{formatDate(order.createdAt)}</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <LuHistory className="text-purple-500 text-base" aria-hidden />
                    {getTimeAgo(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-600">
                    القطع: <span className="font-medium text-gray-900">{order.order_products.length}</span>
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatAmount(order.totalCost)}
                  </span>
                </div>
                {order.notes && (
                  <p className="text-xs text-gray-500 break-words">
                    ملاحظات: {order.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden md:block overflow-x-auto pb-4">
            <div className="min-w-[760px] flex flex-col gap-3">
              <div className="grid grid-cols-7 items-center bg-white border border-gray-100 rounded-xl py-3 px-4 text-gray-500 text-xs font-medium">
                <div className="text-center">رقم الطلب</div>
                <div className="text-center">التاريخ</div>
                <div className="text-center">الحالة</div>
                <div className="text-center">القطع</div>
                <div className="text-center">تاريخ الطلب</div>
                <div className="text-center">المبلغ</div>
                <div className="text-center">ملاحظات</div>
              </div>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-7 items-center bg-white border border-gray-100 rounded-xl py-5 px-4 hover:border-blue-100 transition-colors"
                >
                  <div className="text-center text-gray-800 font-medium text-xs break-all px-1">
                    {order.code}
                  </div>
                  <div className="text-center text-gray-600 text-xs">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="flex justify-center">
                    {renderStatus(order.status)}
                  </div>
                  <div className="text-center text-gray-800 text-xs">
                    {order.order_products.length}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-[10px]">
                    <LuHistory className="text-purple-500 text-base" aria-hidden />
                    <span>{getTimeAgo(order.createdAt)}</span>
                  </div>
                  <div className="text-center text-gray-900 font-bold text-sm">
                    {formatAmount(order.totalCost)}
                  </div>
                  <div className="text-center text-gray-500 text-xs px-1">
                    {order.notes || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersTab;
