const DEFAULT_COLOR = 'bg-gray-50 text-gray-600 border border-gray-200';

const STATUS_COLORS: Record<string, string> = {
  NEW_ORDER: 'bg-blue-50 text-[#5686e1] border border-blue-100',
  CONFIRMED: 'bg-blue-50 text-[#5686e1] border border-blue-100',
  WHATSAPP: 'bg-purple-50 text-purple-700 border border-purple-200',
  WHATSAPP_CONFIRMED: 'bg-green-50 text-[#49c116] border border-green-200',
  CALL_AGAIN: 'bg-purple-50 text-purple-700 border border-purple-200',

  PREPARED: 'bg-primary/10 text-primary border border-primary/10',
  SHIPPING: 'bg-primary/10 text-primary border border-primary/10',
  WITH_DRIVER: 'bg-teal-50 text-[#0f766e] border border-teal-100',
  WAITING_FOR_PACKAGING: 'bg-orange-50 text-[#ff9800] border border-orange-200',
  WAITING_FOR_APPROVAL: 'bg-orange-50 text-[#b45309] border border-orange-200',

  DELIVERED: 'bg-green-50 text-[#49c116] border border-green-200',
  COLLECTED: 'bg-green-50 text-[#15803d] border border-green-200',
  RETURNED_DELIVERED: 'bg-green-50 text-[#49c116] border border-green-200',
  RETURNED_COLLECTED: 'bg-pink-50 text-[#ec4899] border border-pink-200',
  RETURNED_SETTLED: 'bg-pink-50 text-[#db2777] border border-pink-200',
  RETURNED_FINAL: 'bg-rose-50 text-[#be123c] border border-rose-200',

  ATTEMPTED: 'bg-orange-50 text-[#ff9800] border border-orange-200',
  WAITING_FOR_PAYMENT: 'bg-orange-50 text-[#ff9800] border border-orange-200',
  POSTPONED: 'bg-orange-50 text-[#ff9800] border border-orange-200',
  EDIT_REJECTED: 'bg-cyan-50 text-[#0097a7] border border-cyan-200',

  CANCELLED: 'bg-red-50 text-[#ff0004] dark:text-danger-text border border-red-200',
  STOPPED: 'bg-red-50 text-[#ff0004] dark:text-danger-text border border-red-200',
  UNCOMPLETED: 'bg-red-50 text-[#ff0004] dark:text-danger-text border border-red-200',
  MISSING: 'bg-red-50 text-[#ff0004] dark:text-danger-text border border-red-200',

  // Frontend-only legacy keys — not OrderStatus members.
  PARTIAL_DELIVERY: 'bg-orange-50 text-[#ff9800] border border-orange-200',
  FINAL_RETURN: 'bg-rose-50 text-[#e11d48] border border-rose-200',
  RETURN_RESEND_PENDING: 'bg-orange-50 text-[#f59e0b] border border-amber-200',
  RETURN_WAREHOUSE: 'bg-indigo-50 text-[#6366f1] border border-indigo-200',
};

export const getStatusColor = (status?: string): string => {
  if (!status) return DEFAULT_COLOR;
  return STATUS_COLORS[status] || DEFAULT_COLOR;
};
