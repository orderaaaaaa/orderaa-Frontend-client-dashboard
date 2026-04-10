'use client';

import { useRef, useEffect, useState } from 'react';
import { Order, OrderEvent } from '@/types/orders';
import { getTimeAgo } from '@/utils/timeAgo';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { POST_SHIPPING_STATUSES } from '@/types/logistics';
import { LiaTruckSolid, LiaHeadsetSolid, LiaExclamationTriangleSolid } from 'react-icons/lia';
import clsx from 'clsx';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';


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

interface MappedEvent {
  id: number;
  status: string;
  date: string;
  rawDate: string;
  time: string;
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

function buildFullTimeline(events: MappedEvent[]): DayGroup[] {
  if (events.length === 0) return [];

  const todayKey = new Date().toISOString().split('T')[0];
  const yesterdayKey = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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
  const endDate = new Date(todayKey + 'T12:00:00Z');

  while (current <= endDate) {
    const key = current.toISOString().split('T')[0];
    let label: string;
    if (key === todayKey) {
      label = 'اليوم';
    } else if (key === yesterdayKey) {
      label = 'أمس';
    } else {
      label = current.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
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

function ChatBubble({
  event,
  isAgent,
}: {
  event: MappedEvent;
  isAgent: boolean;
}) {
  return (
    <div className={clsx('flex items-end gap-2 mb-3', isAgent ? 'justify-end' : 'justify-start')}>
      {!isAgent && (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <LiaTruckSolid className="w-4 h-4 text-red-600" />
        </div>
      )}
      <div
        className={clsx(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
          isAgent
            ? 'bg-primary text-white rounded-bl-sm'
            : 'bg-gray-200 text-gray-900 rounded-br-sm'
        )}
      >
        <p className="font-medium">{event.note || event.status}</p>
        <p className={clsx('text-xs mt-1', isAgent ? 'text-white/70' : 'text-gray-500')}>
          {event.time}
        </p>
      </div>
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <LiaHeadsetSolid className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}

function LogisticsChat({ events, scrollToEnd }: { events: MappedEvent[]; scrollToEnd?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeline = buildFullTimeline(events);

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
        لا توجد تحديثات
      </p>
    );
  }

  return (
    <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 p-4 max-h-[500px] overflow-y-auto">
      {timeline.map((group) => (
        <div key={group.dateKey}>
          <div className="flex items-center justify-center my-4">
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-4 py-1.5 rounded-full">
              {group.dateLabel}
            </span>
          </div>

          {group.events.length > 0 ? (
            group.events.map((event) => (
              <ChatBubble
                key={event.id}
                event={event}
                isAgent={!isLogisticsEvent(event)}
              />
            ))
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
    const statusLabel = event.name ? getStatusLabel(event.name) : 'حدث';
    const createdDate = new Date(event.createdAt);
    return {
      id: event.id || index + 1,
      status: statusLabel,
      date: createdDate.toLocaleDateString('ar-EG'),
      rawDate: createdDate.toISOString().split('T')[0],
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

  const todayISO = new Date().toISOString().split('T')[0];
  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgoISO = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

  // TODO: Remove mock data when backend provides real logistics events
  const mockLogisticsEvents: MappedEvent[] = isPostShipping
    ? [
      { id: 9001, status: 'شحن', rawDate: twoDaysAgoISO, date: '', time: 'منذ يومين', eventType: 'SHIPPING', note: 'تم استلام الشحنة من المخزن', employee: { name: 'المندوب', department: 'COURIER' } },
      { id: 9002, status: 'متابعة', rawDate: twoDaysAgoISO, date: '', time: 'منذ يومين', eventType: 'ATTEMPTED', note: 'هتابع', employee: { name: 'أحمد', department: 'CALL_CENTER' } },
      { id: 9003, status: 'شحن', rawDate: yesterdayISO, date: '', time: 'أمس', eventType: 'WITH_DRIVER', note: 'العميل لا يرد', employee: { name: 'المندوب', department: 'COURIER' } },
      { id: 9004, status: 'متابعة', rawDate: yesterdayISO, date: '', time: 'أمس', eventType: 'ATTEMPTED', note: 'هتابع', employee: { name: 'سارة', department: 'CALL_CENTER' } },
      { id: 9005, status: 'متابعة', rawDate: yesterdayISO, date: '', time: 'أمس', eventType: 'ATTEMPTED', note: 'تاجيل لامتي', employee: { name: 'سارة', department: 'CALL_CENTER' } },
      { id: 9006, status: 'شحن', rawDate: yesterdayISO, date: '', time: 'أمس', eventType: 'WITH_DRIVER', note: 'تأجيل إلى (2026-4-7) والسبب هو (الرقم لا يرد)', employee: { name: 'المندوب', department: 'COURIER' } },
      { id: 9007, status: 'متابعة', rawDate: yesterdayISO, date: '', time: 'أمس', eventType: 'ATTEMPTED', note: 'هتابع', employee: { name: 'أحمد', department: 'CALL_CENTER' } },
      { id: 9008, status: 'متابعة', rawDate: yesterdayISO, date: '', time: 'أمس', eventType: 'ATTEMPTED', note: 'هتابع', employee: { name: 'أحمد', department: 'CALL_CENTER' } },
      // { id: 9009, status: 'شحن', rawDate: todayISO, date: '', time: 'منذ ساعة', eventType: 'WITH_DRIVER', note: 'تأجيل إلى (2026-4-9) والسبب هو (الرقم لا يرد)', employee: { name: 'المندوب', department: 'COURIER' } },
      // { id: 9010, status: 'متابعة', rawDate: todayISO, date: '', time: 'منذ 30 دقيقة', eventType: 'ATTEMPTED', note: 'هتابع', employee: { name: 'سارة', department: 'CALL_CENTER' } },
      // { id: 9011, status: 'متابعة', rawDate: todayISO, date: '', time: 'منذ 15 دقيقة', eventType: 'ATTEMPTED', note: 'هتابع', employee: { name: 'أحمد', department: 'CALL_CENTER' } },
    ]
    : [];

  const realLogisticsEvents = events.filter((e) => isLogisticsEvent(e));
  const logisticsEvents = isPostShipping
    ? (realLogisticsEvents.length > 0 ? realLogisticsEvents : mockLogisticsEvents)
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
          <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-2 gap-4" onValueChange={(val) => setLogisticsOpen(val.includes('logistics'))}>
            <AccordionItem value="call-center" className="!border border-gray-200 rounded-lg self-start">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-100/50">
                <div className="flex items-center gap-2">
                  <LiaHeadsetSolid className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-[#1F1F1F]">تحديثات مركز الاتصال</span>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logistics" className="!border border-gray-200 rounded-lg self-start">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-100/50">
                <div className="flex items-center gap-2">
                  <LiaTruckSolid className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-bold text-[#1F1F1F]">تحديثات اللوجستيك / المندوب</span>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    {logisticsEvents.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <LogisticsChat events={logisticsEvents} scrollToEnd={logisticsOpen} />
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
