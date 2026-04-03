import { Order } from '@/types/orders';
import { InvoiceData, InvoiceLanguage, InvoiceProduct } from '../types/invoice';

export function mapOrderToInvoice(
  order: Order,
  language: InvoiceLanguage = 'ar'
): InvoiceData {
  const products: InvoiceProduct[] = order.order_products.map((op) => {
    let variantText = op.variant;
    if (!variantText && op.variants && op.variants.length > 0) {
      variantText = op.variants.map((v) => v.value).join(' - ');
    }
    return {
      name: op.products.name,
      quantity: op.quantity || 1,
      variant: variantText,
      sku: op.sku || op.products.sku,
    };
  });

  const isPaid = order.paymentStatus?.toLowerCase() === 'paid';
  const isCOD = order.paymentMethod?.toLowerCase().includes('delivery') ||
                order.paymentMethod?.toLowerCase() === 'cod';

  return {
    orderCode: order.code || `ORD-${order.id}`,
    shippingId: order.shippingId || undefined,
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
    shippingCompany: order.shippingCompany,
    merchantName: order.merchants?.merchantName,
    merchantGovernorate: order.merchants?.governorate,
    merchantCity: order.merchants?.city,
    area: order.customers?.area,
    shipmentContent: order.shipmentContent,
    canOpenShipment: order.canOpenShipment,
    returnShippingCost: order.returnShippingCost,
    createdAt: order.createdAt,
  };
}

export function mapOrdersToInvoices(
  orders: Order[],
  language: InvoiceLanguage = 'ar'
): InvoiceData[] {
  return orders.map((order) => mapOrderToInvoice(order, language));
}
