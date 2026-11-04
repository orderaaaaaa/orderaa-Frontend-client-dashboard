'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CopyableCode from '@/components/ui/copyable-code';
import PageLoading from '@/components/ui/page-loading';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import type { SettlementBatchOrder } from '@/lib/api/settlement';
import {
  SettlementShippingColumnCells,
  SettlementShippingColumnHeaders,
} from './SettlementShippingColumns';
import {
  SettlementMobileList,
  SettlementMobileRow,
} from './SettlementMobileList';

interface SettlementBatchOrdersPanelProps {
  orders: SettlementBatchOrder[];
  isLoading: boolean;
  emptyText?: string;
  onEdit: (row: SettlementBatchOrder) => void;
  onRemove: (row: SettlementBatchOrder) => void;
}

export default function SettlementBatchOrdersPanel({
  orders,
  isLoading,
  emptyText = 'لا توجد طلبات في هذا التحصيل',
  onEdit,
  onRemove,
}: SettlementBatchOrdersPanelProps) {
  const { getStatusLabel } = useStatusLabel();

  if (isLoading) {
    return <PageLoading size="sm" className="py-6 min-h-0" />;
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">{emptyText}</p>
    );
  }

  return (
    <>
      <SettlementMobileList>
        {orders.map((row) => {
          const moved = row.currentStatus !== row.targetStatus;
          return (
            <SettlementMobileRow
              key={row.orderId}
              fields={[
                {
                  label: 'كود الطلب',
                  value: (
                    <span className="flex flex-wrap items-center gap-2 font-mono">
                      <CopyableCode value={row.orderCode} label="نسخ كود الطلب">
                        <Link
                          href={`/dashboard/orders/${row.orderId}`}
                          className="text-primary-text hover:underline"
                        >
                          {row.orderCode}
                        </Link>
                      </CopyableCode>
                      {row.isDeleted && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-sans">
                          محذوف
                        </span>
                      )}
                    </span>
                  ),
                },
                { label: 'المبلغ في هذا التحصيل', value: <span className="font-semibold">{row.amount}</span> },
                {
                  label: 'كود الشحن',
                  value: (
                    <CopyableCode value={row.shippingCode} label="نسخ كود الشحن">
                      <span className="font-mono">{row.shippingCode ?? '—'}</span>
                    </CopyableCode>
                  ),
                },
                { label: 'العميل', value: row.customerName ?? '—' },
                { label: 'الحالة وقتها', value: getStatusLabel(row.fromStatus) || '—' },
                {
                  label: 'الحالة الآن',
                  value: (
                    <span className={moved ? 'text-amber-700 font-semibold' : undefined}>
                      {getStatusLabel(row.currentStatus)}
                    </span>
                  ),
                },
              ]}
              shipping={row.shipping}
              actions={
                row.isDeleted ? undefined : (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 flex-1"
                      onClick={() => onEdit(row)}
                    >
                      تعديل المبلغ
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 flex-1"
                      onClick={() => onRemove(row)}
                    >
                      إزالة
                    </Button>
                  </>
                )
              }
            />
          );
        })}
      </SettlementMobileList>
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
              <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
              <th className="px-4 py-2 text-right font-medium">العميل</th>
              <th className="px-4 py-2 text-right font-medium">الحالة وقتها</th>
              <th className="px-4 py-2 text-right font-medium">الحالة الآن</th>
              <SettlementShippingColumnHeaders
                betweenTotalAndCost={
                  <th className="px-4 py-2 text-right font-medium">المبلغ في هذا التحصيل</th>
                }
              />
              <th className="px-4 py-2 text-right font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row) => {
              // Showing both is the point: an order can move on after
              // it was settled.
              const moved = row.currentStatus !== row.targetStatus;
              return (
                <tr key={row.orderId} className="border-t">
                  <td className="px-4 py-2 font-mono">
                    <CopyableCode value={row.orderCode} label="نسخ كود الطلب">
                      <Link
                        href={`/dashboard/orders/${row.orderId}`}
                        className="text-primary-text hover:underline"
                      >
                        {row.orderCode}
                      </Link>
                    </CopyableCode>
                    {row.isDeleted && (
                      <span className="mr-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        محذوف
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono">
                    <CopyableCode value={row.shippingCode} label="نسخ كود الشحن">
                      {row.shippingCode ?? '—'}
                    </CopyableCode>
                  </td>
                  <td className="px-4 py-2">{row.customerName ?? '—'}</td>
                  <td className="px-4 py-2">{getStatusLabel(row.fromStatus) || '—'}</td>
                  <td
                    className={`px-4 py-2 ${moved ? 'text-amber-700 font-semibold' : ''}`}
                  >
                    {getStatusLabel(row.currentStatus)}
                    {moved && <ChevronLeft className="inline w-3 h-3 mr-1" />}
                  </td>
                  <SettlementShippingColumnCells
                    shipping={row.shipping}
                    betweenTotalAndCost={
                      <td className="px-4 py-2 font-semibold">{row.amount}</td>
                    }
                  />
                  <td className="px-4 py-2">
                    {!row.isDeleted && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                          تعديل المبلغ
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onRemove(row)}>
                          إزالة
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
