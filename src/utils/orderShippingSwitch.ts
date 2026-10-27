import type { Order } from '@/types/orders';

export const orderHasCustomerPhone = (order: Pick<Order, 'customers'>) =>
  (order.customers?.phone_numbers ?? []).some((phone) => phone.trim().length > 0);

export const activeShippingIdOf = (order: Pick<Order, 'shipping_ids'>) =>
  order.shipping_ids?.find((row) => row.isActive)?.shippingId;

export const attestedIntegrationShipmentOf = (order: Order) => {
  const carrier = order.shippingCompanyRef;
  if (!carrier || carrier.kind !== 'INTEGRATION') return null;
  const active = order.shipping_ids?.find((row) => row.isActive);
  if (!active) return null;
  return { shippingId: active.shippingId, carrierName: carrier.name };
};
