'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import PageTaps from '../allOrders/pageTaps';
import FilterSection from '../allOrders/components/FilterSection';
import OrderDetailsInfo from './OrderDetailsInfo';
import { useOrderStatistics } from '@/hooks/orders/useOrderStatistics';
import { useFilterForm } from '@/hooks/orders/useFilterForm';
import { useFilterOptions } from '@/hooks/orders/useFilterOptions';
import { useOrderDetailsNavigation } from '@/hooks/OrderDetails/useOrderDetailsNavigation';
import { useOrderById } from '@/services/orders';
import { useOrderLock } from '@/hooks/useOrderLock';
import { DatePicker } from '@/components/ui/datepicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { Breadcrumb } from '@/components/dashboard-layout';

function OrderDetailsContent({ params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId);

  const {
    data: order,
    isLoading: loading,
    error: queryError,
  } = useOrderById(orderId);

  const error = queryError ? 'فشل في تحميل بيانات الطلب' : null;

  const { isLockedByOther, lockedBy, unlock } = useOrderLock({
    orderId: order?.id ?? null,
    lockedBy: order?.locked_by,
    enabled: !!order,
  });

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();

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
    setNoOrdersFound,
    formFilters,
    handleFilterFormChange,
    navigateToOrder,
  } = useOrderDetailsNavigation({
    initialOrderId: orderId,
  });

  const {
    control,
    formState: { errors },
    reset,
    setValue,
  } = useFilterForm({
    onSubmit: handleFilterFormChange,
    defaultValues: formFilters || undefined,
  });

  // Track previous formFilters to prevent unnecessary resets
  const prevFormFiltersRef = useRef<string | null>(null);

  // Reset form when formFilters changes from URL sync (only on actual value change)
  useEffect(() => {
    if (!formFilters) return;

    const currentFiltersStr = JSON.stringify(formFilters);
    if (prevFormFiltersRef.current === currentFiltersStr) return;

    prevFormFiltersRef.current = currentFiltersStr;
    reset(formFilters, { keepDefaultValues: false });
  }, [formFilters, reset]);

  useEffect(() => {
    if (targetOrderId && targetOrderId !== orderId) {
      navigateToOrder(targetOrderId);
    }
  }, [targetOrderId, orderId, navigateToOrder]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-[#4a1db5] transition-colors"
            >
              العودة للطلبات
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (isEmpty) {
    return (
      <AuthGuard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-7 w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 w-full sm:w-auto">
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              placeholder="من تاريخ"
              showIcon={true}
              className="w-[120px] sm:w-[140px]"
              maxDate={toDate || undefined}
            />

            <ArrowLeft className="text-primary flex-shrink-0" size="20" />

            <DatePicker
              selected={toDate}
              onChange={setToDate}
              placeholder="إلى تاريخ"
              showIcon={true}
              className="w-[120px] sm:w-[140px]"
              minDate={fromDate || undefined}
            />

            <div className="relative w-32 sm:w-[180px] flex-shrink-0">
              <Select
                value={timePeriod}
                onValueChange={(value) => setTimePeriod(value as TimePeriod)}
              >
                <SelectTrigger
                  className={`w-full border-[#CED4DA] rounded-lg h-10 text-[16px] ${timePeriod ? 'text-primary font-bold' : ''
                    }`}
                >
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent className="[&_[data-state=checked]]:text-primary">
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
          currentStatus={status}
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
            initialFormFilters={formFilters}
            setValue={setValue}
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
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-[#4a1db5] transition-colors"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-7 w-full">
        <Breadcrumb
          items={[
            { title: 'الطلبات' },
            { title: 'جميع الطلبات', href: '/dashboard/orders/allOrders' },
          ]}
        />
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 w-full sm:w-auto">
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            placeholder="من تاريخ"
            showIcon={true}
            className="w-[120px] sm:w-[140px]"
            maxDate={toDate || undefined}
          />

          <ArrowLeft className="text-primary flex-shrink-0" size="20" />

          <DatePicker
            selected={toDate}
            onChange={setToDate}
            placeholder="إلى تاريخ"
            showIcon={true}
            className="w-[120px] sm:w-[140px]"
            minDate={fromDate || undefined}
          />

          <div className="relative w-32 sm:w-[180px]">
            <Select
              value={timePeriod}
              onValueChange={(value) => setTimePeriod(value as TimePeriod)}
            >
              <SelectTrigger
                className={`w-full border-[#CED4DA] rounded-lg h-10 text-[16px] ${timePeriod ? 'text-primary font-bold' : ''
                  }`}
              >
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent className="[&_[data-state=checked]]:text-primary">
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
        currentStatus={status}
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
          initialFormFilters={formFilters}
          setValue={setValue}
        />
      </div>
      <div className="relative">
        {isNavigating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">جاري البحث...</p>
            </div>
          </div>
        )}
        <OrderDetailsInfo
          order={order}
          onNavigateToNextOrder={navigateToOrder}
          onNoOrdersFound={setNoOrdersFound}
          dateRange={{
            from: fromDate,
            to: toDate,
          }}
          statusFilter={status}
          isLockedByOther={isLockedByOther}
          lockedBy={lockedBy}
          onUnlock={unlock}
        />
      </div>
    </AuthGuard>
  );
}

function OrderDetailsLoading() {
  return (
    <AuthGuard>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function OrderDetails({
  params,
}: {
  params: { orderId: string };
}) {
  return (
    <Suspense fallback={<OrderDetailsLoading />}>
      <OrderDetailsContent params={params} />
    </Suspense>
  );
}
