'use client';

import React, { useState } from 'react';

import { DashboardLayout } from '@/components/dashboard-layout';
import FilterSection from './FilterSection/index';
import OrderCard from './OrderCard';
import Footer from './Footer';
import { usePagination } from '../../../../hooks/AllOrders/usePagination';
import { useFilteredOrders } from '../../../../hooks/AllOrders/useFilteredOrders';
import { OrderFilters } from '@/types/orders';
import { defaultEmptyFilters } from '../../../../hooks/AllOrders/useFilterState';
import PageTaps from './pageTaps';

import { dummyCards } from '@/constants/orders-tabs';
import { ScanLine } from 'lucide-react';

export default function AllOrdersRefactor() {
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);
  const [select, setSelect] = useState(false);
  const filteredOrders = useFilteredOrders(dummyCards, filters);

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

  return (
    <DashboardLayout>
      <PageTaps data={dummyCards} />

      <FilterSection filters={filters} onChange={handleFilterChange} />

      <div className="flex justify-between mt-10 mb-6 select-none">
        <p className="text-gray-700">عدد جميع الطلبات: {dummyCards.length}</p>
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
        {paginatedItems.map((card) => (
          <OrderCard key={card.id} select={select} {...card} />
        ))}
      </div>

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
    </DashboardLayout>
  );
}
