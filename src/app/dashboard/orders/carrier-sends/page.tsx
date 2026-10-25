'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/dashboard-layout';
import PageLoading from '@/components/ui/page-loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHasPermission } from '@/hooks/usePermissions';
import {
  CARRIER_SEND_OPERATION_LABELS,
  CARRIER_SEND_STATE_LABELS,
} from '@/constants/carrierSends';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useCarrierSendsOpen } from '@/services/carrierSends';
import type { CarrierSendView } from '@/types/carrierSends';
import { formatDateTime } from '@/utils/format';

function CarrierSendRow({ row }: { row: CarrierSendView }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/orders/${row.orderId}`}
          className="font-bold text-primary hover:underline"
        >
          {row.orderCode}
        </Link>
        <span className="text-sm text-gray-700">
          {CARRIER_SEND_OPERATION_LABELS[row.operation]} · {row.targetCarrier}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">{CARRIER_SEND_STATE_LABELS[row.state]}</Badge>
        {row.held && <Badge variant="secondary">محجوز</Badge>}
        {row.stale && <Badge variant="destructive">متأخر</Badge>}
        <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>
      </div>
    </li>
  );
}

export default function CarrierSendsOpenPage() {
  const canRead = useHasPermission(PERMISSION_CODES.ORDERS_READ);
  const query = useCarrierSendsOpen({ enabled: canRead });
  const rows = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Breadcrumb items={[{ title: 'الطلبات' }, { title: 'إرساليات شركات الشحن المفتوحة' }]} />

      <div className="mt-6">
        {!canRead ? (
          <p className="text-sm text-gray-500 text-center py-10">ليس لديك صلاحية لعرض هذه الصفحة</p>
        ) : query.isLoading ? (
          <PageLoading message="جاري تحميل الإرساليات المفتوحة..." />
        ) : query.isError ? (
          <p className="text-sm text-red-600 text-center py-10">تعذر تحميل الإرساليات المفتوحة</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">لا توجد إرساليات مفتوحة</p>
        ) : (
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {rows.map((row) => (
                <CarrierSendRow key={row.id} row={row} />
              ))}
            </ul>
            {query.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  تحميل المزيد
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
