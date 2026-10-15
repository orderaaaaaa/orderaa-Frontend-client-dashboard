'use client';

import { useState, useCallback, useRef } from 'react';
import { formatDateToLocalDate } from '@/utils/dateRangeUtils';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import PaginationFooter from '@/components/ui/pagination-footer';
import SelectModeControls from '@/components/purchases/SelectModeControls';
import { ErrorState } from '@/components/ui/state-panels';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { Supplier } from '../../types';
import { useSupplierInvoicesQuery } from '@/services/suppliers';
import type { SupplierInvoiceApiItem, PaginationMeta } from '@/lib/api/suppliers';
import SupplierDetailHeader from './SupplierDetailHeader';
import SupplierInvoiceCard from './SupplierInvoiceCard';
import SupplierInvoicesActionsBar from './SupplierInvoicesActionsBar';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { exportSupplierInvoicesToExcel } from '../utils';

interface SupplierDetailContentProps {
  supplier: Supplier;
  initialInvoicesData?: { data: SupplierInvoiceApiItem[]; meta: PaginationMeta };
}

export function SupplierDetailContent({ supplier, initialInvoicesData }: SupplierDetailContentProps) {
  const [select, setSelect] = useState(false);
  const [selectedById, setSelectedById] = useState<Map<number, SupplierInvoiceApiItem>>(
    () => new Map(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('');

  const {
    data: invoicesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useSupplierInvoicesQuery({
    supplierId: supplier.id,
    page: currentPage,
    limit: pageSize,
    dateFrom: formatDateToLocalDate(fromDate),
    dateTo: formatDateToLocalDate(toDate),
  });

  const matchesInitialKey =
    currentPage === 1 &&
    pageSize === DEFAULT_PAGE_SIZE &&
    !fromDate &&
    !toDate;
  const data =
    invoicesData ?? (matchesInitialKey ? initialInvoicesData : undefined);
  const showLoading = isLoading && !data;
  const showError = isError && !data;
  const lastMetaRef = useRef<PaginationMeta | undefined>(undefined);
  if (data?.meta) lastMetaRef.current = data.meta;
  const invoices = data?.data ?? [];
  const meta = data?.meta ?? lastMetaRef.current;
  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const showActionsBar = select && selectedById.size > 0;

  const handleToggleSelect = useCallback(() => {
    setSelect((prev) => {
      if (prev) setSelectedById(new Map());
      return !prev;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedById(new Map());
    setSelect(false);
  }, []);

  const handleSelectionChange = useCallback(
    (invoice: SupplierInvoiceApiItem, checked: boolean) => {
      setSelectedById((prev) => {
        const next = new Map(prev);
        if (checked) {
          next.set(invoice.id, invoice);
        } else {
          next.delete(invoice.id);
        }
        return next;
      });
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleExportExcel = useCallback(() => {
    exportSupplierInvoicesToExcel(Array.from(selectedById.values()), supplier.name);
  }, [selectedById, supplier.name]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="px-4 sm:px-8 pt-4 pb-2">
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          timePeriod={timePeriod}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onTimePeriodChange={setTimePeriod}
        />
      </div>

      <SupplierDetailHeader supplier={supplier} />

      <div className="px-4 sm:px-8 py-3 flex flex-col gap-4">
        <div className="flex flex-row items-center justify-end">
          <SelectModeControls
            active={select}
            selectedCount={selectedById.size}
            countLabel="فاتورة"
            onToggle={handleToggleSelect}
            onClear={handleClearSelection}
          />
        </div>
      </div>

      <div className="px-4 sm:px-8 flex flex-col gap-4">
        {showLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : showError ? (
          <ErrorState
            error={error}
            fallback="تعذّر تحميل فواتير المورد"
            onRetry={() => {
              refetch();
            }}
          />
        ) : invoices.length > 0 ? (
          invoices.map((invoice) => (
            <SupplierInvoiceCard
              key={invoice.id}
              invoice={invoice}
              select={select}
              isSelected={selectedById.has(invoice.id)}
              onSelectionChange={(checked) =>
                handleSelectionChange(invoice, checked)
              }
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <LiaFileInvoiceSolid className="w-16 h-16 text-gray-300" />
            <p className="text-lg font-semibold text-gray-400">
              لا توجد فواتير
            </p>
            <p className="text-sm text-gray-400">
              لا توجد فواتير لهذا المورد
            </p>
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

      <SupplierInvoicesActionsBar
        selectedCount={selectedById.size}
        isVisible={showActionsBar}
        onExportExcel={handleExportExcel}
      />
    </div>
  );
}
