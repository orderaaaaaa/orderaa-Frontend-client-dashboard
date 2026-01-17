'use client';

import React, { useMemo } from 'react';
import Input from '@/components/ui/Input';
import {
  LiaSearchSolid,
  LiaTimesSolid,
  LiaTrashAltSolid,
  LiaArrowRightSolid,
} from 'react-icons/lia';
import { ScannedOrdersTable } from './ScannedOrdersTable';
import PrintOrdersActionsBar from '../PrintOrdersActionsBar';
import { Button } from '@/components/ui/button';
import { ScannedOrdersModalProps } from '../../types';

function ChangeProductTable({
  orders,
  packagingNotes,
  onPackagingNoteChange,
  onRemove,
}: {
  orders: { id: number; code: string; scannedAt: Date }[];
  packagingNotes: Record<string, string>;
  onPackagingNoteChange: (code: string, note: string) => void;
  onRemove: (code: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
        لا توجد طلبات لعرضها
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-1/4">
                كود الطلب
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                ملاحظة التغليف
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-16">
                حذف
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.code} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {order.code}
                </td>
                <td className="px-4 py-3">
                  <Input
                    value={packagingNotes[order.code] || ''}
                    onChange={(e) =>
                      onPackagingNoteChange(order.code, e.target.value)
                    }
                    placeholder="أدخل ملاحظة التغليف..."
                    inputClassName="text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-center">
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
    </div>
  );
}

export function ScannedOrdersModal({
  isOpen,
  onClose,
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
  isScanLoading = false,
  flashingCode,
  isChangeProductMode = false,
  packagingNotes = {},
  onPackagingNoteChange,
  onChangeProductSubmit,
}: ScannedOrdersModalProps) {
  const allFieldsFilled = useMemo(() => {
    if (!isChangeProductMode) return true;
    return scannedOrders.every(
      (order) => packagingNotes[order.code]?.trim().length > 0
    );
  }, [isChangeProductMode, scannedOrders, packagingNotes]);

  if (!isOpen) return null;

  const handleChangeProductClick = () => {
    if (isChangeProductMode) {
      onChangeProductSubmit?.();
    } else {
      onChangeProduct?.();
    }
  };

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
        <h2 className="text-xl font-bold text-black">
          {isChangeProductMode ? 'تغيير المنتج' : 'الطلبات المحددة'}
        </h2>
        <div className="absolute left-8 flex items-center gap-3 text-gray-700">
          <span className="text-lg font-medium">عدد الطلبات</span>
          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-primary text-white text-sm font-bold">
            {scannedOrders.length}
          </span>
        </div>
      </div>

      {isChangeProductMode ? (
        <>
          <div className="px-8 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onChangeProduct}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="رجوع"
              >
                <LiaArrowRightSolid className="size-5" />
              </Button>
              <p className="text-sm text-amber-600 mt-2 mr-10">
                يجب إدخال ملاحظة التغليف لجميع الطلبات
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-4">
            <ChangeProductTable
              orders={filteredOrders}
              packagingNotes={packagingNotes}
              onPackagingNoteChange={onPackagingNoteChange || (() => { })}
              onRemove={onRemoveOrder}
            />
          </div>
        </>
      ) : (
        <>
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
            <ScannedOrdersTable
              orders={filteredOrders}
              onRemove={onRemoveOrder}
              flashingCode={flashingCode}
              isScanLoading={isScanLoading}
            />
          </div>
        </>
      )}

      <PrintOrdersActionsBar
        forceShow
        position="static"
        isLoading={isLoading}
        disableActions={
          scannedOrders.length === 0 ||
          (isChangeProductMode && !allFieldsFilled)
        }
        onPrepared={isChangeProductMode ? undefined : onPrepared}
        onAwaitingPackaging={isChangeProductMode ? undefined : onAwaitingPackaging}
        onCallAgain={isChangeProductMode ? undefined : onCallAgain}
        onChangeProduct={handleChangeProductClick}
        className="flex-shrink-0"
        isChangeProductMode={isChangeProductMode}
      />
    </div>
  );
}
