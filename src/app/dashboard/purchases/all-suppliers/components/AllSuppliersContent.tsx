'use client';

import { useState, useCallback, useMemo } from 'react';
import { LiaUsersSolid, LiaSlidersHSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import SuppliersHeader from './SuppliersHeader';
import SuppliersSearchBar from './SuppliersSearchBar';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import SuppliersFilterBar from './SuppliersFilterBar';
import SupplierCard from './SupplierCard';
import PaginationFooter from '@/components/ui/pagination-footer';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useSupplierFilters } from '../hooks';
import { useSuppliersQuery } from '@/services/suppliers';

export function AllSuppliersContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersOverflow, setFiltersOverflow] = useState(false);

  const {
    filters,
    debouncedSearchQuery,
    hasActiveFilters,
    setSearchQuery,
    clearSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
  } = useSupplierFilters();

  const dateFrom = filters.fromDate
    ? filters.fromDate.toISOString().split('T')[0]
    : undefined;
  const dateTo = filters.toDate
    ? filters.toDate.toISOString().split('T')[0]
    : undefined;

  const { data: suppliersData, isLoading } = useSuppliersQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery || undefined,
    dateFrom,
    dateTo,
  });

  const apiSuppliers = suppliersData?.data ?? [];
  const meta = suppliersData?.meta;
  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const supplierOptions = useMemo(
    () => apiSuppliers.map((s) => ({ key: s.nickname, value: s.nickname })),
    [apiSuppliers],
  );

  const filteredSuppliers = useMemo(() => {
    return apiSuppliers.filter((supplier) => {
      if (filters.supplierName && supplier.nickname !== filters.supplierName) return false;

      if (filters.remainingAmount) {
        if (filters.remainingAmount === 'دائن' && supplier.remaining >= 0) return false;
        if (filters.remainingAmount === 'مدين' && supplier.remaining <= 0) return false;
        if (filters.remainingAmount === 'لا يوجد' && supplier.remaining !== 0) return false;
      }

      if (filters.paidAmount) {
        const [min, max] = filters.paidAmount.includes('+')
          ? [parseFloat(filters.paidAmount), Infinity]
          : filters.paidAmount.split('-').map(Number);
        if (supplier.paidAmount < min || supplier.paidAmount > max) return false;
      }

      if (filters.invoicesCount) {
        const [min, max] = filters.invoicesCount.includes('+')
          ? [parseFloat(filters.invoicesCount), Infinity]
          : filters.invoicesCount.split('-').map(Number);
        if (supplier.invoiceCount < min || supplier.invoiceCount > max) return false;
      }

      return true;
    });
  }, [apiSuppliers, filters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.supplierName) count++;
    if (filters.remainingAmount) count++;
    if (filters.paidAmount) count++;
    if (filters.invoicesCount) count++;
    return count;
  }, [filters.supplierName, filters.remainingAmount, filters.paidAmount, filters.invoicesCount]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <SuppliersHeader />

      <div className="sm:px-8 py-3 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1">
            <SuppliersSearchBar
              value={filters.searchQuery}
              onChange={setSearchQuery}
              onClear={clearSearchQuery}
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
            <SuppliersFilterBar
              filters={filters}
              onFilterChange={setFilter}
              onClearFilter={clearFilter}
              supplierOptions={supplierOptions}
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-start gap-4">
          <DateRangeFilter
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            timePeriod={filters.timePeriod}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onTimePeriodChange={setTimePeriod}
            className="px-3 sm:pe-8"
          />
        </div>
      </div>

      <div className="sm:px-8 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <LiaUsersSolid className="w-16 h-16 text-gray-300" />
            {hasActiveFilters ? (
              <>
                <p className="text-lg font-semibold text-gray-400">
                  لا توجد نتائج
                </p>
                <p className="text-sm text-gray-400">
                  لا توجد نتائج مطابقة للبحث أو الفلاتر المحددة
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-400">
                  لا يوجد موردين
                </p>
                <p className="text-sm text-gray-400">
                  قم بإضافة مورد جديد للبدء
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasNextPage={meta?.hasNextPage ?? false}
          hasPreviousPage={meta?.hasPreviousPage ?? false}
          onPageChange={handlePageChange}
          onPrevious={() => handlePageChange(Math.max(1, currentPage - 1))}
          onNext={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          currentPageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
