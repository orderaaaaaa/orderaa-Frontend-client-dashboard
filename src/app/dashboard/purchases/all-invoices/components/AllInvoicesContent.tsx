'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Scan, ScanLine, X } from 'lucide-react';
import InvoicesHeader from './InvoicesHeader';
import InvoiceCard from './InvoiceCard';
import InvoiceDetailModal from './InvoiceDetailModal';
import InvoicesActionsBar from './InvoicesActionsBar';
import PaginationFooter from '@/components/ui/pagination-footer';
import { MOCK_INVOICES, DEFAULT_PAGE_SIZE } from '../constants';
import { Invoice } from '../types';

export function AllInvoicesContent() {
  const [select, setSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalItems = MOCK_INVOICES.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return MOCK_INVOICES.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

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

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <InvoicesHeader />

      <div className="sm:px-8 py-3 flex flex-row items-center justify-end gap-3 text-white">
        {select && selectedIds.length > 0 && (
          <div className="flex flex-row items-center justify-center gap-2">
            <X
              onClick={() => {
                setSelectedIds([]);
                setSelect(false);
              }}
              className="cursor-pointer text-primary h-5 w-5"
            />
            <span className="text-sm text-gray-600">
              تم تحديد {selectedIds.length} طلب
            </span>
          </div>
        )}
        <div
          className="bg-primary flex flex-row items-center justify-center gap-3 px-5 py-2 rounded-full cursor-pointer"
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

      <div className="sm:px-8 flex flex-col gap-4">
        {paginatedInvoices.map((invoice) => (
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
        ))}
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
