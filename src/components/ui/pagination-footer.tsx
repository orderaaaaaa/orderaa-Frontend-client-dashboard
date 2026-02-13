import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageSizeSelector from './page-size-selector';

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  currentPageSize: number;
  onPageSizeChange: (size: number) => void;
  hasSelectedItems?: boolean;
}

const PaginationFooter: React.FC<PaginationFooterProps> = ({
  currentPage,
  totalPages,
  totalItems,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPrevious,
  onNext,
  currentPageSize,
  onPageSizeChange,
  hasSelectedItems = false,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = totalPages; i >= 1; i--) {
        pages.push(i);
      }
    } else {
      pages.push(totalPages);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (end < totalPages - 1) {
        pages.push('...');
      }

      for (let i = end; i >= start; i--) {
        pages.push(i);
      }

      if (start > 2) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const startItem = (currentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(currentPage * currentPageSize, totalItems);

  return (
    <div
      className={`flex flex-col gap-3 px-6 bg-gray-50 rounded-lg relative bottom-0 ${
        hasSelectedItems ? 'pb-24 sm:pb-28' : 'pb-6'
      }`}
    >
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PageSizeSelector
            currentSize={currentPageSize}
            totalItems={totalItems}
            onSizeChange={onPageSizeChange}
          />
          <span className="hidden sm:inline text-sm text-gray-500">
            عرض {startItem}-{endItem} من {totalItems}
          </span>
        </div>
        <div className="flex justify-center items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4 text-[#682fee]" />
        </Button>
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`h-8 w-8 p-0 cursor-pointer ${
                    page === currentPage
                      ? 'bg-primary text-white hover:bg-purple-700'
                      : 'text-[#682fee] hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPreviousPage}
          className="h-8 w-8 p-0 bg-white cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 text-[#682fee]" />
        </Button>
        </div>
      </div>
      <span className="sm:hidden text-sm text-gray-500 text-center">
        عرض {startItem}-{endItem} من {totalItems}
      </span>
    </div>
  );
};

export default PaginationFooter;
