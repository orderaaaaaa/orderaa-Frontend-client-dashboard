'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderFilters } from '@/types/orders';
import { getOrderById } from '@/lib/api/order';
import { AuthGuard } from '@/components/auth-guard';
import { defaultEmptyFilters, defaultOptions } from '../../../../hooks/AllOrders/useFilterState';
import PageTaps from '../allOrders/pageTaps';
import FilterPanel from '../allOrders/components/FilterSection/FilterPanel';
import OrderDetailsInfo from './OrderDetailsInfo';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';

export default function OrderDetails({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);

  const { statistics } = useOrderStatistics();

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderId = parseInt(params.orderId);

        // Try to fetch from API first
        try {
          const orderData = await getOrderById(orderId);
          setOrder(orderData);
          setError(null);
        } catch (apiErr) {
          // Fallback to mock data if API fails
          console.warn('API failed, searching in mock data:', apiErr);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'فشل في تحميل بيانات الطلب');
      } finally {
        setLoading(false);
      }
    };

    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1] mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات الطلب...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !order) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || 'الطلب غير موجود'}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-[#5D24E1] text-white rounded-lg hover:bg-[#4a1db5] transition-colors"
            >
              العودة للطلبات
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageTaps
        statusCounts={statistics?.statusCounts || {}}
        totalOrders={statistics?.totalOrders || 0}
      />
      <div className="max-sm:hidden relative z-10 bg-white rounded-xl py-[3px] mt-6 mb-3">
        <FilterPanel
          filters={filters}
          updateFilters={handleFilterChange}
          options={defaultOptions}
        />
      </div>
      <OrderDetailsInfo order={order} />
    </AuthGuard>
  );
}
