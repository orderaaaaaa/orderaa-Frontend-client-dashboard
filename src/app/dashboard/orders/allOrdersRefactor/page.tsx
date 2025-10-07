"use client";

import React, { useState } from "react";
import { Truck, Package, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import FilterSection from "./FilterSection/index";
import PageTab from "@/components/ui/PageTab";
import OrderCard from "./OrderCard";
import Footer from "./Footer/page";
import { usePagination } from "../../../hooks/AllOrders/usePagination";
import { useFilteredOrders } from "../../../hooks/AllOrders/useFilteredOrders";
import { OrderFilters } from "@/types/orders";
import { defaultEmptyFilters } from "../../../hooks/AllOrders/useFilterState";

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
      <div className="flex gap-4 md:flex-wrap">
        <PageTab
          label="جميع الطلبات"
          count={dummyCards.length}
          icon={<Package width={18} height={18} />}
        />
        <PageTab
          label="طلبات جديده"
          count={3}
          icon={<CheckCircle width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={200}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={15000}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={30000}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={67}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={1}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={0}
          icon={<Truck width={18} height={18} />}
        />
        <PageTab
          label="في الشحن"
          count={2}
          icon={<Truck width={18} height={18} />}
        />
      </div>

      {/* Filter Section */}
      <FilterSection filters={filters} onChange={handleFilterChange} />

      {/* Orders Grid */}
      <div className="flex gap-6 flex-wrap">
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
