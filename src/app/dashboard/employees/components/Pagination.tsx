'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationProps } from '../types/pagination.types';

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  className = '',
}: PaginationProps) {
  const handlePrevious = () => {
    if (hasPreviousPage && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!hasPreviousPage}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          hasPreviousPage
            ? 'border-gray-300 hover:bg-[#5d24e1] hover:text-white hover:border-[#5d24e1] text-gray-700'
            : 'border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight size={20} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
              className={`w-10 h-10 rounded-lg border transition-colors ${
                isActive
                  ? 'bg-[#5d24e1] text-white border-[#5d24e1] font-medium'
                  : 'border-gray-300 text-gray-700 hover:bg-[#5d24e1] hover:text-white hover:border-[#5d24e1]'
              }`}
              aria-label={`الصفحة ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!hasNextPage}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          hasNextPage
            ? 'border-gray-300 hover:bg-[#5d24e1] hover:text-white hover:border-[#5d24e1] text-gray-700'
            : 'border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  );
}
