'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import FilterSection from './components/FilterSection';
import OrderCard from './components/OrderCard';
import Footer from './components/Footer';
import { usePagination } from '../../../../hooks/AllOrders/usePagination';
import { useFilteredOrders } from '../../../../hooks/AllOrders/useFilteredOrders';
import { useOrders, useOrderStats } from '../../../../hooks/AllOrders/useOrders';
import { OrderFilters, OrderStatus, Order } from '@/types/orders';
import { defaultEmptyFilters } from '../../../../hooks/AllOrders/useFilterState';
import PageTaps from './pageTaps';

import { dummyCards } from '@/constants/orders-tabs';
import { ScanLine } from 'lucide-react';

export default function AllOrdersRefactor() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);
  const [select, setSelect] = useState(false);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [useBackend, setUseBackend] = useState(false); // Toggle for testing

  // Fetch orders from backend
  const { orders: backendOrders, pagination: backendPagination, loading, error } = useOrders({
    page: currentPage,
    limit: 6,
    status: activeStatus !== 'all' ? activeStatus : undefined,
    search: searchQuery || filters.search,
    customerName: filters.customerName,
    phone: filters.phone,
    governorate: filters.governorate,
    city: filters.area,
    productName: filters.productName,
  });

  // Fetch order stats for tab counts
  const { stats } = useOrderStats();

  // Use backend data if available and not in dummy mode
  const ordersToUse = useBackend && !loading ? backendOrders : dummyCards;

  // Apply local filtering for dummy data
  const filteredOrders = useFilteredOrders(ordersToUse as any[], filters);

  // Pagination
  const {
    currentPage: localCurrentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination(useBackend ? backendOrders : filteredOrders, 1, 6);

  // Update search from URL parameter
  useEffect(() => {
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
      setUseBackend(true); // Use backend when search is active
    }
  }, [searchQuery]);

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    goToPage(1);
    setCurrentPage(1);
    if (newFilters.search || newFilters.customerName || newFilters.phone) {
      setUseBackend(true); // Switch to backend for searches
    }
  };

  const handleStatusChange = (status: OrderStatus | 'all') => {
    setActiveStatus(status);
    setCurrentPage(1);
    goToPage(1);
    setUseBackend(true); // Use backend when filtering by status
  };

  const handlePageChange = (page: number) => {
    if (useBackend) {
      setCurrentPage(page);
    } else {
      goToPage(page);
    }
  };

  // Map backend Order to display format
  const mapOrderToCard = (order: Order) => ({
    id: order.id,
    name: order.customer?.name || 'Unknown',
    phone: order.customer?.phone || '',
    government: order.customer?.governorate || '',
    items: order.orderProducts?.map(op => `${op.product.name} ${op.product.size || ''} ${op.product.color || ''}`.trim()) || [],
    price: order.totalCost,
    trys: order.numberOfTriesToReach,
    status: order.status,
    city: order.customer?.city || '',
    alert: undefined,
  });

  const displayItems = useBackend 
    ? backendOrders.map(mapOrderToCard) 
    : paginatedItems;

  const displayPagination = useBackend ? backendPagination : {
    page: localCurrentPage,
    limit: 6,
    total: filteredOrders.length,
    totalPages: totalPages,
  };

  return (
    <div>
      <PageTaps 
        data={ordersToUse} 
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        stats={stats || undefined}
      />

      <FilterSection filters={filters} onChange={handleFilterChange} />

      {loading && <div className="text-center py-8">Loading orders...</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

      <div className="flex justify-between mt-10 mb-6 select-none">
        <p className="text-gray-700">
          عدد جميع الطلبات: {useBackend ? backendPagination.total : ordersToUse.length}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 grid-rows-3 gap-3 flex-wrap my-4">
        {displayItems.map((card: any) => (
          <OrderCard key={card.id} select={select} {...card} />
        ))}
      </div>

      <Footer
        currentPage={useBackend ? currentPage : localCurrentPage}
        totalPages={displayPagination.totalPages}
        totalItems={displayPagination.total}
        hasNextPage={useBackend ? currentPage < displayPagination.totalPages : hasNextPage}
        hasPreviousPage={useBackend ? currentPage > 1 : hasPreviousPage}
        onPageChange={handlePageChange}
        onPrevious={useBackend ? () => setCurrentPage(p => Math.max(1, p - 1)) : previousPage}
        onNext={useBackend ? () => setCurrentPage(p => p + 1) : nextPage}
      />
    </div>
  );
}
