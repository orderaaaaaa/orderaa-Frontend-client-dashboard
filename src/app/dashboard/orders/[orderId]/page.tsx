'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderFilters } from '@/types/orders';
import { getOrderById } from '@/lib/api/order';
import { AuthGuard } from '@/components/auth-guard';
import { defaultEmptyFilters, defaultOptions } from '../../../../hooks/AllOrders/useFilterState';
import {
  Truck,
  Boxes,
  BadgePlus,
  Repeat,
  CircleDollarSign,
  Clock3,
  PhoneCall,
  Ban,
  CircleX,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import PageTab from '@/components/ui/PageTab';
import { dummyCards } from '@/constants/orders-tabs';
import FilterPanel from '../allOrders/components/FilterSection/FilterPanel';
import OrderDetailsInfo from './OrderDetailsInfo';

export default function OrderDetails({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);

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
          const { mockOrders } = await import('@/mocks/mockData');
          const mockOrder = mockOrders.find(o => o.id === orderId);

          if (mockOrder) {
            setOrder(mockOrder);
            setError(null);
          } else {
            setError('الطلب غير موجود');
          }
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
      <div className="flex gap-4 md:flex-wrap overflow-x-auto hide">
        <PageTab
          label="جميع الطلبات"
          count={dummyCards.length}
          icon={<Boxes width={18} height={18} />}
        />
        <PageTab
          label="طلبات جديده"
          count={3}
          icon={<BadgePlus width={18} height={18} />}
        />
        <PageTab
          label="تم المحاولة"
          count={200}
          icon={<Repeat width={18} height={18} />}
        />
        <PageTab
          label="في انتظار الدفع"
          count={15000}
          icon={<CircleDollarSign width={18} height={18} />}
        />
        <PageTab
          label="واتساب"
          count={30000}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={22}
              height={22}
              fill="#5D24E1"
              viewBox="0 0 640 640"
            >
              <path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z" />
            </svg>
          }
        />

        <PageTab
          label="تأجيلات"
          count={67}
          icon={<Clock3 width={18} height={18} />}
        />
        <PageTab
          label="اعادة اتصال"
          count={1}
          icon={<PhoneCall width={18} height={18} />}
        />
        <PageTab
          label="وقوف التشغيل"
          count={0}
          icon={<Ban width={18} height={18} />}
        />
        <PageTab
          label="تم الغاء"
          count={2}
          icon={<CircleX width={18} height={18} />}
        />
        <PageTab
          label="تم التحضير"
          count={2}
          icon={<CheckCircle2 width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={2}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="تقارير"
          count={2}
          icon={<FileText width={18} height={18} />}
        />
      </div>
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
