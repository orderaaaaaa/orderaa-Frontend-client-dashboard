'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { describeElapsedSince } from '@/utils/elapsed';
import {
  MISSING_ORDER_FAILURE_LABELS,
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

export function MissingOrdersTable({ data, isLoading, emptyMessage }: MissingOrdersTableProps) {
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
              <Link
                href={`/dashboard/orders/allOrders?search=${row.recoveredOrder.code}`}
                className="text-primary hover:underline font-semibold"
              >
                {row.recoveredOrder.code}
              </Link>
            );
          }
          return (
            <Link
              href={`/dashboard/orders/missing/${row.id}`}
              className="text-primary hover:underline font-semibold"
            >
              فتح
            </Link>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data as unknown as Record<string, unknown>[]}
      keyField="id"
      isLoading={isLoading}
      emptyMessage={emptyMessage}
    />
  );
}
