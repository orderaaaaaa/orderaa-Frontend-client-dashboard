'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Breadcrumb } from '@/components/dashboard-layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import CopyButton from '@/components/ui/copy-button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import PaginationFooter from '@/components/ui/pagination-footer';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDate, formatNumber } from '@/utils/format';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useShortfallSettlementsQuery,
  type ShortfallFilter,
} from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';
import SettleShortfallDialog, {
  type ShortfallSettlementRow,
} from '@/app/dashboard/orders/settlement/components/SettleShortfallDialog';

type FilterValue = ShortfallFilter;

const SHORTFALL_PAGE_SIZE = 20;
const MONEY = { minFractionDigits: 2, maxFractionDigits: 2 };
const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: 'pending', label: 'معلق' },
  { value: 'finished', label: 'منتهي' },
  { value: 'all', label: 'الكل' },
];

const formatAmount = (value: number) => formatNumber(value, MONEY);

export default function ShortfallSettlementPage() {
  // Adjusting a settlement hits PATCH /orders/settlement/:orderId/adjust.
  const canManageSettlement = useHasPermission(PERMISSION_CODES.ORDERS_SETTLEMENT_MANAGE);
  const [filter, setFilter] = useState<FilterValue>('pending');
  const [page, setPage] = useState(1);
  const limit = SHORTFALL_PAGE_SIZE;
  const [settleRowId, setSettleRowId] = useState<number | null>(null);
  const shortfallQuery = useShortfallSettlementsQuery(filter, page, limit);
  const rows: ShortfallSettlementRow[] = shortfallQuery.data?.data ?? [];
  const total = shortfallQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const loading = shortfallQuery.isFetching && !shortfallQuery.data;
  const loadFailed = shortfallQuery.isError && !shortfallQuery.isFetching;
  const isSwitching = shortfallQuery.isPlaceholderData;
  const loadError = shortfallQuery.error;
  const settleRow = useMemo(
    () => shortfallQuery.data?.data.find((r) => r.id === settleRowId) ?? null,
    [shortfallQuery.data, settleRowId]
  );

  useEffect(() => {
    if (canManageSettlement && loadError) {
      toast.error(getApiErrorMessage(loadError, 'فشل في تحميل بيانات التحصيل'));
    }
  }, [canManageSettlement, loadError]);

  useEffect(() => {
    if (shortfallQuery.data && !shortfallQuery.isPlaceholderData && page > totalPages) {
      setPage(totalPages);
    }
  }, [shortfallQuery.data, shortfallQuery.isPlaceholderData, page, totalPages]);

  const handleFilterChange = (value: FilterValue) => {
    setFilter(value);
    setPage(1);
  };

  const renderStatusPill = (row: ShortfallSettlementRow) => (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        row.settlementResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {row.settlementResolved ? 'منتهي' : 'معلق'}
    </span>
  );

  const renderAmount = (row: ShortfallSettlementRow) =>
    row.settlementAmount === null ? (
      '—'
    ) : (
      <span dir="ltr">{formatAmount(Number(row.settlementAmount))} جنيه</span>
    );

  const renderSettleButton = (row: ShortfallSettlementRow) => (
    <Button
      variant="outline"
      size="sm"
      className="max-sm:h-10"
      disabled={row.settlementAmount === null}
      onClick={() => setSettleRowId(row.id)}
    >
      تسوية
    </Button>
  );

  const renderMobileRow = (row: ShortfallSettlementRow) => (
    <div className="flex flex-col gap-2 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/dashboard/orders/${row.id}`}
            className="font-mono font-semibold text-primary hover:underline truncate"
          >
            {row.code}
          </Link>
          <CopyButton value={row.code} label="نسخ كود الطلب" />
        </div>
        {renderStatusPill(row)}
      </div>
      {[
        { label: 'تاريخ التحصيل', value: formatDate(row.settlementRecordedAt) },
        { label: 'إجمالي الطلب', value: `${formatAmount(row.totalCost)} جنيه` },
        { label: 'مبلغ التحصيل', value: renderAmount(row) },
      ].map((field) => (
        <div key={field.label} className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{field.label}</span>
          <span>{field.value}</span>
        </div>
      ))}
      {canManageSettlement && <div className="pt-1">{renderSettleButton(row)}</div>}
    </div>
  );

  const columns: DataTableColumn<ShortfallSettlementRow>[] = [
    {
      key: 'code',
      header: 'كود الطلب',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/orders/${row.id}`}
            className="text-primary hover:underline font-mono"
          >
            {row.code}
          </Link>
          <CopyButton value={row.code} label="نسخ كود الطلب" />
        </div>
      ),
    },
    {
      key: 'settlementRecordedAt',
      header: 'تاريخ التحصيل',
      render: (_value, row) => formatDate(row.settlementRecordedAt),
    },
    {
      key: 'totalCost',
      header: 'إجمالي الطلب',
      render: (_value, row) => `${formatAmount(row.totalCost)} جنيه`,
    },
    {
      key: 'settlementAmount',
      header: 'مبلغ التحصيل',
      render: (_value, row) => renderAmount(row),
    },
    {
      key: 'settlementResolved',
      header: 'الحالة',
      render: (_value, row) => renderStatusPill(row),
    },
    ...(canManageSettlement
      ? [
          {
            key: 'id',
            header: 'إجراءات',
            render: (_value: unknown, row: ShortfallSettlementRow) => renderSettleButton(row),
          },
        ]
      : []),
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <Breadcrumb
        items={[
          { title: 'التحصيلات' },
          { title: 'تحصيل ناقص' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">تحصيل ناقص</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            طلبات تم تحصيلها بمبلغ سالب وتحتاج تسوية
          </p>
        </div>

        <div className="flex gap-2">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'outline'}
              size="sm"
              aria-pressed={filter === tab.value}
              className="rounded-full text-xs px-4 max-sm:h-10 max-sm:flex-1"
              onClick={() => handleFilterChange(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {!canManageSettlement ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">
            ليس لديك صلاحية لعرض التحصيل الناقص
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">جاري تحميل التحصيل الناقص...</p>
        </div>
      ) : loadFailed ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-red-700 text-sm font-semibold">تعذر تحميل التحصيل الناقص</p>
          <Button variant="outline" size="sm" onClick={() => shortfallQuery.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <div
          aria-busy={isSwitching}
          className={isSwitching ? 'opacity-60 transition-opacity' : 'transition-opacity'}
        >
          <DataTable
            columns={columns}
            data={rows}
            keyField="id"
            isLoading={false}
            emptyMessage={
              filter === 'pending'
                ? 'لا توجد طلبات تحصيل ناقص معلقة'
                : 'لا توجد نتائج لهذا الفلتر'
            }
            renderMobileRow={renderMobileRow}
          />
        </div>
      )}

      {!loadFailed && total > 0 && (
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          hasNextPage={page < totalPages}
          hasPreviousPage={page > 1}
          onPageChange={setPage}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          currentPageSize={limit}
        />
      )}

      <SettleShortfallDialog
        key={settleRowId ?? 'none'}
        rowId={settleRowId}
        row={settleRow}
        listLoaded={shortfallQuery.data !== undefined}
        formatAmount={formatAmount}
        onClose={() => setSettleRowId(null)}
      />
    </div>
  );
}
