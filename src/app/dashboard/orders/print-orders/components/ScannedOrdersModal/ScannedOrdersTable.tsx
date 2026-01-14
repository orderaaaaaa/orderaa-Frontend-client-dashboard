'use client';

import React from 'react';
import { LiaTrashAltSolid } from 'react-icons/lia';
import { ScannedOrder } from '../../hooks/useScannedOrders';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

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
      <div className="grid grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order.code}
            className={clsx(
              'flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors',
              flashingCode === order.code && 'scan-flash-success'
            )}
          >
            <span className="text-lg font-medium">{order.code}</span>
            <Button
              variant="ghost"
              onClick={() => onRemove(order.code)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
              title="حذف الطلب"
            >
              <LiaTrashAltSolid className="size-5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
