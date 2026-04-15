'use client';

import { useMemo, useState } from 'react';
import {
  LiaClipboardListSolid,
  LiaClockSolid,
  LiaCheckDoubleSolid,
} from 'react-icons/lia';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import type { TrackingCard as TrackingCardType } from '@/types/logistics';
import { useOrderStatusesQuery } from '@/services/orders';
import TrackingCard from './TrackingCard';
import TrackingEmptyState from './TrackingEmptyState';
import { useDebounce } from '@/utils/debounce';

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
    courierName: 'محمد السائق',
    courierPhone: '01012345678',
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: {
      customers: { name: 'أحمد محمد', phone_numbers: ['01098765432'] } as any,
      totalCost: 350,
      order_products: [{ products: { name: 'صندل اديداس' }, variants: [{ label: 'اللون', value: 'أسود' }, { label: 'المقاس', value: '42' }] }] as any,
    },
  },
  {
    id: 2,
    orderId: 102,
    orderCode: 'ORD-002',
    type: 'COURIER',
    scheduledDate: today,
    status: 'PENDING',
    courierUpdate: 'تم الاتصال ولا يرد',
    courierName: 'أحمد المندوب',
    courierPhone: '01112223344',
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: {
      customers: { name: 'سارة علي', phone_numbers: ['01055566677'] } as any,
      totalCost: 500,
      order_products: [{ products: { name: 'حذاء نايك' }, variants: [{ label: 'اللون', value: 'أبيض' }, { label: 'المقاس', value: '38' }] }] as any,
    },
  },
  {
    id: 3,
    orderId: 103,
    orderCode: 'ORD-003',
    type: 'COURIER',
    scheduledDate: yesterday,
    status: 'OVERDUE',
    courierUpdate: 'العميل رفض الاستلام',
    courierName: null,
    courierPhone: null,
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: {
      customers: { name: 'محمد حسن', phone_numbers: ['01099988877'] } as any,
      totalCost: 275,
      order_products: [{ products: { name: 'شنطة يد' }, variants: [{ label: 'اللون', value: 'بني' }] }] as any,
    },
  },
  {
    id: 4,
    orderId: 104,
    orderCode: 'ORD-004',
    type: 'COURIER',
    scheduledDate: today,
    status: 'COMPLETED',
    courierUpdate: 'تم التسليم بنجاح',
    courierName: 'خالد التوصيل',
    courierPhone: '01234567890',
    agentStatus: 'CLOSED',
    agentFlag: 'CORRECT',
    agentNote: null,
    postponedUntil: null,
    completedAt: now,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: {
      customers: { name: 'فاطمة أحمد', phone_numbers: ['01011122233'] } as any,
      totalCost: 180,
      order_products: [{ products: { name: 'تيشيرت قطن' }, variants: [{ label: 'اللون', value: 'أزرق' }, { label: 'المقاس', value: 'L' }] }] as any,
    },
  },
  {
    id: 5,
    orderId: 105,
    orderCode: 'ORD-005',
    type: 'COURIER',
    scheduledDate: today,
    status: 'PENDING',
    courierUpdate: null,
    courierName: 'علي المندوب',
    courierPhone: '01555666777',
    agentStatus: null,
    agentFlag: null,
    agentNote: null,
    postponedUntil: null,
    completedAt: null,
    employeeId: null,
    employeeName: null,
    createdAt: now,
    updatedAt: now,
    order: {
      customers: { name: 'عمر خالد', phone_numbers: ['01077788899'] } as any,
      totalCost: 420,
      order_products: [{ products: { name: 'ساعة كاسيو' }, variants: [] }] as any,
    },
  },
];

function matchesSearch(card: TrackingCardType, query: string): boolean {
  const q = query.toLowerCase();
  return (
    card.orderCode.toLowerCase().includes(q) ||
    (card.order?.customers?.name as string || '').toLowerCase().includes(q) ||
    (card.courierUpdate || '').toLowerCase().includes(q)
  );
}

export default function TrackingTabs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: orderStatuses } = useOrderStatusesQuery();

  const statusOptions = useMemo(() => {
    if (!orderStatuses) return [];
    return orderStatuses.map((s) => ({ key: s.key, label: s.label }));
  }, [orderStatuses]);

  const filteredCards = useMemo(() => {
    let result: TrackingCardType[] = initialMockCards;

    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (debouncedSearch.trim()) {
      result = result.filter((c) => matchesSearch(c, debouncedSearch));
    }

    return result;
  }, [debouncedSearch, statusFilter]);

  const pendingCards = useMemo(
    () => filteredCards.filter((c) => c.status === 'PENDING'),
    [filteredCards]
  );
  const overdueCards = useMemo(
    () => filteredCards.filter((c) => c.status === 'OVERDUE'),
    [filteredCards]
  );
  const completedCards = useMemo(
    () => filteredCards.filter((c) => c.status === 'COMPLETED'),
    [filteredCards]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3" dir="rtl">
        <Input
          type="text"
          placeholder="بحث بكود الطلب أو اسم العميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          clearable
          className="flex-1"
          inputClassName="bg-white"
        />
        <SearchableSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder="الحالة"
          clearable
          onClear={() => setStatusFilter('')}
          widthClass="sm:w-48"
        />
      </div>

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
    </div>
  );
}
