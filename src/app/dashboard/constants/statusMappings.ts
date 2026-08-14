/**
 * Fallback status labels, used when the `/lookups/order-statuses` dictionary has
 * not loaded yet and by the call sites that read this map without the
 * `useStatusLabel` hook.
 *
 * Backend `src/i18n/ar/orders.json` -> `ORDER_STATUS` is the single source of
 * truth: when the two disagree, the backend text wins. Keep the entries for real
 * `OrderStatus` members byte-identical to it.
 *
 * The trailing block holds frontend-only legacy keys that the backend enum does
 * not contain. They are still referenced by live code (returns-receiving,
 * print-orders, order history), so they stay.
 */
export const ORDER_STATUS_ARABIC_LABELS: Record<string, string> = {
  NEW_ORDER: 'طلب جديد',
  WHATSAPP_CONFIRMED: 'تم التأكيد عبر واتساب',
  ATTEMPTED: 'تم المحاولة',
  WAITING_FOR_PAYMENT: 'في انتظار الدفع',
  WHATSAPP: 'واتساب',
  CALL_AGAIN: 'اعادة الاتصال',
  EDIT_REJECTED: 'رفض التعديل',
  POSTPONED: 'تأجيلات',
  STOPPED: 'وقف التشغيل',
  CANCELLED: 'تم الالغاء',
  UNCOMPLETED: 'غير مكتمل',
  CONFIRMED: 'تم التأكيد',
  WAITING_FOR_PACKAGING: 'في انتظار التغليف',
  PREPARED: 'تم التحضير',
  WAITING_FOR_APPROVAL: 'انتظار قبول شركة الشحن',
  SHIPPING: 'في الشحن',
  WITH_DRIVER: 'مع المندوب',
  DELIVERED: 'تم التسليم',
  RETURNED_DELIVERED: 'مرتجع في الشركه',
  RETURNED_COLLECTED: 'مرتجع مسلم',
  COLLECTED: 'تم التحصيل',
  RETURNED_SETTLED: 'مرتجع تم التحصيل',
  RETURNED_FINAL: 'مرتجع نهائي',
  MISSING: 'طلبات مفقوده',

  // Frontend-only legacy keys — not OrderStatus members.
  PARTIAL_DELIVERY: 'تسليم جزئي',
  FINAL_RETURN: 'مرتجع نهائي',
  RETURN_RESEND_PENDING: 'إعادة إرسال',
  // Took over the wording RETURNED_COLLECTED vacated: 'مرتجع مسلم' now belongs
  // to RETURNED_COLLECTED alone, and this key describes exactly this text.
  RETURN_WAREHOUSE: 'مرتجع مستلم بالمخزن',
};

export const ORDER_STATUS_CHART_COLORS: Record<string, string> = {
  NEW_ORDER: '#3b82f6',
  ATTEMPTED: '#8b5cf6',
  WAITING_FOR_PAYMENT: '#f59e0b',
  WHATSAPP: '#22c55e',
  WHATSAPP_CONFIRMED: '#16a34a',
  EDIT_REJECTED: '#0097a7',
  POSTPONED: '#6366f1',
  CALL_AGAIN: '#14b8a6',
  STOPPED: '#9ca3af',
  CANCELLED: '#ef4444',
  UNCOMPLETED: '#f97316',
  CONFIRMED: '#10b981',
  WAITING_FOR_PACKAGING: '#ff9800',
  PREPARED: '#7c3aed',
  WAITING_FOR_APPROVAL: '#ff9800',
  SHIPPING: '#06b6d4',
  WITH_DRIVER: '#0ea5e9',
  RETURNED_DELIVERED: '#ec4899',
  RETURNED_COLLECTED: '#f472b6',
  RETURNED_SETTLED: '#db2777',
  RETURNED_FINAL: '#be123c',
  DELIVERED: '#059669',
  COLLECTED: '#15803d',
  MISSING: '#dc2626',

  // Frontend-only legacy keys — not OrderStatus members.
  PARTIAL_DELIVERY: '#d97706',
  FINAL_RETURN: '#e11d48',
  RETURN_RESEND_PENDING: '#f59e0b',
  RETURN_WAREHOUSE: '#6366f1',
};
