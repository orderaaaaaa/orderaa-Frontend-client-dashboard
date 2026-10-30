'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, ClipboardCheck, FileCheck2 } from 'lucide-react';
import { ActorChip, type ActorChipActor } from '@/components/audit/ActorChip';
import { VarianceChip } from '@/components/stock/VarianceChip';
import { WarehouseSelect } from '@/components/stock/WarehouseSelect';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { KpiCard, KpiCardSkeleton } from '@/components/ui/kpi-card';
import PaginationFooter from '@/components/ui/pagination-footer';
import ToggleGroup from '@/components/ui/toggle-group';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useStocktakesQuery } from '@/services/stocktake';
import { useWarehouseOptions } from '@/services/warehouses';
import { formatDateTime, formatStockNumber } from '@/utils/format';
import type {
  StocktakePersonDto,
  StocktakeStatusWire,
  StocktakeSummaryDto,
} from '../../types/stocktake';
import { StartStocktakeDialog } from './StartStocktakeDialog';
import { StocktakeAccessDenied } from './StocktakeAccessDenied';
import { StocktakeStatusChip } from './StocktakeStatusChip';
import { stocktakeSheetHref } from './stocktakeRoutes';

const PAGE_SIZE = 25;
const COUNT_PROBE_LIMIT = 1;
const WAREHOUSE_PARAM = 'warehouseId';

type StatusFilter = 'ALL' | StocktakeStatusWire;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'OPEN', label: 'مفتوحة' },
  { value: 'POSTED', label: 'مرحّلة' },
  { value: 'CANCELLED', label: 'ملغاة' },
];

const actorOf = (ref: StocktakePersonDto | null): ActorChipActor =>
  ref
    ? { kind: 'EMPLOYEE', id: ref.id, name: ref.name }
    : { kind: 'UNKNOWN', id: null, name: null };

const countText = (probe: { data?: { total: number }; isError: boolean }): string =>
  probe.data && !probe.isError ? formatStockNumber(probe.data.total) : '—';

const parseWarehouseId = (raw: string | null): number | null => {
  const id = Number(raw);
  return raw !== null && Number.isInteger(id) && id > 0 ? id : null;
};

export function StocktakeListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canRead = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_READ);
  const canManage = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_MANAGE);
  const warehouseOptions = useWarehouseOptions();

  const warehouseId = parseWarehouseId(searchParams.get(WAREHOUSE_PARAM));
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [startOpen, setStartOpen] = useState(false);

  const listQuery = useStocktakesQuery(
    {
      warehouseId: warehouseId ?? undefined,
      status: status === 'ALL' ? undefined : status,
      page,
      limit: PAGE_SIZE,
    },
    canRead,
  );
  const openProbe = useStocktakesQuery(
    { warehouseId: warehouseId ?? undefined, status: 'OPEN', limit: COUNT_PROBE_LIMIT },
    canRead,
  );
  const postedProbe = useStocktakesQuery(
    { warehouseId: warehouseId ?? undefined, status: 'POSTED', limit: COUNT_PROBE_LIMIT },
    canRead,
  );

  if (!canRead) {
    return <StocktakeAccessDenied />;
  }

  const onWarehouseChange = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(WAREHOUSE_PARAM, String(id));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setPage(1);
  };

  const onStatusChange = (next: StatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  const rows = listQuery.data?.data ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;

  const columns: DataTableColumn<StocktakeSummaryDto>[] = [
    {
      key: 'id',
      header: 'الجلسة',
      render: (_value, row) => (
        <span dir="ltr" className="font-semibold tabular-nums">
          #{row.id}
        </span>
      ),
    },
    {
      key: 'warehouse',
      header: 'المخزن',
      render: (_value, row) => row.warehouse.name,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (_value, row) => <StocktakeStatusChip status={row.status} />,
    },
    {
      key: 'countedCount',
      header: 'المعدود / الأسطر',
      render: (_value, row) => (
        <span dir="ltr" className="tabular-nums">
          {formatStockNumber(row.countedCount)} / {formatStockNumber(row.lineCount)}
        </span>
      ),
    },
    {
      key: 'changedCount',
      header: 'الأسطر المتغيرة',
      render: (_value, row) => (
        <span dir="ltr" className="tabular-nums">
          {formatStockNumber(row.changedCount)}
        </span>
      ),
    },
    {
      key: 'netDelta',
      header: 'صافي الفرق',
      render: (_value, row) =>
        row.status === 'CANCELLED' ? (
          <span className="text-gray-400">—</span>
        ) : (
          <VarianceChip delta={row.netDelta} />
        ),
    },
    {
      key: 'createdBy',
      header: 'بدأها',
      render: (_value, row) => <ActorChip actor={actorOf(row.createdBy)} />,
    },
    {
      key: 'createdAt',
      header: 'تاريخ البدء',
      render: (_value, row) => (
        <span dir="ltr" className="tabular-nums">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'postedAt',
      header: 'تاريخ الترحيل',
      render: (_value, row) =>
        row.postedAt ? (
          <span dir="ltr" className="tabular-nums">
            {formatDateTime(row.postedAt)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <StockPageHeader
        title="جرد المخزون"
        subtitle="جلسة لكل مخزن: تُسجَّل الأعداد، ثم تُرحَّل الفروقات دفعة واحدة"
        breadcrumbs={[
          { label: 'إدارة المخزن', href: '/dashboard/inventory/stock-management' },
          { label: 'جرد المخزون' },
        ]}
        actions={
          canManage ? (
            <Button onClick={() => setStartOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              بدء جرد جديد
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {openProbe.isLoading || postedProbe.isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label="جلسات مفتوحة"
              value={<span dir="ltr">{countText(openProbe)}</span>}
              icon={<ClipboardCheck className="size-5" aria-hidden="true" />}
              accent="primary"
            />
            <KpiCard
              label="جلسات مرحّلة (كل الفترات)"
              value={<span dir="ltr">{countText(postedProbe)}</span>}
              icon={<FileCheck2 className="size-5" aria-hidden="true" />}
              accent="chart2"
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-72">
          <WarehouseSelect
            value={warehouseId}
            onChange={onWarehouseChange}
            source={warehouseOptions}
            includeHidden
            placeholder="كل المخازن"
          />
        </div>
        <ToggleGroup
          options={STATUS_OPTIONS}
          value={status}
          onChange={onStatusChange}
        />
      </div>

      {listQuery.isError ? (
        <ErrorState
          error={listQuery.error}
          fallback="تعذر تحميل جلسات الجرد"
          onRetry={() => listQuery.refetch()}
        />
      ) : (
        <DataTable<StocktakeSummaryDto>
          columns={columns}
          data={rows}
          isLoading={listQuery.isLoading}
          skeletonRows={6}
          onRowClick={(row) => router.push(stocktakeSheetHref(row.id))}
          emptyContent={
            <EmptyState
              title="لا توجد جلسات جرد"
              description="ابدأ جلسة جرد لمعرفة الفروقات بين العد والرصيد"
            />
          }
        />
      )}

      {!listQuery.isError && (
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={listQuery.data?.total ?? 0}
          hasNextPage={page < totalPages}
          hasPreviousPage={page > 1}
          onPageChange={setPage}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
          currentPageSize={PAGE_SIZE}
        />
      )}

      {startOpen && (
        <StartStocktakeDialog
          initialWarehouseId={warehouseId}
          onClose={() => setStartOpen(false)}
        />
      )}
    </div>
  );
}
