'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LiaBoxOpenSolid,
  LiaSearchSolid,
  LiaSlidersHSolid,
  LiaFileDownloadSolid,
  LiaFileExcelSolid,
  LiaFilePdfSolid,
} from 'react-icons/lia';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import PaginationFooter from '@/components/ui/pagination-footer';
import { StockFilters } from './StockFilters';
import { SummaryCards } from './SummaryCards';
import { ProductStockTable } from './ProductStockTable';
import {
  StockListSkeleton,
  SummaryCardsSkeleton,
} from './StockManagementSkeleton';
import { useStockFilters } from '../hooks/useStockFilters';
import { exportStockToExcel, exportStockToPDF } from '../utils/exportStock';

export function StockManagementContent() {
  const { user } = useAuthStore();
  const {
    filters,
    filteredProducts,
    totalProducts,
    totalQuantity,
    lowStockCount,
    hasActiveFilters,
    setSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
    pageSize,
    setPage,
    setPageSize,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isAnalysisLoading,
    isError,
    error,
    colorOptions,
    sizeOptions,
    filterDtoBase,
  } = useStockFilters();

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.color) count++;
    if (filters.size) count++;
    if (filters.fromDate || filters.toDate) count++;
    if (filters.timePeriod) count++;
    return count;
  }, [
    filters.color,
    filters.size,
    filters.fromDate,
    filters.toDate,
    filters.timePeriod,
  ]);

  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportStockToExcel(filterDtoBase);
    } finally {
      setIsExporting(false);
      setExportOpen(false);
    }
  }, [filterDtoBase]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportStockToPDF(filterDtoBase);
    } finally {
      setIsExporting(false);
      setExportOpen(false);
    }
  }, [filterDtoBase]);

  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || 'تعذر تحميل بيانات المخزن';

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full overflow-x-hidden space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.name || 'ادارة المخزن'}
        </h1>
        <Popover open={exportOpen} onOpenChange={setExportOpen}>
          <PopoverTrigger asChild>
            <Button
              disabled={isExporting}
              className="gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 text-white px-5"
            >
              <LiaFileDownloadSolid className="size-5" />
              {isExporting ? 'جاري التصدير...' : 'تصدير التقرير'}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2">
            <Button
              variant="ghost"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LiaFileExcelSolid className="size-5 text-emerald-600" />
              تصدير Excel
            </Button>
            <Button
              variant="ghost"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LiaFilePdfSolid className="size-5 text-red-600" />
              تصدير PDF
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-3">
          <div className="relative flex-1 min-w-0 px-1">
            <LiaSearchSolid className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-primary z-10" />
            <Input
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              clearable
              placeholder="بحث باسم المنتج أو SKU..."
              inputClassName="pr-10 bg-white"
            />
          </div>
          <Button
            variant="default"
            className="rounded-full font-semibold flex items-center gap-2 text-xs sm:text-sm px-5 relative"
            onClick={() => {
              setShowFilters((prev) => {
                if (prev) setFiltersOverflow(false);
                return !prev;
              });
            }}
          >
            <LiaSlidersHSolid className="w-5 h-5" />
            فلاتر متقدمة
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -left-2 bg-white text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-primary/20">
                {activeFilterCount}
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

      {isAnalysisLoading ? (
        <SummaryCardsSkeleton />
      ) : (
        <SummaryCards
          totalProducts={totalProducts}
          totalQuantity={totalQuantity}
          lowStockCount={lowStockCount}
        />
      )}

      {isFetching ? (
        <StockListSkeleton count={pageSize} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <LiaBoxOpenSolid className="size-16 mb-4 text-red-300" />
          <p className="text-lg font-medium text-red-500">{errorMessage}</p>
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
        <div className="space-y-6">
          {filteredProducts.map((product) => (
            <ProductStockTable
              key={product.id}
              product={product}
              filterColor={filters.color}
              filterSize={filters.size}
            />
          ))}
        </div>
      )}

      {!isFetching && !isError && totalPages > 0 && (
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
