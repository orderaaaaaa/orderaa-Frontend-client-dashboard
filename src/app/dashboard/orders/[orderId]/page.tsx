"use client";

import React, { useState } from "react";
import { OrderFilters } from "@/types/orders";
import { defaultEmptyFilters } from "../../../../hooks/AllOrders/useFilterState";
import { useFilteredOrders } from "../../../../hooks/AllOrders/useFilteredOrders";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Truck, Package, CheckCircle } from "lucide-react";
import PageTab from "@/components/ui/PageTab";
import { dummyCards } from "@/constants/orders-tabs";
import FilterSection from "../allOrdersRefactor/FilterSection/index";
import OrderDetailsInfo from "./OrderDetailsInfo";

export default function OrderDetails({ params }: { params: { code: string } }) {
  const [filters, setFilters] = useState<OrderFilters>(defaultEmptyFilters);

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const search = useSearchParams();
  const name = search.get("name") || "";
  const phone = search.get("phone") || "";
  const product = search.get("product") || "";
  const price = search.get("price") || "";
  const status = search.get("status") || "";
  const city = search.get("city") || "";
  const notes = search.get("notes") || "";

  const imageSrc = "/placeholder.jpg";

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex gap-4 md:flex-wrap overflow-x-auto hide">
          {" "}
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
        <OrderDetailsInfo />
      </DashboardLayout>
    </AuthGuard>
  );
}
