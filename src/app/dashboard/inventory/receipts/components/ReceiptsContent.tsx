'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Scan, ScanLine, X } from 'lucide-react';
import { LiaFileInvoiceSolid, LiaSlidersHSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import SharedInvoiceCard, { InvoiceCardData } from '@/components/purchases/InvoiceCard';
import PaginationFooter from '@/components/ui/pagination-footer';
import PageLoading from '@/components/ui/page-loading';
import { formatDateToLocalDate } from '@/utils/dateRangeUtils';
import { useSupplierInvoicesQuery, useSuppliersQuery } from '@/services/suppliers';
import { useEmployeesQuery } from '@/services/employees';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { INVOICE_TYPE_LABEL } from '@/app/dashboard/purchases/constants';
import ReceiptsHeader from './ReceiptsHeader';
import ReceiptsSearchBar from './ReceiptsSearchBar';
import ReceiptsFilterBar from './ReceiptsFilterBar';
import ReceiptsActionsBar from './ReceiptsActionsBar';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { Receipt } from '../types';
import { useReceiptFilters } from '../hooks';
import { formatDate } from '../utils';

function toCardData(receipt: Receipt): InvoiceCardData {
  return {
    id: receipt.id,
    invoiceNumber: receipt.code,
    companyName: receipt.supplier.name,
    itemsCount: receipt.products.length,
    products: receipt.products.map((p) => ({
      name: p.product.name,
      quantity: p.quantity,
      price: p.price,
    })),
    employeeName: receipt.createdByEmployee
      ? getDepartmentLabel(receipt.createdByEmployee.department)
      : 'غير محدد',
    createdAt: receipt.createdAt,
    totalAmount: receipt.totalAmount,
    paymentAmount: receipt.paymentAmount,
    transactionType: INVOICE_TYPE_LABEL[receipt.type] ?? receipt.type,
    acceptanceStatus: '',
    imageUrl: receipt.images?.[0] ?? undefined,
  };
}

export function ReceiptsContent() {
  const [select, setSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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
  } = useReceiptFilters();

  const { data: suppliersData } = useSuppliersQuery({ limit: 200 });
  const suppliers = suppliersData?.data ?? [];

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ key: s.name, value: s.name })),
    [suppliers],
  );

  const { data: employeesData } = useEmployeesQuery();
  const employeeOptions = useMemo(
    () => (employeesData ?? []).map((e) => ({ key: String(e.id), value: e.fullName })),
    [employeesData],
  );

  const selectedSupplier = useMemo(
    () => filters.supplierName ? suppliers.find((s) => s.name === filters.supplierName) : undefined,
    [suppliers, filters.supplierName],
  );

  const apiType = (filters.transactionType || undefined) as 'PURCHASE' | 'RETURN' | 'PAID' | undefined;

  const totalAmountMin = filters.totalAmountFrom ? Number(filters.totalAmountFrom) : undefined;
  const totalAmountMax = filters.totalAmountTo ? Number(filters.totalAmountTo) : undefined;
  const employeeId = filters.employeeName ? Number(filters.employeeName) : undefined;

  const { data: invoicesData, isLoading } = useSupplierInvoicesQuery({
    page: currentPage,
    limit: pageSize,
    supplierId: selectedSupplier?.id,
    type: apiType,
    dateFrom: formatDateToLocalDate(filters.fromDate),
    dateTo: formatDateToLocalDate(filters.toDate),
    search: debouncedSearchQuery || undefined,
    totalAmountMin: !isNaN(totalAmountMin as number) ? totalAmountMin : undefined,
    totalAmountMax: !isNaN(totalAmountMax as number) ? totalAmountMax : undefined,
    createdByEmployeeId: !isNaN(employeeId as number) ? employeeId : undefined,
  });

  const receipts = (invoicesData?.data ?? []) as Receipt[];
  const meta = invoicesData?.meta;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchQuery,
    filters.supplierName,
    filters.transactionType,
    filters.totalAmountFrom,
    filters.totalAmountTo,
    filters.employeeName,
    filters.fromDate,
    filters.toDate,
  ]);

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
    (receiptId: number, checked: boolean) => {
      setSelectedIds((prev) =>
        checked ? [...prev, receiptId] : prev.filter((id) => id !== receiptId)
      );
    },
    []
  );

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
    if (filters.totalAmountFrom || filters.totalAmountTo) count++;
    if (filters.employeeName) count++;
    return count;
  }, [filters.supplierName, filters.transactionType, filters.totalAmountFrom, filters.totalAmountTo, filters.employeeName]);

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
              supplierOptions={supplierOptions}
              employeeOptions={employeeOptions}
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
        {isLoading ? (
          <PageLoading message="جاري تحميل الاستلامات..." />
        ) : receipts.length > 0 ? (
          receipts.map((receipt) => (
            <SharedInvoiceCard
              key={receipt.id}
              invoice={toCardData(receipt)}
              select={select}
              isSelected={selectedIds.includes(receipt.id)}
              onSelectionChange={(checked) =>
                handleSelectionChange(receipt.id, checked)
              }
              titleHref={`/dashboard/inventory/receipts/${receipt.id}`}
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

      <ReceiptsActionsBar
        selectedCount={selectedIds.length}
        isVisible={showActionsBar}
      />

    </div>
  );
}
