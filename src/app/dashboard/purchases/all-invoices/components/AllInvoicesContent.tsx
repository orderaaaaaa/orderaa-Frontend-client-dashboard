'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { formatDateToLocalDate } from '@/utils/dateRangeUtils';
import { Scan, ScanLine, X } from 'lucide-react';
import { LiaFileInvoiceSolid, LiaSlidersHSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import InvoicesHeader from './InvoicesHeader';
import InvoicesSearchBar from './InvoicesSearchBar';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import InvoicesFilterBar from './InvoicesFilterBar';
import InvoiceCard from './InvoiceCard';
import InvoiceDetailModal from './InvoiceDetailModal';
import InvoicesActionsBar from './InvoicesActionsBar';
import PaginationFooter from '@/components/ui/pagination-footer';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { Invoice } from '../types';
import { useInvoiceFilters } from '../hooks';
import { useSupplierInvoicesQuery, useSuppliersQuery } from '@/services/suppliers';

const TRANSACTION_TYPE_TO_API: Record<string, 'PURCHASE' | 'RETURN'> = {
  'مشتريات': 'PURCHASE',
  'مرتجع': 'RETURN',
};

export function AllInvoicesContent() {
  const [select, setSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersOverflow, setFiltersOverflow] = useState(false);

  const {
    filters,
    hasActiveFilters,
    debouncedSearchQuery,
    setSearchQuery,
    clearSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
  } = useInvoiceFilters();

  const { data: suppliersData } = useSuppliersQuery({ limit: 200 });
  const suppliers = suppliersData?.data ?? [];

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ key: s.nickname, value: s.nickname })),
    [suppliers],
  );

  const selectedSupplier = useMemo(
    () => filters.supplierName ? suppliers.find((s) => s.nickname === filters.supplierName) : undefined,
    [suppliers, filters.supplierName],
  );

  const apiType = filters.transactionType ? TRANSACTION_TYPE_TO_API[filters.transactionType] : undefined;

  const { data: invoicesData, isLoading } = useSupplierInvoicesQuery({
    page: currentPage,
    limit: pageSize,
    supplierId: selectedSupplier?.id,
    type: apiType,
    dateFrom: formatDateToLocalDate(filters.fromDate),
    dateTo: formatDateToLocalDate(filters.toDate),
  });

  const apiInvoices = (invoicesData?.data ?? []) as Invoice[];
  const meta = invoicesData?.meta;

  const invoicesToDisplay = useMemo(() => {
    let result = apiInvoices;

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((inv) =>
        inv.code.toLowerCase().includes(query) ||
        inv.supplier.name.toLowerCase().includes(query) ||
        inv.supplier.nickname.toLowerCase().includes(query),
      );
    }

    if (filters.totalAmount) {
      const amount = parseFloat(filters.totalAmount);
      if (!isNaN(amount)) {
        result = result.filter((inv) => inv.totalAmount === amount);
      }
    }

    if (filters.employeeName) {
      result = result.filter((inv) => inv.createdByEmployee?.department === filters.employeeName);
    }

    if (filters.acceptanceStatus) {
      result = result.filter((inv) => inv.acceptanceStatus === filters.acceptanceStatus);
    }

    return result;
  }, [apiInvoices, debouncedSearchQuery, filters.totalAmount, filters.employeeName, filters.acceptanceStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.supplierName, filters.transactionType, filters.fromDate, filters.toDate]);

  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 1;

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
    (invoiceId: number, checked: boolean) => {
      setSelectedIds((prev) =>
        checked ? [...prev, invoiceId] : prev.filter((id) => id !== invoiceId)
      );
    },
    []
  );

  const handleTitleClick = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  }, []);

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
    if (filters.transactionType) count++;
    if (filters.totalAmount) count++;
    if (filters.employeeName) count++;
    if (filters.acceptanceStatus) count++;
    return count;
  }, [filters.supplierName, filters.transactionType, filters.totalAmount, filters.employeeName, filters.acceptanceStatus]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">

      <InvoicesHeader />

      <div className="sm:px-8 py-3 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1">
            <InvoicesSearchBar
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
            <InvoicesFilterBar
              filters={filters}
              onFilterChange={setFilter}
              onClearFilter={clearFilter}
              supplierOptions={supplierOptions}
            />
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-center justify-between gap-3">
          <DateRangeFilter
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            timePeriod={filters.timePeriod}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onTimePeriodChange={setTimePeriod}
            className="px-3 sm:pe-8"
          />
          <div className="flex items-center gap-3">
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
                  تم تحديد {selectedIds.length} طلب
                </span>
              </div>
            )}
            <Button
              variant="default"
              className="rounded-full font-semibold flex items-center gap-3 px-5"
              onClick={handleToggleSelect}
            >
              تحديد
              {select ? (
                <ScanLine className="w-5 h-5" />
              ) : (
                <Scan className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="sm:px-8 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoicesToDisplay.length > 0 ? (
          invoicesToDisplay.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              select={select}
              isSelected={selectedIds.includes(invoice.id)}
              onSelectionChange={(checked) =>
                handleSelectionChange(invoice.id, checked)
              }
              onTitleClick={() => handleTitleClick(invoice)}
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
                  لا توجد فواتير
                </p>
                <p className="text-sm text-gray-400">
                  قم بانشاء فاتورة جديدة للبدء
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
          hasSelectedItems={showActionsBar}
        />
      </div>

      <InvoicesActionsBar
        selectedCount={selectedIds.length}
        isVisible={showActionsBar}
      />

      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
