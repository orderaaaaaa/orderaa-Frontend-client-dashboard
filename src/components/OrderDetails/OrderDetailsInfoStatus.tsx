'use client';

import { Order, OrderEvent } from '@/types/orders';
import { getTimeAgo } from '@/utils/timeAgo';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { POST_SHIPPING_STATUSES } from '@/types/logistics';


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
    name: string;
    department?: string;
  } | null;
  utmSource?: string;
  pageName?: string | null;
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
  utmSource,
  pageName,
}: EventCardProps) {
  const { classes, Icon } = getStatusBadgeConfig(eventType);
  const iconColor = getIconColorFromClasses(classes);

  return (
    <div className="flex gap-2 bg-white p-3 rounded-lg min-w-[180px] hover:shadow-md transition-shadow w-full">
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />

      <div className="flex flex-col gap-1 min-w-0 w-full">
        <p className="text-sm font-bold text-[#1F1F1F] break-words">
          {status}
        </p>

        {utmSource && (
          <p className="text-sm text-black break-words">
            المصدر: <span className="text-primary font-medium">{utmSource}</span>
          </p>
        )}

        {pageName && (
          <p className="text-sm text-black break-words">
            اسم الصفحة: <span className="text-primary font-medium">{pageName}</span>
          </p>
        )}

        {note && (
          <p className="text-sm text-red-500 break-words whitespace-pre-wrap">
            {note}
          </p>
        )}

        <p className="text-sm text-black break-words">
          {date}
          {time && (
            <>
              {' • '}
              <span className="text-primary">{time}</span>
            </>
          )}
        </p>

        {employee && (
          <p className="text-sm text-black break-words">
            اسم الموظف: {employee.name}
            {employee.department && (
              <p> قسم: {getDepartmentLabel(employee.department)}</p>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

const LOGISTICS_DEPARTMENTS = new Set(['LOGISTICS', 'COURIER', 'SHIPPING']);
const LOGISTICS_EVENT_NAMES = new Set(['SHIPPING', 'WITH_DRIVER', 'DELIVERED', 'RETURNED_DELIVERED']);

function isLogisticsEvent(event: {
  eventType: string;
  employee?: { name: string; department?: string } | null;
}): boolean {
  if (event.employee?.department && LOGISTICS_DEPARTMENTS.has(event.employee.department)) {
    return true;
  }
  return LOGISTICS_EVENT_NAMES.has(event.eventType);
}

function OrderDetailsInfoStatus({ order }: OrderDetailsInfoStatusProps) {
  const { getStatusLabel } = useStatusLabel();
  const allEvents = order.order_events || [];
  const isPostShipping = POST_SHIPPING_STATUSES.has(order.status);

  const events = allEvents.map((event: OrderEvent, index: number) => {
    const statusLabel = event.name ? getStatusLabel(event.name) : 'حدث';
    return {
      id: event.id || index + 1,
      status: statusLabel,
      date: new Date(event.createdAt).toLocaleDateString('ar-EG'),
      time: getTimeAgo(event.createdAt),
      eventType: event.name || 'NEW_ORDER',
      note: event.note || null,
      employee: event.employee,
      utmSource: undefined as string | undefined,
      pageName: undefined as string | null | undefined,
    };
  });

  if (events.length > 0) {
    if (order.utmSource) {
      events[events.length - 1].utmSource = order.utmSource;
    }
    if (order.pageName) {
      events[events.length - 1].pageName = order.pageName;
    }
  }

  const callCenterEvents = isPostShipping
    ? events.filter((e) => !isLogisticsEvent(e))
    : [];
  const logisticsEvents = isPostShipping
    ? events.filter((e) => isLogisticsEvent(e))
    : [];

  return (
    <div>
      <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg text-primary font-bold">سجل الأحداث</h2>
            <p className="border-1 border-primary text-primary w-6 h-6 text-sm text-center rounded-full flex items-center justify-center">
              {events.length - 1}
            </p>
          </div>
        </div>

        {isPostShipping ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F1F1F] mb-2">
                تحديثات مركز الاتصال
              </h3>
              <div className="flex flex-col gap-3">
                {callCenterEvents.map((item) => (
                  <EventCard
                    key={item.id}
                    eventType={item.eventType}
                    status={item.status}
                    note={item.note}
                    date={item.date}
                    time={item.time}
                    employee={item.employee}
                    utmSource={item.utmSource}
                    pageName={item.pageName}
                  />
                ))}
                {callCenterEvents.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    لا توجد تحديثات
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F1F1F] mb-2">
                تحديثات اللوجستيك / المندوب
              </h3>
              <div className="flex flex-col gap-3">
                {logisticsEvents.map((item) => (
                  <EventCard
                    key={item.id}
                    eventType={item.eventType}
                    status={item.status}
                    note={item.note}
                    date={item.date}
                    time={item.time}
                    employee={item.employee}
                    utmSource={item.utmSource}
                    pageName={item.pageName}
                  />
                ))}
                {logisticsEvents.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    لا توجد تحديثات
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
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
                utmSource={item.utmSource}
                pageName={item.pageName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetailsInfoStatus;
