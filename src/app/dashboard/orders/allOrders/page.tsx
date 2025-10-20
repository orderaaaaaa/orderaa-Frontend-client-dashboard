'use client';

import React, { useState, useEffect } from 'react';

import FilterSection from './components/FilterSection';
import OrderCard from './components/OrderCard';
import Footer from './components/Footer';
import { usePagination } from '../../../../hooks/AllOrders/usePagination';
import { useFilteredOrders } from '../../../../hooks/AllOrders/useFilteredOrders';
import { Order, OrderFilters, OrderStatus } from '@/types/orders';
import { defaultEmptyFilters } from '../../../../hooks/AllOrders/useFilterState';
import PageTaps from './pageTaps';
import { getOrders } from '@/lib/api/order';
import { useOrdersStore } from '@/store/ordersStore';

import { ScanLine } from 'lucide-react';

export default function AllOrdersRefactor() {
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);
  const [select, setSelect] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>({} as Record<OrderStatus, number>);

  const { searchQuery, selectedStatus } = useOrdersStore();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrders({
          status: selectedStatus || undefined,
          search: searchQuery || undefined,
          page: 1,
          limit: 1000, // Fetch all for client-side filtering initially
        });
        setOrders(response.data);
        setTotalOrders(response.total);

        // Calculate status counts
        const counts = {} as Record<OrderStatus, number>;
        Object.values(OrderStatus).forEach((status) => {
          counts[status] = 0;
        });
        response.data.forEach((order) => {
          counts[order.status] = (counts[order.status] || 0) + 1;
        });
        setStatusCounts(counts);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('فشل في تحميل الطلبات');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchQuery, selectedStatus]);

  const filteredOrders = useFilteredOrders(orders, filters);

  const {
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination(filteredOrders, 1, 6);

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    goToPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTaps data={orders} statusCounts={statusCounts} />

      <FilterSection filters={filters} onChange={handleFilterChange} />

      <div className="flex justify-between mt-10 mb-6 select-none">
        <p className="text-gray-700">عدد جميع الطلبات: {filteredOrders.length}</p>
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
        {paginatedItems.map((order) => (
          <OrderCard
            key={order.id}
            select={select}
            id={order.id}
            name={order.customer.name}
            phone={order.customer.phone}
            government={order.customer.governorate || 'غير محدد'}
            items={order.orderProducts.map(
              (op: any) => `${op.product.name}${op.product.size ? ` - ${op.product.size}` : ''}${op.product.color ? ` - ${op.product.color}` : ''}`
            )}
            price={order.totalCost}
            trys={order.numberOfTriesToReach}
            status={order.status}
            city={order.customer.area || 'غير محدد'}
            alert={0}
          />
        ))}
      </div>

      {paginatedItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          لا توجد طلبات
        </div>
      )}

      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredOrders.length}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={goToPage}
        onPrevious={previousPage}
        onNext={nextPage}
      />
    </div>
  );
}
