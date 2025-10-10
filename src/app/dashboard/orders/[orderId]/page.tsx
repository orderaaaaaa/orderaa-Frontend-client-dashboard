'use client';

import React, { useState } from 'react';
import { OrderFilters } from '@/types/orders';
import { defaultEmptyFilters } from '../../../../hooks/AllOrders/useFilterState';
import { useFilteredOrders } from '../../../../hooks/AllOrders/useFilteredOrders';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { DashboardLayout } from '@/components/dashboard-layout';
import { dummyCards } from '@/constants/orders-tabs';
import FilterSection from '../allOrders/FilterSection';
import OrderDetailsInfo from './OrderDetailsInfo';
import PageTaps from '../pageTaps';

export default function OrderDetails({ params }: { params: { code: string } }) {
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const search = useSearchParams();
  const name = search.get('name') || '';
  const phone = search.get('phone') || '';
  const product = search.get('product') || '';
  const price = search.get('price') || '';
  const status = search.get('status') || '';
  const city = search.get('city') || '';
  const notes = search.get('notes') || '';

  const imageSrc = '/placeholder.jpg';

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* TODO: What is the "hide" for? */}
        <PageTaps data={dummyCards} />
        {/* Filter Section */}
        <FilterSection filters={filters} onChange={handleFilterChange} />
        <OrderDetailsInfo />
      </DashboardLayout>
    </AuthGuard>
  );
}
