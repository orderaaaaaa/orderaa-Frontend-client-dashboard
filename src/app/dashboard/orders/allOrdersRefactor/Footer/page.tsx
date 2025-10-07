import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileSpreadsheet,
  Edit,
} from "lucide-react";

interface FooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
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
        pages.push("...");
      }

      for (let i = end; i >= start; i--) {
        pages.push(i);
      }

      if (start > 2) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-lg relative bottom-0">
      {/* Total Items */}
      <div className="text-gray-600 text-sm">
        عدد جميع الطلبات : {totalItems.toLocaleString()}
      </div>
      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          className="flex items-center space-x-2 px-4 py-2 rounded-3xl border-[#682fee] text-[#682fee] hover:bg-purple-50 cursor-pointer"
        >
          <Edit className="h-4 w-4" />
          <span>تعديل الحالة</span>
        </Button>
        <Button
          variant="default"
          className="flex items-center rounded-3xl space-x-2 px-4 py-2 bg-[#5D24E1] text-white hover:bg-[#682fee] cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>مشاركة شيت اكسيل</span>
        </Button>

        <Button
          variant="outline"
          className="flex items-center rounded-3xl px-4 py-2 border-[#5D24E1] text-[#5D24E1] hover:bg-purple-50 cursor-pointer"
        >
          <Image
            src="/whatsapp.png"
            alt="Whatsapp Icon"
            width={15}
            height={15}
          />
          <span>مشاركة واتساب</span>
        </Button>
      </div>
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
              {page === "..." ? (
                <span className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`h-8 w-8 p-0 cursor-pointer ${
                    page === currentPage
                      ? "bg-[#5D24E1] text-white hover:bg-purple-700"
                      : "text-[#682fee] hover:bg-gray-50"
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
  );
};

export default Footer;
