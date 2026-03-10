'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scan, ScanLine, X } from 'lucide-react';
import { LiaFileInvoiceSolid, LiaSlidersHSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import ReceiptsHeader from './ReceiptsHeader';
import ReceiptsSearchBar from './ReceiptsSearchBar';
import ReceiptsFilterBar from './ReceiptsFilterBar';
import ReceiptsActionsBar from './ReceiptsActionsBar';
import SharedInvoiceCard from '@/components/purchases/InvoiceCard';
import PaginationFooter from '@/components/ui/pagination-footer';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { Receipt } from '../types';
import { useReceiptFilters } from '../hooks';
import { formatDate } from '../utils';

export function ReceiptsContent() {
  const router = useRouter();
  const [select, setSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersOverflow, setFiltersOverflow] = useState(false);

  const {
    filters,
    filteredReceipts,
    hasActiveFilters,
    setSearchQuery,
    clearSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
  } = useReceiptFilters();

  const totalItems = filteredReceipts.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReceipts.slice(start, start + pageSize);
  }, [currentPage, pageSize, filteredReceipts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredReceipts.length]);

  const showActionsBar = select && selectedIds.length > 0;

  useEffect(() => {
    if (showActionsBar) {
      document.body.style.paddingBottom = '80px';
    } else {
      document.body.style.paddingBottom = '0px';
    }
    return () => {
      document.body.style.paddingBottom = '0px';
    };
  }, [showActionsBar]);

  const handleToggleSelect = useCallback(() => {
    setSelect((prev) => {
      if (prev) {
        setSelectedIds([]);
      }
      return !prev;
    });
  }, []);

  const handleSelectionChange = useCallback(
    (receiptId: number, checked: boolean) => {
      setSelectedIds((prev) =>
        checked ? [...prev, receiptId] : prev.filter((id) => id !== receiptId)
      );
    },
    []
  );

  const handleTitleClick = useCallback((receipt: Receipt) => {
    router.push(`/dashboard/inventory/receipts/${receipt.id}`);
  }, [router]);

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
    if (filters.fromDate) count++;
    if (filters.itemsCount) count++;
    if (filters.employeeName) count++;
    return count;
  }, [filters.supplierName, filters.fromDate, filters.itemsCount, filters.employeeName]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">

      <ReceiptsHeader />

      <div className="sm:px-8 py-3 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1">
            <ReceiptsSearchBar
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
            <ReceiptsFilterBar
              filters={filters}
              onFilterChange={setFilter}
              onClearFilter={clearFilter}
              onFromDateChange={setFromDate}
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between gap-4">
          <DateRangeFilter
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            timePeriod={filters.timePeriod}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onTimePeriodChange={setTimePeriod}
            className="px-3 sm:pe-8"
          />
          <div className="flex flex-row items-center gap-3">
            {select && selectedIds.length > 0 && (
              <div className="flex flex-row items-center justify-center gap-2">
                <X
                  onClick={() => {
                    setSelectedIds([]);
                    setSelect(false);
                  }}
                  className="cursor-pointer text-primary h-5 w-5"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  تم تحديد {selectedIds.length} استلام
                </span>
              </div>
            )}
            <div
              className="bg-primary flex flex-row items-center justify-center gap-3 px-5 py-2 rounded-full cursor-pointer text-white whitespace-nowrap"
              onClick={handleToggleSelect}
            >
              <p>تحديد</p>
              <div>
                {select ? (
                  <ScanLine className="text-white w-5 h-5" />
                ) : (
                  <Scan className="text-white w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:px-8 flex flex-col gap-4">
        {paginatedReceipts.length > 0 ? (
          paginatedReceipts.map((receipt) => (
            <SharedInvoiceCard
              key={receipt.id}
              invoice={receipt}
              select={select}
              isSelected={selectedIds.includes(receipt.id)}
              onSelectionChange={(checked) =>
                handleSelectionChange(receipt.id, checked)
              }
              onTitleClick={() => handleTitleClick(receipt)}
              formatDate={formatDate}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <LiaFileInvoiceSolid className="w-16 h-16 text-gray-300" />
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
                  لا توجد استلامات
                </p>
                <p className="text-sm text-gray-400">
                  لا توجد استلامات حالياً
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
          hasNextPage={currentPage < totalPages}
          hasPreviousPage={currentPage > 1}
          onPageChange={handlePageChange}
          onPrevious={() => handlePageChange(Math.max(1, currentPage - 1))}
          onNext={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          currentPageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          hasSelectedItems={showActionsBar}
        />
      </div>

      <ReceiptsActionsBar
        selectedCount={selectedIds.length}
        isVisible={showActionsBar}
      />

    </div>
  );
}
