'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/dashboard-layout';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Button } from '@/components/ui/button';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useMissingOrdersQuery } from '@/services/missingOrders';
import { formatDateToISO } from '@/utils/dateRangeUtils';
import type { MissingOrderStatusFilter } from '@/types/missing-orders';
import { MissingOrdersFilters } from './components/MissingOrdersFilters';
import { MissingOrdersTable } from './components/MissingOrdersTable';

function readStatus(value: string | null): MissingOrderStatusFilter {
  if (value === 'OPEN' || value === 'RECOVERED' || value === 'DISMISSED' || value === 'ALL') {
    return value;
  }
  return 'OPEN';
}

function readFormat(value: string | null): 'EASYORDER' | 'SHOPIFY' | undefined {
  if (value === 'EASYORDER' || value === 'SHOPIFY') return value;
  return undefined;
}

function readNumber(value: string | null, fallback: number): number {
  const n = value ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function MissingOrdersContent() {
  const canRead = useHasPermission(PERMISSION_CODES.ORDERS_MISSING_READ);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = readStatus(searchParams.get('status'));
  const format = readFormat(searchParams.get('format'));
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const page = readNumber(searchParams.get('page'), 1);
  const limit = readNumber(searchParams.get('limit'), 20);

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filters = useMemo(
    () => ({
      status,
      format,
      from: fromParam ?? undefined,
      to: toParam ?? undefined,
      page,
      limit,
    }),
    [status, format, fromParam, toParam, page, limit],
  );

  const { data, isLoading, isError, refetch } = useMissingOrdersQuery(filters);

  if (!canRead) {
    return (
      <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4">
        <p className="text-sm text-gray-500 text-center py-12">
          ليس لديك صلاحية لعرض قائمة المفقودات
        </p>
      </div>
    );
  }

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const emptyMessage =
    status === 'OPEN' ? 'لا توجد طلبات مفقودة حاليا' : 'لا توجد نتائج لهذا الفلتر';

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <Breadcrumb items={[{ title: 'الطلبات' }, { title: 'قائمة المفقودات' }]} />

      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">قائمة المفقودات</h1>
      </div>

      <MissingOrdersFilters
        status={status}
        onStatusChange={(v) => updateParams({ status: v === 'OPEN' ? undefined : v, page: undefined })}
        format={format}
        onFormatChange={(v) => updateParams({ format: v, page: undefined })}
        fromDate={fromParam ? new Date(fromParam) : null}
        toDate={toParam ? new Date(toParam) : null}
        onFromDateChange={(d) => updateParams({ from: formatDateToISO(d), page: undefined })}
        onToDateChange={(d) => updateParams({ to: formatDateToISO(d), page: undefined })}
      />

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-sm text-gray-500">تعذر تحميل قائمة المفقودات</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <>
          <MissingOrdersTable data={rows} isLoading={isLoading} emptyMessage={emptyMessage} />

          {!isLoading && rows.length > 0 && (
            <PaginationFooter
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              hasNextPage={page < totalPages}
              hasPreviousPage={page > 1}
              onPageChange={(p) => updateParams({ page: String(p) })}
              onPrevious={() => updateParams({ page: String(Math.max(1, page - 1)) })}
              onNext={() => updateParams({ page: String(Math.min(totalPages, page + 1)) })}
              currentPageSize={limit}
              onPageSizeChange={(size) => updateParams({ limit: String(size), page: undefined })}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function MissingOrdersPage() {
  return (
    <Suspense fallback={<PageLoading message="جاري تحميل قائمة المفقودات..." />}>
      <MissingOrdersContent />
    </Suspense>
  );
}
