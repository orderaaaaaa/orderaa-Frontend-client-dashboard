import { useMemo } from "react";
import { OrderFilters } from "@/types/orders";

// Display format for orders (used in OrderCard)
export interface OrderDisplay {
  id: number;
  name: string;
  phone: string;
  government: string;
  items: string[];
  price: number;
  trys: number;
  status: string;
  city: string;
  alert?: number;
}

export function useFilteredOrders(
  orders: OrderDisplay[],
  filters: OrderFilters
): OrderDisplay[] {
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
