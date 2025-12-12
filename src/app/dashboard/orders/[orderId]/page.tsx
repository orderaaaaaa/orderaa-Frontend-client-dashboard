'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import PageTaps from '../allOrders/pageTaps';
import FilterSection from '../allOrders/components/FilterSection';
import OrderDetailsInfo from './OrderDetailsInfo';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';
import { useFilterForm } from '@/hooks/AllOrders/useFilterForm';
import { useFilterOptions } from '@/hooks/AllOrders/useFilterOptions';
import { useOrderDetailsNavigation } from '@/hooks/OrderDetails/useOrderDetailsNavigation';
import { useOrderById } from '@/services/orders';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';
import { TimePeriod } from '@/utils/dateRangeUtils';

export default function OrderDetails({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const orderId = parseInt(params.orderId);

  // Use React Query for fetching order - auto refetches when cache is invalidated
  const {
    data: order,
    isLoading: loading,
    error: queryError,
  } = useOrderById(orderId);

  const error = queryError ? 'فشل في تحميل بيانات الطلب' : null;

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();

  // Navigation hook - handles filter state and navigation
  const {
    status,
    setStatus,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    timePeriod,
    setTimePeriod,
    clearTimePeriod,
    targetOrderId,
    isNavigating,
    isEmpty,
    handleFilterFormChange,
  } = useOrderDetailsNavigation({
    initialOrderId: orderId,
  });

  // React Hook Form setup - connected to navigation hook
  const {
    control,
    formState: { errors },
  } = useFilterForm({
    onSubmit: handleFilterFormChange,
  });

  // Navigate to target order when it changes
  useEffect(() => {
    if (targetOrderId && targetOrderId !== orderId) {
      router.push(`/dashboard/orders/${targetOrderId}`);
    }
  }, [targetOrderId, orderId, router]);

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

  if (error) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
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

  // Show empty state when filters result in no orders
  if (isEmpty) {
    return (
      <AuthGuard>
        <div className='flex flex-row items-center justify-between mb-7 w-full'>
          <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 flex-shrink-0">
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              placeholder="من تاريخ"
              showIcon={true}
              className="w-12 sm:w-auto"
              maxDate={toDate || undefined}
            />

            <ArrowLeft className="text-[#5D24E1] flex-shrink-0" size="20" />

            <DatePicker
              selected={toDate}
              onChange={setToDate}
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
                    clearTimePeriod();
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
          onStatusChange={setStatus}
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 text-lg">لا يوجد طلبات</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">الطلب غير موجود</p>
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
            onChange={setFromDate}
            placeholder="من تاريخ"
            showIcon={true}
            className="w-12 sm:w-auto"
            maxDate={toDate || undefined}
          />

          <ArrowLeft className="text-[#5D24E1] flex-shrink-0" size="20" />

          <DatePicker
            selected={toDate}
            onChange={setToDate}
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
                  clearTimePeriod();
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
        onStatusChange={setStatus}
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
      <div className="relative">
        {isNavigating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D24E1] mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">جاري البحث...</p>
            </div>
          </div>
        )}
        <OrderDetailsInfo
          order={order}
          onNavigateToNextOrder={(nextOrderId) => {
            router.push(`/dashboard/orders/${nextOrderId}`);
          }}
          dateRange={{
            from: fromDate,
            to: toDate,
          }}
          statusFilter={status}
        />
      </div>
    </AuthGuard>
  );
}
