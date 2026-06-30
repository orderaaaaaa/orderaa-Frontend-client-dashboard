'use client';

import React, { useState } from 'react';
import { useWalletTransactions } from '@/services/wallet';
import { WalletTransaction, PaginationMeta } from '@/types/wallet';
import { Badge } from '@/components/ui/badge';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Wallet, RefreshCw } from 'lucide-react';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatAmount(amount: string, currency: string = 'EGP'): string {
  return `${Number(amount).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function WalletTransactionLog() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError, refetch } = useWalletTransactions({
    page: currentPage,
    limit: pageSize,
  });

  const transactions = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (meta?.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (meta?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    refetch();
  };

  const headers = ['التاريخ', 'نوع المعاملة', 'المبلغ', 'البيان'];

  if (isLoading) {
    return (
      <div className="mt-10 sm:px-4 mb-20" dir="rtl">
        <h2 className="text-2xl font-bold mb-6 text-right">سجل المعاملات</h2>
        <div className="w-full">
          <div className="grid grid-cols-4 bg-white border border-[#ebebeb] rounded-xl py-5 sm:px-6 mb-1 text-center">
            {headers.map((header, index) => (
              <span key={index} className="text-gray-600 font-medium text-lg">
                {header}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center bg-white border border-[#ebebeb] rounded-xl py-4 px-2 sm:px-6"
              >
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-6 bg-gray-200 animate-pulse rounded w-full mx-auto max-w-[120px]" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-10 sm:px-4 mb-20" dir="rtl">
        <h2 className="text-2xl font-bold mb-6 text-right">سجل المعاملات</h2>
        <div className="w-full">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-600 mb-4">
              <RefreshCw className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-700 font-medium mb-4">تعذر تحميل سجل المعاملات</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#682fee] text-white rounded-lg hover:bg-[#5a25d8] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-10 sm:px-4 mb-20" dir="rtl">
        <h2 className="text-2xl font-bold mb-6 text-right">سجل المعاملات</h2>
        <div className="w-full">
          <div className="bg-white border border-[#ebebeb] rounded-xl p-12 text-center">
            <Wallet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">لا توجد معاملات حتى الآن</p>
          </div>
        </div>
      </div>
    );
  }

  const startItem = meta ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0;
  const endItem = meta ? Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems) : 0;
  const totalItems = meta?.totalItems ?? 0;

  return (
    <div className="mt-10 sm:px-4 mb-20" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-right">سجل المعاملات</h2>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-white border border-[#ebebeb] rounded-xl py-5 sm:px-6 mb-1 text-center">
          {headers.map((header, index) => (
            <span key={index} className="text-gray-600 font-medium text-lg">
              {header}
            </span>
          ))}
        </div>

        {/* Table Body / Rows */}
        <div className="flex flex-col gap-4">
          {transactions.map((transaction: WalletTransaction) => (
            <div
              key={transaction.id}
              className="grid grid-cols-4 items-center bg-white border border-[#ebebeb] rounded-xl py-4 px-2 sm:px-6 hover:shadow-sm transition-shadow text-center"
            >
              {/* التاريخ */}
              <div className="text-gray-800 font-medium">
                {formatDate(transaction.createdAt)}
              </div>

              {/* نوع المعاملة */}
              <div className="text-center">
                <Badge
                  variant={transaction.type === 'CREDIT' ? 'default' : 'destructive'}
                  className={`text-xs px-3 py-1 ${
                    transaction.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {transaction.type === 'CREDIT' ? 'إيداع' : 'خصم'}
                </Badge>
              </div>

              {/* المبلغ */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-gray-900 font-medium">
                  {formatAmount(transaction.amount)}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatAmount(transaction.balanceBefore)} → {formatAmount(transaction.balanceAfter)}
                </span>
              </div>

              {/* البيان */}
              <div className="text-gray-800 font-medium truncate max-w-[200px] mx-auto">
                {transaction.description ?? transaction.reference ?? '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        {meta && totalItems > 0 && (
          <PaginationFooter
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            hasNextPage={meta.hasNextPage}
            hasPreviousPage={meta.hasPreviousPage}
            onPageChange={handlePageChange}
            onPrevious={handlePrevious}
            onNext={handleNext}
            currentPageSize={meta.itemsPerPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}

export default WalletTransactionLog;