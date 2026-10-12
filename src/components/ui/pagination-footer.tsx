import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageSizeSelector from './page-size-selector';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const isPhone = useIsMobile(640);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisiblePages = 5;
    const siblings = isPhone ? 0 : 1;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - siblings);
      const end = Math.min(totalPages - 1, currentPage + siblings);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const endItem = Math.min(currentPage * currentPageSize, totalItems);
  const startItem = Math.min((currentPage - 1) * currentPageSize + 1, endItem);
  const rangeText =
    totalItems > 0
      ? `عرض ${startItem}-${endItem} من ${totalItems}`
      : 'لا توجد نتائج';

  return (
    <div
      className={`flex flex-col gap-3 px-6 bg-gray-50 rounded-lg relative bottom-0 ${
        hasSelectedItems ? 'pb-24 sm:pb-28' : 'pb-6'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4">
          <PageSizeSelector
            currentSize={currentPageSize}
            totalItems={totalItems}
            onSizeChange={onPageSizeChange}
          />
          <span className="text-sm text-gray-500">{rangeText}</span>
        </div>
        <nav
          aria-label="التنقل بين الصفحات"
          className="flex justify-center items-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!hasPreviousPage}
            aria-label="الصفحة السابقة"
            className="size-10 sm:size-8 p-0 bg-white cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-[#682fee]" />
          </Button>
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    aria-label={`صفحة ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                    className={`size-10 sm:size-8 p-0 cursor-pointer ${
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
            onClick={onNext}
            disabled={!hasNextPage}
            aria-label="الصفحة التالية"
            className="size-10 sm:size-8 p-0 bg-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-[#682fee]" />
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default PaginationFooter;
