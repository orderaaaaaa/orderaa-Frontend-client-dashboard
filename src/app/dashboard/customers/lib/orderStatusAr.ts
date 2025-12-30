import { OrderStatus } from '../types/customer';

export const ORDER_STATUS_AR: Record<OrderStatus, string> = {
  NEW_ORDER: 'طلب جديد',
  CONFIRMED: 'مؤكد',
  WHATSAPP: 'واتساب',
  CALL_AGAIN: 'اتصل لاحقًا',

  PREPARED: 'قيد التجهيز',
  SHIPPING: 'تم الشحن',

  DELIVERED: 'تم التوصيل',
  RETURNED_DELIVERED: 'تم التوصيل ثم مرتجع',

  ATTEMPTED: 'تم المحاوله',
  WAITING_FOR_PAYMENT: 'بانتظار الدفع',
  POSTPONED: 'مؤجل',
  PARTIAL_DELIVERY: 'توصيل جزئي',

  CANCELLED: 'ملغي',
  STOPPED: 'موقوف',
  UNCOMPLETED: 'غير مكتمل',
  MISSING: 'مفقود',
};
