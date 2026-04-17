'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import {
  LiaSearchSolid,
  LiaTimesSolid,
  LiaTrashAltSolid,
  LiaArrowRightSolid,
} from 'react-icons/lia';
import { ScannedOrdersTable } from './ScannedOrdersTable';
import { Button } from '@/components/ui/button';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import {
  ORDER_STATUS_ARABIC_LABELS,
  ORDER_STATUS_CHART_COLORS,
} from '../../../constants/statusMappings';
import type {
  ScannedOrder,
  NonConfirmedGroup,
  ScannedOrdersModalProps,
} from '../../types/scannedOrders';

function ChangeProductTable({
  orders,
  packagingNotes,
  onPackagingNoteChange,
  onRemove,
}: {
  orders: ScannedOrder[];
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

function NonConfirmedSection({
  groups,
  onRemove,
  onForceActionable,
}: {
  groups: NonConfirmedGroup[];
  onRemove: (code: string) => void;
  onForceActionable?: (orderId: number) => void;
}) {
  if (groups.length === 0) return null;

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-700 mb-4">
        طلبات بحالات أخرى
      </h3>
      <div className="flex flex-wrap gap-4">
        {groups.map((group) => {
          const statusLabel =
            ORDER_STATUS_ARABIC_LABELS[group.status] || group.status;
          const statusColor =
            ORDER_STATUS_CHART_COLORS[group.status] || '#9ca3af';

          return (
            <div
              key={group.status}
              className="border border-gray-200 rounded-lg overflow-hidden w-full self-start"
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ backgroundColor: `${statusColor}15` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: statusColor }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <span
                  className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: statusColor }}
                >
                  {group.orders.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {group.orders.map((order) => (
                  <div
                    key={order.code}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-gray-800">
                        {order.code}
                      </span>
                      {onForceActionable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onForceActionable(order.id)}
                          className="h-7 px-2.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                        >
                          نقل للتنفيذ
                        </Button>
                      )}
                      {order.packagingWarning && (
                        <span className="text-xs text-amber-600 truncate">
                          ({order.packagingWarning})
                        </span>
                      )}
                      {group.status === 'CANCELLED' && order.cancelReason && (
                        <span className="text-xs text-red-500 truncate">
                          ({order.cancelReason})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        onClick={() => onRemove(order.code)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                        title="حذف الطلب"
                      >
                        <LiaTrashAltSolid className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScannedOrdersModal({
  isOpen,
  onClose,
  title = 'الطلبات المحددة',
  scannedOrders,
  actionableOrders,
  actionableFilteredGroups,
  actionableFilteredOrders,
  nonConfirmedGroups,
  onRemoveOrder,
  onForceActionable,
  searchQuery,
  onSearchChange,
  isScanLoading = false,
  flashingCode,
  actionsBar,
  showChangeProductMode = false,
  isChangeProductMode = false,
  onChangeProductBack,
  packagingNotes = {},
  onPackagingNoteChange,
}: ScannedOrdersModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const inChangeProductMode = showChangeProductMode && isChangeProductMode;

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
          {inChangeProductMode ? 'تغيير المنتج' : title}
        </h2>
        <div className="absolute left-8 flex items-center gap-3 text-gray-700">
          <span className="text-lg font-medium">عدد الطلبات</span>
          <span className="inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-full bg-primary text-white text-xl font-bold">
            {actionableOrders.length}
          </span>
          <span className="text-sm text-gray-500">
            ({scannedOrders.length - actionableOrders.length} حالات أخرى)
          </span>
        </div>
      </div>

      {inChangeProductMode ? (
        <>
          <div className="px-8 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onChangeProductBack}
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
              orders={actionableFilteredOrders}
              packagingNotes={packagingNotes}
              onPackagingNoteChange={onPackagingNoteChange || (() => {})}
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
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 h-full">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  طلبات جاهزة للتنفيذ
                </h3>
                <div className="flex flex-wrap gap-4">
                  {actionableFilteredGroups.map((group) => {
                    const statusLabel =
                      ORDER_STATUS_ARABIC_LABELS[group.status] || group.status;
                    const statusColor =
                      ORDER_STATUS_CHART_COLORS[group.status] || '#9ca3af';

                    return (
                      <div
                        key={group.status}
                        className="border border-gray-200 rounded-lg overflow-hidden w-full self-start"
                      >
                        <div
                          className="flex items-center justify-between px-4 py-2.5"
                          style={{ backgroundColor: `${statusColor}15` }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: statusColor }}
                            />
                            <span
                              className="text-sm font-semibold"
                              style={{ color: statusColor }}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <span
                            className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: statusColor }}
                          >
                            {group.orders.length}
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {group.orders.map((order) => (
                            <div
                              key={order.code}
                              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-800">
                                {order.code}
                              </span>
                              <Button
                                variant="ghost"
                                onClick={() => onRemoveOrder(order.code)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                title="حذف الطلب"
                              >
                                <LiaTrashAltSolid className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {actionableFilteredGroups.length === 0 && isScanLoading && (
                  <ScannedOrdersTable
                    orders={[]}
                    onRemove={onRemoveOrder}
                    isScanLoading={isScanLoading}
                    searchQuery={searchQuery}
                  />
                )}
              </div>
              {nonConfirmedGroups.length > 0 && (
                <>
                  <div className="hidden lg:block w-px bg-gray-200 flex-shrink-0" />
                  <div className="border-t border-gray-200 pt-4 lg:border-t-0 lg:pt-0 flex-1 min-w-0">
                    <NonConfirmedSection
                      groups={nonConfirmedGroups}
                      onRemove={onRemoveOrder}
                      onForceActionable={onForceActionable}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex-shrink-0">{actionsBar}</div>
    </div>
  );
}
