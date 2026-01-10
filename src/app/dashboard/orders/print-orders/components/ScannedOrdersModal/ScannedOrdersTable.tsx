'use client';

import React from 'react';
import { LiaTrashAltSolid } from 'react-icons/lia';
import { ScannedOrder } from '../../hooks/useScannedOrders';
import { Button } from '@/components/ui/button';

interface ScannedOrdersTableProps {
  orders: ScannedOrder[];
  onRemove: (code: string) => void;
  flashingCode?: string | null;
}

export function ScannedOrdersTable({
  orders,
  onRemove,
  flashingCode,
}: ScannedOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
        لا توجد طلبات لعرضها تطابق كلمة البحث.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="text-right py-3 px-4 font-bold text-gray-700">
              كود الطلب
            </th>
            <th className="text-center py-3 px-4 font-bold text-gray-700 w-20">
              حذف
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.code}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${flashingCode === order.code ? 'scan-flash-success' : ''
                }`}
            >
              <td className="py-4 px-4 text-lg font-medium">{order.code}</td>
              <td className="py-4 px-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => onRemove(order.code)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="حذف الطلب"
                >
                  <LiaTrashAltSolid className="size-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
