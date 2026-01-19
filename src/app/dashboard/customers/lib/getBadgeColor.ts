const DEFAULT_COLOR = 'bg-gray-50 text-gray-600 border border-gray-200';

const STATUS_COLORS: Record<string, string> = {
  NEW_ORDER: 'bg-[#f1f5fd] text-[#5686e1] border border-[#e5ecfb]',
  CONFIRMED: 'bg-[#f1f5fd] text-[#5686e1] border border-[#e5ecfb]',
  WHATSAPP: 'bg-purple-50 text-purple-700 border border-purple-200',
  WHATSAPP_CONFIRMED: 'bg-[#effbeb] text-[#49c116] border border-[#d2f3c5]',
  CALL_AGAIN: 'bg-purple-50 text-purple-700 border border-purple-200',

  PREPARED: 'bg-[#f2edfd] text-primary border border-[#f2edfd]',
  SHIPPING: 'bg-[#f2edfd] text-primary border border-[#f2edfd]',
  WAITING_FOR_PACKAGING: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
  WAITING_FOR_APPROVAL: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',

  DELIVERED: 'bg-[#effbeb] text-[#49c116] border border-[#d2f3c5]',
  RETURNED_DELIVERED: 'bg-[#effbeb] text-[#49c116] border border-[#d2f3c5]',

  ATTEMPTED: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
  WAITING_FOR_PAYMENT: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
  POSTPONED: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
  PARTIAL_DELIVERY: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
  EDIT_REJECTED: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',

  CANCELLED: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
  STOPPED: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
  UNCOMPLETED: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
  MISSING: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
};

export const getStatusColor = (status?: string): string => {
  if (!status) return DEFAULT_COLOR;
  return STATUS_COLORS[status] || DEFAULT_COLOR;
};
