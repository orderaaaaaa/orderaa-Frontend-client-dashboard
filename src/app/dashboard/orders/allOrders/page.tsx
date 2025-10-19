'use client';

import React, { useState, useMemo } from 'react';

import FilterSection from './FilterSection/index';
import OrderCard from './OrderCard';
import Footer from './Footer';
import SearchBar from '@/components/ui/SearchBar';
import SortDropdown from '@/components/ui/SortDropdown';
import { OrderFilters, FilterOrdersDto } from '@/types/orders';
import { defaultEmptyFilters } from '../../../../hooks/AllOrders/useFilterState';
import PageTaps from './pageTaps';
import { useOrders } from '@/hooks/useOrders';
import { ScanLine } from 'lucide-react';

export default function AllOrdersRefactor() {
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [select, setSelect] = useState(false);
  const itemsPerPage = 6;

  // Convert UI filters to API DTO
  const apiFilters = useMemo<FilterOrdersDto>(() => {
    return {
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter,
      customerName: filters.customerName || undefined,
      phone: filters.phone || undefined,
      governorate: filters.governorate || undefined,
      city: filters.area || undefined,
      productName: filters.productName || undefined,
      shipmentCode: filters.shipmentCode || undefined,
      startDate: filters.executionDate || undefined,
      search: searchQuery || filters.customerName || filters.phone || undefined,
      sortBy,
      sortOrder,
    };
  }, [filters, currentPage, statusFilter, searchQuery, sortBy, sortOrder]);

  const { orders, loading, error, meta } = useOrders(apiFilters);

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleSort = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handleStatusFilterChange = (status?: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when status changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (meta?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (meta?.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div>
      <PageTaps 
        data={orders} 
        totalCount={meta?.totalItems || 0}
        onStatusChange={handleStatusFilterChange}
        activeStatus={statusFilter}
      />

      {/* Search Bar and Sort */}
      <div className="mt-6 mb-4 flex gap-4 items-center">
        <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="ابحث عن طلب (الاسم، رقم الهاتف، كود الشحنة...)"
          />
        </div>
        <SortDropdown onSort={handleSort} />
      </div>

      <FilterSection filters={filters} onChange={handleFilterChange} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
          <p className="font-medium">خطأ في تحميل الطلبات</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between mt-10 mb-6 select-none">
        <p className="text-gray-700">
          عدد جميع الطلبات: {meta?.totalItems || 0}
        </p>
        {select ? (
          <ScanLine
            className="ml-5 cursor-pointer text-[#5D24E1]"
            onClick={() => setSelect(false)}
          />
        ) : (
          <ScanLine
            className="ml-5 cursor-pointer text-[#5D24E1]"
            onClick={() => setSelect(true)}
          />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1]"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">لا توجد طلبات</p>
          <p className="text-sm mt-2">جرب تغيير الفلاتر أو البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 grid-rows-3 gap-3 flex-wrap my-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              name={order.customerName}
              phone={order.phone}
              government={order.governorate}
              items={order.items.map(
                (item) => `${item.size} ${item.productName} ${item.color}`
              )}
              price={order.totalPrice}
              trys={order.deliveryAttempts || 0}
              status={order.status}
              city={order.city}
              alert={0}
              select={select}
            />
          ))}
        </div>
      )}

      {meta && (
        <Footer
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={handlePageChange}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      )}
    </div>
  );
}
