'use client';

import React, { useState } from 'react';
import { OrderFilters } from '@/types/orders';

import { defaultEmptyFilters } from '../../../../hooks/AllOrders/useFilterState';
import { useFilteredOrders } from '../../../../hooks/AllOrders/useFilteredOrders';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { DashboardLayout } from '@/components/dashboard-layout';
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
import FilterSection from '../allOrders/FilterSection';
import OrderDetailsInfo from './OrderDetailsInfo';
import Image from 'next/image';

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
              <Image
                src="/whatsapp.png"
                alt="WhatsApp icon"
                width={14}
                height={14}
              />
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
        {/* Filter Section */}
        <FilterSection filters={filters} onChange={handleFilterChange} />
        <OrderDetailsInfo />
      </DashboardLayout>
    </AuthGuard>
  );
}
