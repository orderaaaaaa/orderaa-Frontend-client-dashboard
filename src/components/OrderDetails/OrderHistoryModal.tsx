'use client';

import React from 'react';
import BaseModal from '@/components/ui/base-modal';
import { OrderEvent } from '@/types/orders';
import { PhoneOff, History, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getTimeAgo } from '@/utils/timeAgo';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: OrderEvent[];
}

const statusLabelMap: Record<string, string> = {
  NEW_ORDER: 'طلب جديد',
  ATTEMPTED: 'تمت المحاولة',
  WAITING_FOR_PAYMENT: 'في انتظار الدفع',
  WHATSAPP: 'واتساب',
  POSTPONED: 'مؤجل',
  CALL_AGAIN: 'اعادة اتصال',
  STOPPED: 'متوقف',
  CANCELLED: 'ملغي',
  UNCOMPLETED: 'غير مكتمل',
  CONFIRMED: 'مؤكد',
  PREPARED: 'تم التحضير',
  SHIPPING: 'في الشحن',
  RETURNED_DELIVERED: 'مرتجع بعد التوصيل',
  DELIVERED: 'تم التوصيل',
  PARTIAL_DELIVERY: 'توصيل جزئي',
  MISSING: 'مفقود',
  REGISTERED: 'مسجل',
  REPORTS: 'تقارير',
};

const getEventIcon = (eventType?: string) => {
  if (!eventType) {
    return <History className="w-4 h-4 text-gray-600" />;
  }

  switch (eventType) {
    case 'CONFIRMED':
    case 'DELIVERED':
    case 'PREPARED':
    case 'REGISTERED':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'CANCELLED':
    case 'STOPPED':
    case 'RETURNED_DELIVERED':
    case 'MISSING':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'POSTPONED':
    case 'WAITING_FOR_PAYMENT':
    case 'UNCOMPLETED':
    case 'PARTIAL_DELIVERY':
      return <Clock className="w-4 h-4 text-orange-600" />;
    case 'ATTEMPTED':
    case 'CALL_AGAIN':
    case 'WHATSAPP':
      return <PhoneOff className="w-4 h-4 text-blue-600" />;
    case 'SHIPPING':
      return <History className="w-4 h-4 text-purple-600" />;
    case 'NEW_ORDER':
      return <History className="w-4 h-4 text-[#5D24E1]" />;
    default:
      return <History className="w-4 h-4 text-gray-600" />;
  }
};

interface ParsedEvent {
  id: number;
  status: string;
  displayDate: string;
  timeAgo: string;
  note: string;
  eventType: string;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  events,
}: OrderHistoryModalProps) {
  const parseEvents = (): ParsedEvent[] => {
    return events.map((event, index) => {
      const statusLabel = event.status ? (statusLabelMap[event.status] || event.status) : 'حدث';
      const displayDate = new Date(event.createdAt).toLocaleDateString('ar-EG');
      const timeAgo = getTimeAgo(event.createdAt);

      return {
        id: event.id || index + 1,
        status: statusLabel,
        displayDate,
        timeAgo,
        note: event.note || statusLabel,
        eventType: event.status || 'default',
      };
    });
  };

  const parsedEvents = parseEvents();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="سجل الطلبات"
      showFooter={false}
      maxWidth="w-[900px]"
    >
      <div className="py-8 px-4">
        {parsedEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لا توجد أحداث لهذا الطلب
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <div className="flex items-start gap-16 relative px-8">
              {parsedEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="flex flex-col items-center relative min-w-[120px]"
                  style={{ zIndex: 2 }}
                >
                  {index < parsedEvents.length - 1 && (
                    <div
                      className="absolute h-[3px] bg-[#CBB5FD]"
                      style={{
                        top: '1.25rem',
                        left: '-7rem',
                        width: '10rem',
                        zIndex: 0
                      }}
                    />
                  )}

                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 border-[3px] border-[#CBB5FD] relative"
                    style={{ zIndex: 1 }}>
                    {getEventIcon(event.eventType)}
                  </div>

                  <h3 className="text-base font-semibold text-[#1F1F1F] mb-1 text-center px-2">
                    {event.status}
                  </h3>

                  {event.note !== event.status && (
                    <p className="text-sm text-[#5D24E1] text-center mb-1 max-w-[140px]">
                      {event.note}
                    </p>
                  )}

                  <p className="text-sm text-[#5F5E5E] text-center">
                    {event.displayDate}
                  </p>

                  <p className="text-xs text-[#888] text-center mt-1">
                    {event.timeAgo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
