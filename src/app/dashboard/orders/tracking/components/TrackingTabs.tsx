'use client';

import { useMemo } from 'react';
import {
  LiaClipboardListSolid,
  LiaClockSolid,
  LiaCheckDoubleSolid,
} from 'react-icons/lia';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { TrackingCard as TrackingCardType } from '@/types/logistics';
import TrackingCard from './TrackingCard';
import TrackingEmptyState from './TrackingEmptyState';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const now = new Date().toISOString();

const initialMockCards: TrackingCardType[] = [
  {
    id: 1,
    orderId: 101,
    orderCode: 'ORD-001',
    type: 'COURIER',
    scheduledDate: today,
    status: 'PENDING',
    courierUpdate: 'العميل مش موجود في العنوان',
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: { customers: { name: 'أحمد محمد' } as any },
  },
  {
    id: 2,
    orderId: 102,
    orderCode: 'ORD-002',
    type: 'COURIER',
    scheduledDate: today,
    status: 'PENDING',
    courierUpdate: 'تم الاتصال ولا يرد',
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: { customers: { name: 'سارة علي' } as any },
  },
  {
    id: 3,
    orderId: 103,
    orderCode: 'ORD-003',
    type: 'COURIER',
    scheduledDate: yesterday,
    status: 'OVERDUE',
    courierUpdate: 'العميل رفض الاستلام',
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: { customers: { name: 'محمد حسن' } as any },
  },
  {
    id: 4,
    orderId: 104,
    orderCode: 'ORD-004',
    type: 'COURIER',
    scheduledDate: today,
    status: 'COMPLETED',
    courierUpdate: 'تم التسليم بنجاح',
    agentStatus: 'CLOSED',
    agentFlag: 'CORRECT',
    agentNote: null,
    postponedUntil: null,
    completedAt: now,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: { customers: { name: 'فاطمة أحمد' } as any },
  },
  {
    id: 5,
    orderId: 105,
    orderCode: 'ORD-005',
    type: 'COURIER',
    scheduledDate: today,
    status: 'PENDING',
    courierUpdate: 'العنوان غير صحيح',
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: { customers: { name: 'عمر خالد' } as any },
  },
];

export default function TrackingTabs() {
  const cards = initialMockCards;

  const pendingCards = useMemo(
    () => cards.filter((c) => c.status === 'PENDING'),
    [cards]
  );
  const overdueCards = useMemo(
    () => cards.filter((c) => c.status === 'OVERDUE'),
    [cards]
  );
  const completedCards = useMemo(
    () => cards.filter((c) => c.status === 'COMPLETED'),
    [cards]
  );

  return (
    <Tabs defaultValue="pending">
      <TabsList dir="rtl">
        <TabsTrigger value="pending" className="gap-2">
          طلبات جديدة
          <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold min-w-[24px]">
            {pendingCards.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="overdue" className="gap-2">
          طلبات متأخرة
          <span className="inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold min-w-[24px] data-[state=active]:bg-white/20 data-[state=active]:text-white">
            {overdueCards.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="gap-2">
          طلبات منفذة
          <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-bold min-w-[24px] data-[state=active]:bg-white/20 data-[state=active]:text-white">
            {completedCards.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" dir="rtl">
        {pendingCards.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingCards.map((card) => (
              <TrackingCard
                key={card.id}
                card={card}
              />
            ))}
          </div>
        ) : (
          <TrackingEmptyState
            message="تم إنهاء جميع مهام المتابعة لليوم"
            icon={<LiaClipboardListSolid />}
          />
        )}
      </TabsContent>

      <TabsContent value="overdue" dir="rtl">
        {overdueCards.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {overdueCards.map((card) => (
              <TrackingCard
                key={card.id}
                card={card}
              />
            ))}
          </div>
        ) : (
          <TrackingEmptyState
            message="لا توجد طلبات متأخرة"
            icon={<LiaClockSolid />}
          />
        )}
      </TabsContent>

      <TabsContent value="completed" dir="rtl">
        {completedCards.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedCards.map((card) => (
              <TrackingCard
                key={card.id}
                card={card}
              />
            ))}
          </div>
        ) : (
          <TrackingEmptyState
            message="لم يتم إكمال أي مهام بعد اليوم"
            icon={<LiaCheckDoubleSolid />}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
