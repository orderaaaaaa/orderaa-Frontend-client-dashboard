'use client';

import { useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import CopyableCode from '@/components/ui/copyable-code';
import { describeElapsedSince } from '@/utils/elapsed';
import {
  MISSING_ORDER_FAILURE_LABELS,
  MISSING_ORDER_MANUAL_SOURCE_LABEL,
  MISSING_ORDER_SOURCE_OPTIONS,
  MISSING_ORDER_STATUS_LABELS,
} from '@/constants/missingOrders';
import type { MissingOrderListItem } from '@/types/missing-orders';

const NOT_AVAILABLE = 'غير متوفر';

interface MissingOrdersTableProps {
  data: MissingOrderListItem[];
  isLoading: boolean;
  emptyMessage: string;
}

function missingOrderHref(row: MissingOrderListItem): string {
  if (row.status === 'RECOVERED' && row.recoveredOrder) {
    return `/dashboard/orders/allOrders?search=${row.recoveredOrder.code}`;
  }
  return `/dashboard/orders/missing/${row.id}`;
}

function stopRowClick(event: ReactMouseEvent<HTMLElement>) {
  event.stopPropagation();
}

export function MissingOrdersTable({ data, isLoading, emptyMessage }: MissingOrdersTableProps) {
  const router = useRouter();

  const columns = useMemo<DataTableColumn<Record<string, unknown>>[]>(
    () => [
      {
        key: 'customerName',
        header: 'اسم العميل',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          return row.customerName || NOT_AVAILABLE;
        },
      },
      {
        key: 'phone',
        header: 'رقم الهاتف',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          return row.phone || NOT_AVAILABLE;
        },
      },
      {
        key: 'format',
        header: 'المصدر',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          if (row.format === 'APP') return MISSING_ORDER_MANUAL_SOURCE_LABEL;
          const option = MISSING_ORDER_SOURCE_OPTIONS.find((o) => o.value === row.format);
          return option?.label ?? row.format ?? NOT_AVAILABLE;
        },
      },
      {
        key: 'failureCode',
        header: 'سبب الفشل',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          return MISSING_ORDER_FAILURE_LABELS[row.failureCode];
        },
      },
      {
        key: 'lastFailedAt',
        header: 'منذ',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          return describeElapsedSince(row.lastFailedAt);
        },
      },
      {
        key: 'failureCount',
        header: 'عدد المحاولات',
        className: 'text-center',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          return row.failureCount;
        },
      },
      {
        key: 'status',
        header: 'الحالة',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          return MISSING_ORDER_STATUS_LABELS[row.status];
        },
      },
      {
        key: 'actions',
        header: 'فتح',
        className: 'text-center',
        render: (_, rowData) => {
          const row = rowData as unknown as MissingOrderListItem;
          if (row.status === 'RECOVERED' && row.recoveredOrder) {
            return (
              <span onClick={stopRowClick}>
                <CopyableCode value={row.recoveredOrder.code} label="نسخ كود الطلب">
                  <Link
                    href={missingOrderHref(row)}
                    className="text-primary hover:underline font-semibold"
                  >
                    {row.recoveredOrder.code}
                  </Link>
                </CopyableCode>
              </span>
            );
          }
          return (
            <span onClick={stopRowClick}>
              <Link
                href={missingOrderHref(row)}
                className="text-primary hover:underline font-semibold"
              >
                فتح
              </Link>
            </span>
          );
        },
      },
    ],
    [],
  );

  const openRow = (rowData: Record<string, unknown>) => {
    router.push(missingOrderHref(rowData as unknown as MissingOrderListItem));
  };

  const renderMobileRow = (rowData: Record<string, unknown>) => {
    const row = rowData as unknown as MissingOrderListItem;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <span className="font-semibold text-foreground break-words min-w-0">
            {row.customerName || NOT_AVAILABLE}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {MISSING_ORDER_STATUS_LABELS[row.status]}
          </span>
        </div>
        <div className="text-muted-foreground">{row.phone || NOT_AVAILABLE}</div>
        <div className="text-muted-foreground">
          {MISSING_ORDER_FAILURE_LABELS[row.failureCode]}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{describeElapsedSince(row.lastFailedAt)}</span>
          <span onClick={stopRowClick}>
            <Link
              href={missingOrderHref(row)}
              className="text-primary hover:underline font-semibold text-sm"
            >
              فتح
            </Link>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-w-0">
      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        keyField="id"
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={openRow}
        renderMobileRow={renderMobileRow}
      />
    </div>
  );
}
