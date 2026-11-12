'use client';

import { formatWeekdayDate } from '@/utils/format';
import { DateWithRelative } from '@/components/ui/date-with-relative';
import { useRef, useEffect, useState } from 'react';
import { Order, OrderEvent } from '@/types/orders';
import { cairoDayKey } from '@/utils/timeAgo';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import {
  orderEventTitle,
  renderOrderEventNote,
} from '@/lib/orderEventNote';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import {
  CARRIER_SHIPPING_NOTE_EVENT,
  orderEventLabelOf,
} from '@/app/dashboard/orders/constants/orderEventLabels';
import { RETURNED_IN_COMPANY_TEXT } from '@/app/dashboard/customers/lib/getBadgeColor';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { POST_SHIPPING_STATUSES } from '@/types/logistics';
import { ORDER_STATUSES } from '@/lib/generated/permission-codes';
import { LiaTruckSolid, LiaHeadsetSolid, LiaExclamationTriangleSolid } from 'react-icons/lia';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { ChatAgentAvatar, ChatBubble, ChatCarrierAvatar } from '@/components/chat/ChatBubble';
import { ChatDaySeparator } from '@/components/chat/ChatDaySeparator';


interface OrderDetailsInfoStatusProps {
  order: Order;
  isLockedByOther?: boolean;
}

interface EventCardProps {
  eventType: string;
  status: string;
  note: string | null;
  createdAt: string;
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
  if (classes.includes('text-[#ff0004]')) return 'text-[#ff0004] dark:text-danger-text';
  if (classes.includes('text-[#ff9800]')) return 'text-[#ff9800]';
  if (classes.includes('text-primary-text')) return 'text-primary-text';
  if (classes.includes('text-purple-700')) return 'text-purple-700';
  if (classes.includes(RETURNED_IN_COMPANY_TEXT))
    return RETURNED_IN_COMPANY_TEXT;
  return 'text-gray-600';
};

function EventCard({
  eventType,
  status,
  note,
  createdAt,
  employee,
  utmSource,
  pageName,
}: EventCardProps) {
  const { classes, Icon } = getStatusBadgeConfig(eventType);
  const iconColor = getIconColorFromClasses(classes);

  return (
    <div className="flex gap-2 bg-card p-3 rounded-lg min-w-[180px] hover:shadow-md transition-shadow w-full">
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />

      <div className="flex flex-col gap-1 min-w-0 w-full">
        <p className="text-sm font-bold text-foreground break-words">
          {status}
        </p>

        {utmSource && (
          <p className="text-sm text-foreground break-words">
            المصدر: <span className="text-primary-text font-medium">{utmSource}</span>
          </p>
        )}

        {pageName && (
          <p className="text-sm text-foreground break-words">
            اسم الصفحة: <span className="text-primary-text font-medium">{pageName}</span>
          </p>
        )}

        {note && (
          <p className="text-sm text-red-500 break-words whitespace-pre-wrap">
            {note}
          </p>
        )}

        <p className="text-sm text-foreground break-words">
          <DateWithRelative value={createdAt} withTime={false} variant="inline" />
        </p>

        {employee && (
          <p className="text-sm text-foreground break-words">
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
const LOGISTICS_EVENT_NAMES = new Set([
  'SHIPPING',
  'WITH_DRIVER',
  'DELIVERED',
  'RETURNED_DELIVERED',
  CARRIER_SHIPPING_NOTE_EVENT,
]);

interface MappedEvent {
  id: number;
  status: string;
  createdAt: string;
  rawDate: string;
  eventType: string;
  note: string | null;
  employee?: { name: string; department?: string } | null;
  utmSource?: string;
  pageName?: string | null;
}

function isLogisticsEvent(event: {
  eventType: string;
  employee?: { name: string; department?: string } | null;
}): boolean {
  if (event.employee?.department && LOGISTICS_DEPARTMENTS.has(event.employee.department)) {
    return true;
  }
  return LOGISTICS_EVENT_NAMES.has(event.eventType);
}

interface DayGroup {
  dateKey: string;
  dateLabel: string;
  events: MappedEvent[];
  isToday: boolean;
}

const statusRank = (status: string): number =>
  (ORDER_STATUSES as readonly string[]).indexOf(status);

function buildFullTimeline(events: MappedEvent[], status: string): DayGroup[] {
  if (events.length === 0) return [];

  const todayKey = cairoDayKey(new Date());
  const yesterdayKey = cairoDayKey(new Date(new Date(todayKey + 'T12:00:00Z').getTime() - 86400000));
  const reachedDelivered = statusRank(status) >= statusRank('DELIVERED');

  const groups = new Map<string, MappedEvent[]>();
  events.forEach((event) => {
    const key = event.rawDate;
    const existing = groups.get(key);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(key, [event]);
    }
  });

  const allDates = events.map((e) => e.rawDate).sort();
  const result: DayGroup[] = [];
  const current = new Date(allDates[0] + 'T12:00:00Z');
  const lastEventKey = allDates[allDates.length - 1];
  const endKey = reachedDelivered || lastEventKey > todayKey ? lastEventKey : todayKey;
  const endDate = new Date(endKey + 'T12:00:00Z');

  while (current <= endDate) {
    const key = current.toISOString().split('T')[0];
    let label: string;
    if (key === todayKey) {
      label = 'اليوم';
    } else if (key === yesterdayKey) {
      label = 'أمس';
    } else {
      label = formatWeekdayDate(current);
    }

    result.push({
      dateKey: key,
      dateLabel: label,
      events: groups.get(key) || [],
      isToday: key === todayKey,
    });

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
}

function LogisticsChat({ events, status, scrollToEnd }: { events: MappedEvent[]; status: string; scrollToEnd?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeline = buildFullTimeline(events, status);

  useEffect(() => {
    if (scrollToEnd) {
      const timer = setTimeout(() => {
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [scrollToEnd]);

  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        لا توجد تحديثات شحن بعد
      </p>
    );
  }

  return (
    <div ref={containerRef} className="bg-card rounded-xl border border-gray-200 p-4 max-h-[500px] overflow-y-auto">
      {timeline.map((group) => (
        <div key={group.dateKey}>
          <ChatDaySeparator label={group.dateLabel} />

          {group.events.length > 0 ? (
            group.events.map((event) => {
              const isAgent = !isLogisticsEvent(event);
              return (
                <ChatBubble
                  key={event.id}
                  side={isAgent ? 'end' : 'start'}
                  avatar={isAgent ? <ChatAgentAvatar /> : <ChatCarrierAvatar />}
                  time={<DateWithRelative value={event.createdAt} variant="inline" />}
                >
                  <p className="font-medium">{event.note || event.status}</p>
                </ChatBubble>
              );
            })
          ) : group.isToday ? (
            <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-2 mb-3">
              <LiaTruckSolid className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-400">لا توجد تحديثات حتى الآن</p>
            </div>
          ) : (
            <div className="border border-red-300 bg-red-50 rounded-xl p-4 flex items-center justify-center gap-2 mb-3">
              <LiaExclamationTriangleSolid className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-500">لا توجد تحديثات</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function OrderDetailsInfoStatus({ order }: OrderDetailsInfoStatusProps) {
  const { getStatusLabel } = useStatusLabel();
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const allEvents = order.order_events || [];
  const isPostShipping = POST_SHIPPING_STATUSES.has(order.status);

  const events: MappedEvent[] = allEvents.map((event: OrderEvent, index: number) => {
    const statusLabel = event.name
      ? (orderEventLabelOf(event.name) ?? orderEventTitle(event.name, getStatusLabel))
      : 'حدث';
    const createdDate = new Date(event.createdAt);
    return {
      id: event.id || index + 1,
      status: statusLabel,
      createdAt: event.createdAt,
      rawDate: cairoDayKey(createdDate),
      eventType: event.name || 'NEW_ORDER',
      note: renderOrderEventNote(event.name, event.note),
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

  const realLogisticsEvents = events.filter((e) => isLogisticsEvent(e));
  const logisticsEvents = isPostShipping ? realLogisticsEvents : [];

  return (
    <div>
      <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg text-primary-text font-bold">سجل الأحداث</h2>
            <p className="border-1 border-primary text-primary-text w-6 h-6 text-sm text-center rounded-full flex items-center justify-center">
              {events.length}
            </p>
          </div>
        </div>

        {isPostShipping ? (
          <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-2 gap-4" onValueChange={(val) => setLogisticsOpen(val.includes('logistics'))}>
            <AccordionItem value="call-center" className="!border border-gray-200 rounded-lg self-start">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-100/50">
                <div className="flex items-center gap-2">
                  <LiaHeadsetSolid className="w-5 h-5 text-primary-text" />
                  <span className="text-sm font-bold text-foreground">تحديثات مركز الاتصال</span>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-primary/10 text-primary-text text-xs font-bold">
                    {callCenterEvents.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex flex-col gap-3">
                  {callCenterEvents.map((item) => (
                    <EventCard
                      key={item.id}
                      eventType={item.eventType}
                      status={item.status}
                      note={item.note}
                      createdAt={item.createdAt}
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logistics" className="!border border-gray-200 rounded-lg self-start">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-100/50">
                <div className="flex items-center gap-2">
                  <LiaTruckSolid className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-bold text-foreground">تحديثات اللوجستيك / المندوب</span>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    {logisticsEvents.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <LogisticsChat events={logisticsEvents} status={order.status} scrollToEnd={logisticsOpen} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="flex flex-wrap gap-3 pb-2">
            {events.map((item) => (
              <EventCard
                key={item.id}
                eventType={item.eventType}
                status={item.status}
                note={item.note}
                createdAt={item.createdAt}
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
