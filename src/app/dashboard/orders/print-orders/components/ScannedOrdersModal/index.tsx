'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import { LiaSearchSolid } from 'react-icons/lia';
import { ScannedOrder } from '../../hooks/useScannedOrders';
import { ScannedOrdersTable } from './ScannedOrdersTable';
import PrintOrdersActionsBar from '../PrintOrdersActionsBar';

interface ScannedOrdersModalProps {
  isOpen: boolean;
  scannedOrders: ScannedOrder[];
  onRemoveOrder: (code: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredOrders: ScannedOrder[];
  onPrepared: () => void;
  onAwaitingPackaging: () => void;
  onCallAgain: () => void;
  onChangeProduct: () => void;
  isLoading: boolean;
  flashingCode?: string | null;
}

export function ScannedOrdersModal({
  isOpen,
  scannedOrders,
  onRemoveOrder,
  searchQuery,
  onSearchChange,
  filteredOrders,
  onPrepared,
  onAwaitingPackaging,
  onCallAgain,
  onChangeProduct,
  isLoading,
  flashingCode,
}: ScannedOrdersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-white flex flex-col"
    >
      <div
        className="h-[60px] flex items-center justify-center px-8 flex-shrink-0"
        style={{
          background:
            'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
        }}
      >
        <h2 className="text-xl font-bold text-black">الطلبات الممسوحة</h2>
        <div className="absolute left-8 flex items-center gap-2 text-gray-600">
          <span className="text-sm">عدد الطلبات: {scannedOrders.length}</span>
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

      <div className="flex-1 overflow-hidden px-8 py-4">
        <ScannedOrdersTable
          orders={filteredOrders}
          onRemove={onRemoveOrder}
          flashingCode={flashingCode}
        />
      </div>

      <PrintOrdersActionsBar
        forceShow
        position="static"
        isLoading={isLoading}
        disableActions={scannedOrders.length === 0}
        onPrepared={onPrepared}
        onAwaitingPackaging={onAwaitingPackaging}
        onCallAgain={onCallAgain}
        onChangeProduct={onChangeProduct}
        className="flex-shrink-0"
      />
    </div>
  );
}
