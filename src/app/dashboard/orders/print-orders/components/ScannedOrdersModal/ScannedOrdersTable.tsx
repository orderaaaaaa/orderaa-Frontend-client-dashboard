'use client';

import React from 'react';
import { LiaTrashAltSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { ScannedOrdersTableProps } from '../../types';

function LoadingCard() {
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400">جاري التحقق...</span>
      </div>
    </div>
  );
}

export function ScannedOrdersTable({
  orders,
  onRemove,
  flashingCode,
  isScanLoading = false,
}: ScannedOrdersTableProps) {
  if (orders.length === 0 && !isScanLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
        لا توجد طلبات لعرضها تطابق كلمة البحث.
      </div>
    );
  }

  if (orders.length === 0 && isScanLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 text-lg">جاري التحقق من الطلب...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-3 gap-4">
        {isScanLoading && <LoadingCard />}
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
