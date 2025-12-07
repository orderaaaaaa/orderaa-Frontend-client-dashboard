'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types/orders';
import { getOrderById } from '@/lib/api/order';
import { AuthGuard } from '@/components/auth-guard';
import PageTaps from '../allOrders/pageTaps';
import FilterSection from '../allOrders/components/FilterSection';
import OrderDetailsInfo from './OrderDetailsInfo';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';
import { useFilterForm } from '@/hooks/AllOrders/useFilterForm';
import { useFilterOptions } from '@/hooks/AllOrders/useFilterOptions';
import { useOrdersStore } from '@/store/ordersStore';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';

export default function OrderDetails({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('');

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();
  const { selectedStatus } = useOrdersStore();

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

  // Handle time period change
  useEffect(() => {
    if (timePeriod) {
      const range = calculateDateRangeFromPeriod(timePeriod);
      if (range) {
        setFromDate(range.from);
        setToDate(range.to);
      }
    }
  }, [timePeriod]);

  // Clear time period when dates are manually changed
  const handleFromDateChange = (date: Date | null) => {
    setFromDate(date);
    setTimePeriod('');
  };

  const handleToDateChange = (date: Date | null) => {
    setToDate(date);
    setTimePeriod('');
  };

  // Clear all date filters
  const handleClearTimePeriod = () => {
    setTimePeriod('');
    setFromDate(null);
    setToDate(null);
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
      <div className='flex flex-row items-center justify-between mb-7 w-full'>
        <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 flex-shrink-0">
          <DatePicker
            selected={fromDate}
            onChange={handleFromDateChange}
            placeholder="من تاريخ"
            showIcon={true}
            className="w-12 sm:w-auto"
            maxDate={toDate || undefined}
          />

          <ArrowLeft className="text-[#5D24E1] flex-shrink-0" size="20" />

          <DatePicker
            selected={toDate}
            onChange={handleToDateChange}
            placeholder="إلى تاريخ"
            showIcon={true}
            className="w-12 sm:w-auto"
            minDate={fromDate || undefined}
          />

          <div className="relative w-32 sm:w-[180px] flex-shrink-0">
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger className={`w-full border-[#CED4DA] rounded-lg h-10 text-[16px] ${timePeriod ? 'text-[#5D24E1] font-bold' : ''}`}>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent className="[&_[data-state=checked]]:text-[#5D24E1]">
                <SelectItem value="day">يوم</SelectItem>
                <SelectItem value="week">اسبوع</SelectItem>
                <SelectItem value="month">شهر</SelectItem>
                <SelectItem value="quarter">ربع سنوي</SelectItem>
                <SelectItem value="year">سنه</SelectItem>
              </SelectContent>
            </Select>
            {timePeriod && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearTimePeriod();
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                type="button"
              >
                <X size={16} className="text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>
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
      <OrderDetailsInfo
        order={order}
        onOrderUpdate={setOrder}
        onNavigateToNextOrder={(nextOrderId) => {
          router.push(`/dashboard/orders/${nextOrderId}`);
        }}
        dateRange={{
          from: fromDate,
          to: toDate,
        }}
        statusFilter={selectedStatus}
      />
    </AuthGuard>
  );
}
