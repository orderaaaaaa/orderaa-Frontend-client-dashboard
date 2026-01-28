'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import { LiaSearchSolid, LiaTimesSolid, LiaTrashAltSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { ShippingActionsBar } from '../ShippingActionsBar';
import { ShippingScannedOrder } from '../../hooks/useShippingScannedOrders';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ShippingScannedOrdersTableProps {
  orders: ShippingScannedOrder[];
  onRemove: (code: string) => void;
  flashingCode?: string | null;
  isScanLoading?: boolean;
}

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

function ShippingScannedOrdersTable({
  orders,
  onRemove,
  flashingCode,
  isScanLoading = false,
}: ShippingScannedOrdersTableProps) {
  if (orders.length === 0 && !isScanLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
        لا توجد طلبات لعرضها
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

interface ShippingScannedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedOrders: ShippingScannedOrder[];
  onRemoveOrder: (code: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredOrders: ShippingScannedOrder[];
  onShip: () => void;
  isLoading: boolean;
  isScanLoading?: boolean;
  flashingCode?: string | null;
}

export function ShippingScannedOrdersModal({
  isOpen,
  onClose,
  scannedOrders,
  onRemoveOrder,
  searchQuery,
  onSearchChange,
  filteredOrders,
  onShip,
  isLoading,
  isScanLoading = false,
  flashingCode,
}: ShippingScannedOrdersModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col">
      <div
        className="h-[60px] flex items-center justify-center px-8 flex-shrink-0 relative"
        style={{
          background:
            'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
        }}
      >
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute right-8 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <LiaTimesSolid className="size-5" />
        </Button>
        <h2 className="text-xl font-bold text-black">الطلبات للشحن</h2>
        <div className="absolute left-8 flex items-center gap-3 text-gray-700">
          <span className="text-lg font-medium">عدد الطلبات</span>
          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-primary text-white text-sm font-bold">
            {scannedOrders.length}
          </span>
        </div>
      </div>

      <div className="px-8 py-4 border-b border-gray-200">
        <div className="relative max-w-md">
          <LiaSearchSolid className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-primary z-10" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            clearable
            placeholder="بحث بكود الطلب..."
            inputClassName="pr-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4">
        <ShippingScannedOrdersTable
          orders={filteredOrders}
          onRemove={onRemoveOrder}
          flashingCode={flashingCode}
          isScanLoading={isScanLoading}
        />
      </div>

      <ShippingActionsBar
        forceShow
        position="static"
        isLoading={isLoading}
        disableActions={scannedOrders.length === 0}
        onShip={onShip}
        selectedCount={scannedOrders.length}
        className="flex-shrink-0"
      />
    </div>
  );
}
