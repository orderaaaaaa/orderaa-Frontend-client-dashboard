import { useMemo } from "react";
import { OrderFilters, Order } from "@/types/orders";

export function useFilteredOrders(
  orders: Order[],
  filters: OrderFilters
): Order[] {
  return useMemo(() => {
    return orders.filter((order) => {
      if (
        filters.customerName &&
        !order.customers.name.toLowerCase().includes(filters.customerName.toLowerCase())
      ) {
        return false;
      }

      if (filters.phone && !order.customers.phone_numbers?.some(p => p?.includes(filters.phone))) {
        return false;
      }

      if (filters.governorate && order.customers.governorate !== filters.governorate) {
        return false;
      }

      if (filters.area && order.customers.area !== filters.area) {
        return false;
      }

      if (filters.productName) {
        const hasMatchingProduct = order.order_products.some((op) =>
          op.products.name.toLowerCase().includes(filters.productName.toLowerCase())
        );
        if (!hasMatchingProduct) {
          return false;
        }
      }

      if (filters.sizeColor) {
        const hasMatchingSizeColor = order.order_products.some((op) => {
          const sizeColor = `${op.products.size || ''} ${op.products.color || ''}`.toLowerCase();
          return sizeColor.includes(filters.sizeColor.toLowerCase());
        });
        if (!hasMatchingSizeColor) {
          return false;
        }
      }

      if (
        filters.shipmentCode &&
        !order.code.includes(filters.shipmentCode)
      ) {
        return false;
      }

      if (
        filters.address &&
        order.customers.address &&
        !order.customers.address.toLowerCase().includes(filters.address.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [orders, filters]);
}
