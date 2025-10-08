"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { DashboardLayout } from "@/components/dashboard-layout";
import FilterSection from "./FilterSection/index";
import PageTab from "@/components/ui/PageTab";
import OrderCard from "./OrderCard";
import Footer from "./Footer/page";
import { usePagination } from "../../../../hooks/AllOrders/usePagination";
import { useFilteredOrders } from "../../../../hooks/AllOrders/useFilteredOrders";
import { OrderFilters } from "@/types/orders";
import { defaultEmptyFilters } from "../../../../hooks/AllOrders/useFilterState";

import { dummyCards } from "@/constants/orders-tabs";

export default function AllOrdersRefactor() {
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);

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
      {/* Page Tabs */}
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

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 grid-rows-3 gap-3 flex-wrap">
        {paginatedItems.map((card) => (
          <OrderCard key={card.id} {...card} />
        ))}
      </div>

      {/* Pagination Footer */}
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
