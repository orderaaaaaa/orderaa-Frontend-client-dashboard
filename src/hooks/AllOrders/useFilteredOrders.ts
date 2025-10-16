import { useMemo } from "react";
import { OrderFilters } from "@/types/orders";

export interface Order {
  id: number;
  name: string;
  phone: string;
  government: string;
  items: string[];
  price: number;
  trys: number;
  status: string;
  city: string;
}

export function useFilteredOrders(
  orders: Order[],
  filters: OrderFilters
): Order[] {
  return useMemo(() => {
    return orders.filter((order) => {
      if (
        filters.customerName &&
        !order.name.toLowerCase().includes(filters.customerName.toLowerCase())
      ) {
        return false;
      }

      if (filters.phone && !order.phone.includes(filters.phone)) {
        return false;
      }

      if (filters.governorate && order.government !== filters.governorate) {
        return false;
      }

      if (filters.area && order.city !== filters.area) {
        return false;
      }

      if (filters.productName) {
        const hasMatchingProduct = order.items.some((item) =>
          item.toLowerCase().includes(filters.productName.toLowerCase())
        );
        if (!hasMatchingProduct) {
          return false;
        }
      }

      if (filters.sizeColor) {
        const hasMatchingSizeColor = order.items.some((item) =>
          item.toLowerCase().includes(filters.sizeColor.toLowerCase())
        );
        if (!hasMatchingSizeColor) {
          return false;
        }
      }

      if (
        filters.shipmentCode &&
        !order.id.toString().includes(filters.shipmentCode)
      ) {
        return false;
      }

      if (
        filters.address &&
        !order.city.toLowerCase().includes(filters.address.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [orders, filters]);
}
