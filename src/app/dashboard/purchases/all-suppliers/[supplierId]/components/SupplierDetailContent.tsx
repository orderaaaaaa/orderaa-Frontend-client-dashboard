'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Scan, ScanLine, X } from 'lucide-react';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import PaginationFooter from '@/components/ui/pagination-footer';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { Supplier } from '../../types';
import SupplierDetailHeader from './SupplierDetailHeader';
import SupplierInvoiceCard from './SupplierInvoiceCard';
import SupplierInvoicesActionsBar from './SupplierInvoicesActionsBar';
import { MOCK_SUPPLIER_INVOICES, DEFAULT_PAGE_SIZE } from '../constants';
import { exportSupplierInvoicesToExcel } from '../utils';

interface SupplierDetailContentProps {
  supplier: Supplier;
}

export function SupplierDetailContent({ supplier }: SupplierDetailContentProps) {
  const [select, setSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('');

  const invoices = MOCK_SUPPLIER_INVOICES;

  const totalItems = invoices.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return invoices.slice(start, start + pageSize);
  }, [currentPage, pageSize, invoices]);

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
      if (prev) setSelectedIds([]);
      return !prev;
    });
  }, []);

  const handleSelectionChange = useCallback(
    (invoiceId: number, checked: boolean) => {
      setSelectedIds((prev) =>
        checked ? [...prev, invoiceId] : prev.filter((id) => id !== invoiceId),
      );
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
    const selectedInvoices = invoices.filter((inv) =>
      selectedIds.includes(inv.id),
    );
    exportSupplierInvoicesToExcel(selectedInvoices, supplier.name);
  }, [invoices, selectedIds, supplier.name]);

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
        <div className="flex flex-row items-center justify-end gap-3">
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
                تم تحديد {selectedIds.length} فاتورة
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

      <div className="px-4 sm:px-8 flex flex-col gap-4">
        {paginatedInvoices.length > 0 ? (
          paginatedInvoices.map((invoice) => (
            <SupplierInvoiceCard
              key={invoice.id}
              invoice={invoice}
              select={select}
              isSelected={selectedIds.includes(invoice.id)}
              onSelectionChange={(checked) =>
                handleSelectionChange(invoice.id, checked)
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

      <SupplierInvoicesActionsBar
        selectedCount={selectedIds.length}
        isVisible={showActionsBar}
        onExportExcel={handleExportExcel}
      />
    </div>
  );
}
