import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Edit,
  Truck,
  CircleAlert,
} from 'lucide-react';
import { Order } from '@/types/orders';
import PageSizeSelector from '../PageSizeSelector';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onExportExcel?: () => void;
  currentPageSize: number;
  onPageSizeChange: (size: number) => void;
  hasSelectedOrders: boolean;
}

const Footer: React.FC<FooterProps> = ({
  currentPage,
  totalPages,
  totalItems,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPrevious,
  onNext,
  onExportExcel,
  currentPageSize,
  onPageSizeChange,
  hasSelectedOrders,
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

  return (
    <>
      <div className={`flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-4 px-6 bg-gray-50 rounded-lg relative bottom-0 ${hasSelectedOrders ? 'pb-24 sm:pb-28' : 'pb-6'}`}>
        <PageSizeSelector
          currentSize={currentPageSize}
          totalItems={totalItems}
          onSizeChange={onPageSizeChange}
        />

        {/* Pagination */}
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-[#682fee]" />
          </Button>
          {/* Page Numbers */}
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
                    className={`h-8 w-8 p-0 cursor-pointer ${page === currentPage
                      ? 'bg-[#5D24E1] text-white hover:bg-purple-700'
                      : 'text-[#682fee] hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
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

      {/* Sticky Action Buttons - Only show when orders are selected */}
      {hasSelectedOrders && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-4 px-6">
          <div className="flex flex-row gap-2 items-center justify-center sm:justify-center max-w-7xl mx-auto overflow-auto">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-[#5D24E1] text-[#5D24E1] hover:bg-[#5D24E1] hover:text-white transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              <span>تعديل الحالة</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-[#5D24E1] text-[#5D24E1] hover:bg-[#5D24E1] hover:text-white transition-colors cursor-pointer"
              onClick={onExportExcel}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>مشاركة شيت اكسيل</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-[#5D24E1] text-[#5D24E1] hover:bg-[#5D24E1] hover:text-white transition-colors cursor-pointer [&:hover_svg]:fill-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="#5D24E1"
                viewBox="0 0 640 640"
                className="transition-colors"
              >
                <path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z" />
              </svg>
              <span>مشاركة واتساب</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-[#5D24E1] text-[#5D24E1] hover:bg-[#5D24E1] hover:text-white transition-colors cursor-pointer"
            >
              <Truck className="h-4 w-4" />
              <span>شحن</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white border-[#5D24E1] text-[#5D24E1] hover:bg-[#5D24E1] hover:text-white transition-colors cursor-pointer"
            >
              <CircleAlert className="h-4 w-4" />
              <span>اخرى</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
