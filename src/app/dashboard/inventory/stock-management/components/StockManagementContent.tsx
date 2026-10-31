'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LiaArrowRightSolid,
  LiaBoxOpenSolid,
  LiaSearchSolid,
  LiaSlidersHSolid,
  LiaFileDownloadSolid,
  LiaFileExcelSolid,
  LiaFilePdfSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import PaginationFooter from '@/components/ui/pagination-footer';
import { FormSwitch } from '@/components/ui/form-switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StockFilters } from './StockFilters';
import { SummaryCards } from './SummaryCards';
import { StockScopeNotFound } from './StockScopeNotFound';
import { ProductStockTable } from './ProductStockTable';
import {
  StockListSkeleton,
  SummaryCardsSkeleton,
} from './StockManagementSkeleton';
import { useStockFilters } from '../hooks/useStockFilters';
import { useStockScopeSummary } from '../hooks/useStockScopeSummary';
import { exportStockToExcel, exportStockToPDF } from '../utils/exportStock';
import { formatStockNumber } from '../utils/formatNumber';
import {
  STOCK_MANAGEMENT_BASE_PATH,
  STOCK_OUT_OF_STOCK_QUERY_PARAM,
} from '../constants';
import type { StockScope } from '../types';

const EXPORT_HINT_TEXT = 'جارٍ تحميل بيانات المخزن قبل التصدير';
const EXPORT_HINT_ID = 'stock-export-hint';

interface StockManagementContentProps {
  scope: StockScope;
}

export function StockManagementContent({ scope }: StockManagementContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialOutOfStock =
    searchParams.get(STOCK_OUT_OF_STOCK_QUERY_PARAM) === '1';

  const scopeSummary = useStockScopeSummary(scope);
  const indicators = scopeSummary.indicators;

  const {
    filters,
    filteredProducts,
    hasActiveFilters,
    setSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
    outOfStockOnly,
    setOutOfStockOnly,
    clearAllFilters,
    refetch,
    pageSize,
    setPage,
    setPageSize,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isFetching,
    isError,
    error,
    productsError,
    colorOptions,
    sizeOptions,
    filterDtoBase,
  } = useStockFilters(scope, scopeSummary.indicators, { initialOutOfStock });

  const [showFilters, setShowFilters] = useState(false);
  const [filtersOverflow, setFiltersOverflow] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);

  const scrollToTop = useCallback(() => {
    const scrollTarget =
      containerRef.current?.closest('main') ?? document.scrollingElement;
    scrollTarget?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!pendingScrollRef.current) return;
    if (isFetching || isError) return;
    pendingScrollRef.current = false;
    scrollToTop();
  }, [isFetching, isError, scrollToTop]);

  const goToPage = useCallback(
    (next: number) => {
      pendingScrollRef.current = true;
      setPage(next);
    },
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      pendingScrollRef.current = true;
      setPageSize(size);
      setPage(1);
    },
    [setPage, setPageSize]
  );

  const writeOutOfStockParam = useCallback(
    (checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (checked) {
        params.set(STOCK_OUT_OF_STOCK_QUERY_PARAM, '1');
      } else {
        params.delete(STOCK_OUT_OF_STOCK_QUERY_PARAM);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const handleOutOfStockChange = useCallback(
    (checked: boolean) => {
      setOutOfStockOnly(checked);
      writeOutOfStockParam(checked);
    },
    [setOutOfStockOnly, writeOutOfStockParam]
  );

  const handleClearFilters = useCallback(() => {
    clearAllFilters();
    writeOutOfStockParam(false);
  }, [clearAllFilters, writeOutOfStockParam]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.color) count++;
    if (filters.size) count++;
    if (filters.timePeriod || filters.fromDate || filters.toDate) count++;
    return count;
  }, [
    filters.color,
    filters.size,
    filters.fromDate,
    filters.toDate,
    filters.timePeriod,
  ]);

  const handleExportExcel = useCallback(async () => {
    if (!scopeSummary.indicators) return;
    setIsExporting(true);
    try {
      await exportStockToExcel(filterDtoBase, scopeSummary.indicators);
    } finally {
      setIsExporting(false);
      setExportOpen(false);
    }
  }, [filterDtoBase, scopeSummary.indicators]);

  const handleExportPDF = useCallback(async () => {
    if (!scopeSummary.indicators) return;
    setIsExporting(true);
    try {
      await exportStockToPDF(filterDtoBase, scopeSummary.indicators);
    } finally {
      setIsExporting(false);
      setExportOpen(false);
    }
  }, [filterDtoBase, scopeSummary.indicators]);

  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || 'تعذر تحميل بيانات المخزن';

  const scopeNotFound =
    scopeSummary.notFound ||
    (productsError as { response?: { status?: number } } | null)?.response
      ?.status === 404;

  if (scopeNotFound) {
    return <StockScopeNotFound />;
  }

  const exportHint =
    !scopeSummary.indicators && !isExporting ? EXPORT_HINT_TEXT : null;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full overflow-x-hidden space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={STOCK_MANAGEMENT_BASE_PATH}
            className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <LiaArrowRightSolid className="size-4" />
            كل المخازن
          </Link>
          {scopeSummary.name === null && scopeSummary.isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <h1 className="truncate text-2xl font-bold text-gray-900">
              {scopeSummary.name ?? ''}
            </h1>
          )}
        </div>
        <Popover open={exportOpen} onOpenChange={setExportOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={exportHint ? 0 : undefined}
                aria-describedby={exportHint ? EXPORT_HINT_ID : undefined}
                className="inline-flex w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:w-auto"
              >
                <PopoverTrigger asChild>
                  <Button
                    disabled={isExporting || !scopeSummary.indicators}
                    className="h-10 w-full gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 text-white px-5 sm:h-9 sm:w-auto"
                  >
                    <LiaFileDownloadSolid className="size-5" />
                    {isExporting ? 'جاري التصدير...' : 'تصدير التقرير'}
                  </Button>
                </PopoverTrigger>
                {exportHint && (
                  <span id={EXPORT_HINT_ID} className="sr-only">
                    {exportHint}
                  </span>
                )}
              </span>
            </TooltipTrigger>
            {exportHint && <TooltipContent>{exportHint}</TooltipContent>}
          </Tooltip>
          <PopoverContent align="end" className="w-48 p-2">
            <Button
              variant="ghost"
              onClick={handleExportExcel}
              disabled={isExporting || !scopeSummary.indicators}
              className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LiaFileExcelSolid className="size-5 text-emerald-600" />
              تصدير Excel
            </Button>
            <Button
              variant="ghost"
              onClick={handleExportPDF}
              disabled={isExporting || !scopeSummary.indicators}
              className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LiaFilePdfSolid className="size-5 text-red-600" />
              تصدير PDF
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-card shadow-sm p-3 md:flex-row md:flex-wrap md:items-center md:border-0 md:bg-transparent md:shadow-none md:p-0">
          <div className="relative w-full px-1 md:w-auto md:min-w-[12rem] md:flex-1">
            <LiaSearchSolid className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-primary z-10" />
            <Input
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              clearable
              placeholder="بحث باسم المنتج أو SKU..."
              inputClassName="pr-10 bg-background"
            />
          </div>
          {scopeSummary.indicators?.outOfStock && (
            <label className="flex min-h-10 w-full shrink-0 items-center gap-2 text-sm font-medium text-gray-700 md:w-auto">
              <FormSwitch
                checked={outOfStockOnly}
                onCheckedChange={handleOutOfStockChange}
              />
              غير المتوفر فقط
            </label>
          )}
          <Button
            variant="outline"
            aria-label={
              activeFilterCount > 0
                ? `فلاتر متقدمة (${formatStockNumber(activeFilterCount)})`
                : 'فلاتر متقدمة'
            }
            className="h-10 w-full md:w-auto min-w-10 md:h-9 rounded-full font-semibold flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-5 relative"
            onClick={() => {
              setShowFilters((prev) => {
                if (prev) setFiltersOverflow(false);
                return !prev;
              });
            }}
          >
            <LiaSlidersHSolid className="w-5 h-5" />
            <span>فلاتر متقدمة</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -start-2 bg-card text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-primary/20">
                {formatStockNumber(activeFilterCount)}
              </span>
            )}
          </Button>
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: showFilters ? '1fr' : '0fr' }}
          onTransitionEnd={() => {
            if (showFilters) setFiltersOverflow(true);
          }}
        >
          <div className={filtersOverflow ? 'overflow-visible' : 'overflow-hidden'}>
            <StockFilters
              filters={filters}
              colorOptions={colorOptions}
              sizeOptions={sizeOptions}
              onFilterChange={setFilter}
              onClearFilter={clearFilter}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onTimePeriodChange={setTimePeriod}
            />
          </div>
        </div>
      </div>


      {scopeSummary.isLoading ? (
        <SummaryCardsSkeleton />
      ) : scopeSummary.items ? (
        <SummaryCards items={scopeSummary.items} />
      ) : null}

      {isLoading || !indicators ? (
        <StockListSkeleton count={pageSize} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <LiaBoxOpenSolid className="size-16 mb-4 text-red-300" />
          <p className="text-lg font-medium text-red-500">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 h-10 min-w-10 sm:h-9"
            onClick={() => refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <LiaBoxOpenSolid className="size-16 mb-4" />
          {hasActiveFilters ? (
            <>
              <p className="text-lg font-medium text-gray-500">
                لا توجد منتجات مطابقة
              </p>
              <p className="text-sm text-gray-400 mt-1">
                جرّب تغيير معايير البحث أو إزالة الفلاتر
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 h-10 min-w-10 sm:h-9"
                onClick={handleClearFilters}
              >
                إزالة الفلاتر
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-500">
                لا توجد منتجات في المخزن
              </p>
              <p className="text-sm text-gray-400 mt-1">
                قم بإضافة منتجات لتظهر هنا
              </p>
            </>
          )}
        </div>
      ) : (
        <div
          aria-busy={isFetching}
          className={clsx('space-y-6 transition-opacity', isFetching && 'opacity-60')}
        >
          {filteredProducts.map((product) => (
            <ProductStockTable
              key={product.id}
              product={product}
              filterColor={filters.color}
              filterSize={filters.size}
              indicators={indicators}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && totalPages > 0 && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={goToPage}
          onPrevious={() => goToPage(Math.max(1, currentPage - 1))}
          onNext={() => goToPage(Math.min(totalPages, currentPage + 1))}
          currentPageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
