'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import {
  useCarrierShipmentsQuery,
  useCarrierStatsQuery,
} from '@/services/shippingProviders';
import { formatNumber } from './formatNumber';
import { ShipmentsTable } from './ShipmentsTable';

const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

interface InProcessShipmentsContentProps {
  shippingCompanyId: number;
}

export function InProcessShipmentsContent({
  shippingCompanyId,
}: InProcessShipmentsContentProps) {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const { data: carriers = [] } = useCarrierStatsQuery({ from, to });
  const carrier = carriers.find((c) => c.shippingCompanyId === shippingCompanyId);

  const {
    data: shipmentsPage,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useCarrierShipmentsQuery(shippingCompanyId, {
    from,
    to,
    status: 'IN_PROCESS',
    page,
    limit,
  });

  const shipments = shipmentsPage?.data ?? [];
  const total = shipmentsPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (isSuccess && shipments.length === 0 && page > 1) {
      setPage(1);
    }
  }, [isSuccess, shipments.length, page]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="sm:px-8 py-4 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/shipping-providers"
            className="text-xs text-primary hover:underline w-fit"
          >
            رجوع إلى جهات الشحن
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              الشحنات الحالية - {carrier?.name ?? ''}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              طلبات لدى جهة الشحن لم تُسلَّم ولم تُرتجع بعد
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 border-b border-gray-100 pb-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">عدد الشحنات</span>
            <span className="text-lg font-bold text-gray-900">
              {formatNumber(carrier?.inTransitCount)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">صافي الشحنات الحالية</span>
            <span className="text-lg font-bold text-gray-900">
              {formatNumber(carrier?.inProcessNetAmount, 2)} جنيه
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">من</span>
            <span className="text-sm text-gray-700">{from ?? '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">إلى</span>
            <span className="text-sm text-gray-700">{to ?? '—'}</span>
          </div>
        </div>

        {isLoading ? (
          <PageLoading message="جاري تحميل الشحنات الحالية..." />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-gray-500">تعذر تحميل الشحنات</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                إعادة المحاولة
              </Button>
              <Link
                href="/dashboard/shipping-providers"
                className="text-sm text-primary hover:underline"
              >
                رجوع إلى جهات الشحن
              </Link>
            </div>
          </div>
        ) : total === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            لا توجد شحنات جارية لهذه الجهة في هذه الفترة
          </p>
        ) : (
          <>
            <div className="border border-gray-200 rounded-xl bg-white overflow-x-auto">
              <ShipmentsTable shipments={shipments} />
            </div>
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
              onPageSizeChange={(size) => {
                setLimit(Math.min(Math.max(size, MIN_PAGE_SIZE), MAX_PAGE_SIZE));
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
