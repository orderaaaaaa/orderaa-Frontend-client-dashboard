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
        !order.customer.name.toLowerCase().includes(filters.customerName.toLowerCase())
      ) {
        return false;
      }

      if (filters.phone && !order.customer.phone.includes(filters.phone)) {
        return false;
      }

      if (filters.governorate && order.customer.governorate !== filters.governorate) {
        return false;
      }

      if (filters.area && order.customer.area !== filters.area) {
        return false;
      }

      if (filters.productName) {
        const hasMatchingProduct = order.orderProducts.some((op) =>
          op.product.name.toLowerCase().includes(filters.productName.toLowerCase())
        );
        if (!hasMatchingProduct) {
          return false;
        }
      }

      if (filters.sizeColor) {
        const hasMatchingSizeColor = order.orderProducts.some((op) => {
          const sizeColor = `${op.product.size || ''} ${op.product.color || ''}`.toLowerCase();
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
        order.customer.address &&
        !order.customer.address.toLowerCase().includes(filters.address.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [orders, filters]);
}
