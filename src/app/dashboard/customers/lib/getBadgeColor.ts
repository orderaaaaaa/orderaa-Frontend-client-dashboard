import { OrderStatus } from '../types/customer';

export const getStatusColor = (status?: OrderStatus) => {
  if (!status) {
    return 'bg-gray-50 text-gray-600 border border-gray-200';
  }

  const STATUS_COLORS: Record<OrderStatus, string> = {
    NEW_ORDER: 'bg-[#f1f5fd] text-[#5686e1] border border-[#e5ecfb]',
    CONFIRMED: 'bg-[#f1f5fd] text-[#5686e1] border border-[#e5ecfb]',
    WHATSAPP: 'bg-purple-50 text-purple-700 border border-purple-200',
    CALL_AGAIN: 'bg-purple-50 text-purple-700 border border-purple-200',

    PREPARED: 'bg-[#f2edfd] text-[#5d24e1] border border-[#f2edfd]',
    SHIPPING: 'bg-[#f2edfd] text-[#5d24e1] border border-[#f2edfd]',

    DELIVERED: 'bg-[#effbeb] text-[#49c116] border border-[#d2f3c5]',
    RETURNED_DELIVERED: 'bg-[#effbeb] text-[#49c116] border border-[#d2f3c5]',

    ATTEMPTED: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
    WAITING_FOR_PAYMENT: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
    POSTPONED: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',
    PARTIAL_DELIVERY: 'bg-[#fff7eb] text-[#ff9800] border border-[#ffefd8]',

    CANCELLED: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
    STOPPED: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
    UNCOMPLETED: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
    MISSING: 'bg-[#fef0ef] text-[#ff0004] border border-[#fcd4d1]',
  };

  return STATUS_COLORS[status];
};
