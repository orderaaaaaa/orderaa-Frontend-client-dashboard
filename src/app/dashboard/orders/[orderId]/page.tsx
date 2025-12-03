'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types/orders';
import { getOrderById } from '@/lib/api/order';
import { AuthGuard } from '@/components/auth-guard';
import PageTaps from '../allOrders/pageTaps';
import FilterSection from '../allOrders/components/FilterSection';
import OrderDetailsInfo from './OrderDetailsInfo';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';
import { useFilterForm } from '@/hooks/AllOrders/useFilterForm';
import { useFilterOptions } from '@/hooks/AllOrders/useFilterOptions';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';

export default function OrderDetails({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();

  // React Hook Form setup
  const handleFormSubmit = useCallback(
    (data: OrderFiltersFormData) => {
      // Handle filter changes here if needed
      console.log('Filters changed:', data);
    },
    []
  );

  const {
    control,
    formState: { errors },
  } = useFilterForm({
    onSubmit: handleFormSubmit,
  });

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
      <div>
        <FilterSection
          control={control}
          errors={errors}
          options={{
            productOptions: options.productNames || [],
            sizeColorOptions: [
              ...(options.productSizes || []),
              ...(options.productColors || []),
            ],
            governorateOptions: options.governorates || [],
            areaOptions: options.areas || [],
          }}
        />
      </div>
      <OrderDetailsInfo order={order} />
    </AuthGuard>
  );
}
