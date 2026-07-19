import { Order, OrderStatus, mapOrderProductToVariantInfo } from '@/types/orders';
import { InvoiceData, InvoiceLanguage, InvoiceProduct } from '../types/invoice';

export function mapOrderToInvoice(
  order: Order,
  language: InvoiceLanguage = 'ar'
): InvoiceData {
  const products: InvoiceProduct[] = order.order_products.map((op) => {
    const info = mapOrderProductToVariantInfo(op);
    return {
      name: info.productName,
      quantity: info.quantity || 1,
      attributes: info.attributes.length > 0 ? info.attributes : undefined,
      customVariants: info.customVariants,
      sku: info.sku,
    };
  });

  const isPaid = order.paymentStatus?.toLowerCase() === 'paid';
  const isCOD = order.paymentMethod?.toLowerCase().includes('delivery') ||
                order.paymentMethod?.toLowerCase() === 'cod';

  const activeShipping = order.shipping_ids?.find((s) => s.isActive) ?? order.shipping_ids?.[0];
  const resolvedShippingId = order.shippingId || activeShipping?.shippingId || undefined;
  const resolvedShippingCompany = order.shippingCompany || activeShipping?.shippingCompany || undefined;

  return {
    orderCode: order.code || `ORD-${order.id}`,
    shippingId: resolvedShippingId,
    customer: {
      name: order.customers.name,
      governorate: order.governorate || order.customers.governorate || '',
      city: order.city || order.customers.city || '',
      phoneNumbers: order.customers.phone_numbers || [],
      address: order.address || order.customers.address || '',
    },
    products,
    shipping: {
      allowOpenShipment: true,
      paymentMethod: order.paymentMethod || (language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on delivery'),
      paymentStatus: order.paymentStatus || (language === 'ar' ? 'غير مدفوع' : 'unpaid'),
      shipmentStatus: isCOD ? 'COD' : (isPaid ? 'PAID' : 'COD'),
    },
    schedule: {
      timeFrom: order.timeFrom,
      timeTo: order.timeTo,
    },
    totalPrice: order.totalCost,
    packagingNotes: order.packagingNotes,
    shippingNotes: order.notes,
    shippingCompany: resolvedShippingCompany,
    merchantName: order.merchants?.merchantName,
    merchantGovernorate: order.merchants?.governorate,
    merchantCity: order.merchants?.city,
    area: order.customers?.area,
    shipmentContent: order.shipmentContent,
    canOpenShipment: order.canOpenShipment,
    returnShippingCost: order.returnShippingCost,
    createdAt: order.createdAt,
    shippingType: order.shippingType,
    isResend: order.status === OrderStatus.RETURN_RESEND_PENDING,
  };
}

export function mapOrdersToInvoices(
  orders: Order[],
  language: InvoiceLanguage = 'ar'
): InvoiceData[] {
  return orders.map((order) => mapOrderToInvoice(order, language));
}
