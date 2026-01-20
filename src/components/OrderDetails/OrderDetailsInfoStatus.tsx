'use client';

import { Order, OrderEvent } from '@/types/orders';
import { getTimeAgo } from '@/utils/timeAgo';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import { getRemainingTime } from '@/utils/getRemainingTime';
import { LiaClock } from 'react-icons/lia';

interface OrderDetailsInfoStatusProps {
  order: Order;
  isLockedByOther?: boolean;
}

interface EventCardProps {
  eventType: string;
  status: string;
  note: string | null;
  date: string;
  time: string;
  employee?: {
    fullName: string;
    department?: string;
  } | null;
}

const getIconColorFromClasses = (classes: string): string => {
  if (classes.includes('text-[#5686e1]')) return 'text-[#5686e1]';
  if (classes.includes('text-[#49c116]')) return 'text-[#49c116]';
  if (classes.includes('text-[#ff0004]')) return 'text-[#ff0004]';
  if (classes.includes('text-[#ff9800]')) return 'text-[#ff9800]';
  if (classes.includes('text-primary')) return 'text-primary';
  if (classes.includes('text-purple-700')) return 'text-purple-700';
  return 'text-gray-600';
};

function EventCard({
  eventType,
  status,
  note,
  date,
  time,
  employee,
}: EventCardProps) {
  const { classes, Icon } = getStatusBadgeConfig(eventType);
  const iconColor = getIconColorFromClasses(classes);

  return (
    <div className="flex gap-2 bg-white p-3 rounded-lg min-w-[180px] hover:shadow-md transition-shadow w-full">
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />

      <div className="flex flex-col gap-1 min-w-0 w-full">
        <p className="text-[14px] font-bold text-[#1F1F1F] break-words">
          {status}
        </p>

        {note && (
          <p className="text-[12px] text-red-500 break-words whitespace-pre-wrap">
            {note}
          </p>
        )}

        <p className="text-[12px] text-gray-600 break-words">
          {date}
          {time && (
            <>
              {' • '}
              <span className="text-primary">{time}</span>
            </>
          )}
        </p>

        {employee && (
          <p className="text-[11px] text-gray-500 break-words">
            {employee.fullName}
            {employee.department && (
              <span className="text-gray-400"> ({employee.department})</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function OrderDetailsInfoStatus({ order }: OrderDetailsInfoStatusProps) {
  const { getStatusLabel } = useStatusLabel();
  const allEvents = order.order_events || [];

  const events = allEvents.map((event: OrderEvent, index: number) => {
    const statusLabel = event.status ? getStatusLabel(event.status) : 'حدث';
    return {
      id: event.id || index + 1,
      status: statusLabel,
      date: new Date(event.createdAt).toLocaleDateString('ar-EG'),
      time: getTimeAgo(event.createdAt),
      eventType: event.status || 'NEW_ORDER',
      note: event.note || null,
      employee: event.employee,
    };
  });

  return (
    <div>
      <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg text-primary font-bold">سجل الأحداث</h2>
            <p className="border-1 border-primary text-primary w-6 h-6 text-sm text-center rounded-full flex items-center justify-center">
              {events.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pb-2">
          {events.map((item) => (
            <EventCard
              key={item.id}
              eventType={item.eventType}
              status={item.status}
              note={item.note}
              date={item.date}
              time={item.time}
              employee={item.employee}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsInfoStatus;
