'use client';

import React from 'react';
import { LuHistory } from 'react-icons/lu';
import { getStatusColor } from '../../../lib/getBadgeColor';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getTimeAgo } from '@/utils/timeAgo';

interface OrdersTabProps {
  orders: any[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const { getStatusLabel } = useStatusLabel();

  return (
    <div className="w-full" dir="rtl">
      <div className="overflow-x-auto pb-4">
        <div className="mb-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-[#5D24E1] rounded-full"></div>
            <h1 className="text-lg font-bold text-gray-900">سجل الطلبات</h1>
          </div>
        </div>
        {/* Force a minimum width so the table columns remain readable */}
        <div className="min-w-[850px] flex flex-col gap-3">
          {/* Table Header */}
          <div className="grid grid-cols-7 items-center bg-white border border-gray-100 rounded-xl py-3 px-4 text-gray-500 text-xs font-medium">
            <div className="text-center">رقم الطلب</div>
            <div className="text-center">التاريخ</div>
            <div className="text-center">الحالة</div>
            <div className="text-center">القطع</div>
            <div className="text-center">تاريخ الطلب</div>
            <div className="text-center">المبلغ</div>
            <div className="text-center">ملاحظات</div>
          </div>

          {/* Data Rows */}
          {orders?.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-7 items-center bg-white border border-gray-100 rounded-xl py-5 px-4 hover:border-blue-100 transition-colors"
            >
              <div className="text-center text-gray-800 font-medium text-xs break-all px-1">
                {order.code}
              </div>
              <div className="text-center text-gray-600 text-xs">
                {new Date(order.createdAt).toLocaleDateString('en-GB')}
              </div>

              {/* Updated Status Badge Logic */}
              <div className="flex justify-center">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="text-center text-gray-800 text-xs">
                {order.order_products?.reduce(
                  (sum: number, item: any) => sum + (item.quantity || 1),
                  0
                )}
              </div>
              <div className="flex items-center justify-center gap-1 text-gray-500 text-[10px]">
                <LuHistory className="text-purple-500 text-base" />
                <span>{getTimeAgo(order.createdAt)}</span>
              </div>
              <div className="text-center text-gray-900 font-bold text-sm">
                {order.totalCost}
              </div>
              <div className="text-center text-gray-500 text-xs  px-1">
                {order.notes || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
