'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { LiaBoxesSolid } from 'react-icons/lia';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import PaginationFooter from '@/components/ui/pagination-footer';
import Input from '@/components/ui/Input';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { Supplier } from '../../../types';
import { SupplierProduct, SortField, SortOrder } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useSupplierProductsQuery } from '@/services/suppliers';
import ProductDetailModal from './ProductDetailModal';

interface SupplierProductsContentProps {
  supplier: Supplier;
}

type ProductRecord = Record<string, unknown> & {
  productId: number;
  productName: string;
  totalQuantityPurchased: number;
  totalPurchaseAmount: number;
  totalReturnAmount: number;
  netAmount: number;
};

const columns: DataTableColumn<ProductRecord>[] = [
  {
    key: 'productName',
    header: 'المنتج',
    sortable: true,
    className: 'w-[180px]',
    render: (val) => (
      <span className="text-sm font-medium text-gray-800">{val as string}</span>
    ),
  },
  {
    key: 'totalQuantityPurchased',
    header: 'الكمية المشتراة',
    sortable: true,
  },
  {
    key: 'totalPurchaseAmount',
    header: 'إجمالي الشراء',
    sortable: true,
    render: (val) => (val as number).toLocaleString(),
  },
  {
    key: 'totalReturnAmount',
    header: 'إجمالي المرتجع',
    sortable: true,
    render: (val) => (val as number).toLocaleString(),
  },
  {
    key: 'netAmount',
    header: 'إجمالي الصافي',
    sortable: true,
    render: (val) => (val as number).toLocaleString(),
  },
];

export default function SupplierProductsContent({
  supplier,
}: SupplierProductsContentProps) {
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('totalQuantityPurchased');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('');

  const { data: products = [], isLoading } = useSupplierProductsQuery(supplier.id);

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field as SortField);
        setSortOrder('desc');
      }
    },
    [sortBy],
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => p.productName.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [products, searchQuery, sortBy, sortOrder]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [currentPage, pageSize, filteredProducts]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const emptyContent = (
    <div className="flex flex-col items-center gap-3">
      <LiaBoxesSolid className="w-16 h-16 text-gray-300" />
      <p className="text-lg font-semibold text-gray-400">لا توجد منتجات</p>
      {searchQuery.trim() ? (
        <p className="text-sm text-gray-400">لا توجد نتائج تطابق البحث</p>
      ) : (
        <p className="text-sm text-gray-400">لا توجد منتجات لهذا المورد</p>
      )}
    </div>
  );

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

      <div className="px-4 sm:px-8 py-4 flex flex-col gap-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
          المنتجات المشتراة من مورد {supplier.nickname}
        </h1>

        <Input
          placeholder="البحث بالمنتج"
          icon={Search}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          clearable
          onClear={() => {
            setSearchQuery('');
            setCurrentPage(1);
          }}
          inputClassName="bg-white"
        />
      </div>

      <div className="px-4 sm:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable<ProductRecord>
            columns={columns}
            data={paginatedProducts as unknown as ProductRecord[]}
            keyField="productId"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyContent={emptyContent}
            onRowClick={(row) =>
              setSelectedProduct(row as unknown as SupplierProduct)
            }
          />
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          supplierId={supplier.id}
        />
      )}

      <div className="mt-6">
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasNextPage={currentPage < totalPages}
          hasPreviousPage={currentPage > 1}
          onPageChange={handlePageChange}
          onPrevious={() => handlePageChange(Math.max(1, currentPage - 1))}
          onNext={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          currentPageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
