import { OrderStatus } from '../types/customer';

export const getStatusColor = (status?: OrderStatus) => {
  if (!status) {
    return 'bg-gray-50 text-gray-600 border border-gray-200';
  }

  const STATUS_COLORS: Record<OrderStatus, string> = {
    NEW_ORDER: 'bg-blue-50 text-blue-700 border border-blue-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
    WHATSAPP: 'bg-purple-50 text-purple-700 border border-purple-200',
    CALL_AGAIN: 'bg-purple-50 text-purple-700 border border-purple-200',

    PREPARED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    SHIPPING: 'bg-indigo-50 text-indigo-700 border border-indigo-200',

    DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
    RETURNED_DELIVERED: 'bg-green-50 text-green-700 border border-green-200',

    ATTEMPTED: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    WAITING_FOR_PAYMENT:
      'bg-yellow-50 text-yellow-700 border border-yellow-200',
    POSTPONED: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    PARTIAL_DELIVERY: 'bg-yellow-50 text-yellow-700 border border-yellow-200',

    CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
    STOPPED: 'bg-red-50 text-red-700 border border-red-200',
    UNCOMPLETED: 'bg-red-50 text-red-700 border border-red-200',
    MISSING: 'bg-red-50 text-red-700 border border-red-200',
  };

  return STATUS_COLORS[status];
};
